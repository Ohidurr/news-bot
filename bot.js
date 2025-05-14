require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { TEST_MODE, DRY_RUN } = require('./settings');
const { postTestTweets, simulateTweetLogic } = require('./tests/testTweet');
const { fetchRss } = require('./config/rssConfig'); // ✅ RSS logic here

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ✅ RSS polling logic
async function runProd(channel) {
  console.log(`⏱️ [${new Date().toLocaleTimeString()}] Polling RSS feeds...`);

  try {
    const matches = await fetchRss();

    if (matches.length === 0) {
      console.log('ℹ️ No new promo tweets found.');
      return;
    }

    for (const { source, item } of matches) {
      await channel.send(`📢 New promo from ${source}:\n${item.link}`);
      console.log(`✅ Posted from ${source}: ${item.title}`);
    }
  } catch (err) {
    console.error('❌ Error during RSS polling:', err.message);
  }
}

// ✅ Bot entry point
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);

    if (DRY_RUN) {
      console.log('🧪 DRY_RUN is enabled — running logic without posting');
      await simulateTweetLogic(channel);
      return;
    }

    if (TEST_MODE) {
      console.log('🧪 TEST_MODE is enabled — posting mock tweets to Discord');
      await postTestTweets(channel);
      return;
    }

    // 🚀 Initial fetch
    await runProd(channel);

    // 🔁 Poll every 15 minutes
    setInterval(() => runProd(channel), 1000 * 60 )//* 15);

  } catch (err) {
    console.error('❌ Error during startup:', err.message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);