require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { TEST_MODE, DRY_RUN } = require('./settings');
const { postTestTweets, simulateTweetLogic } = require('./tests/testTweet');
const { fetchTweetsFilter } = require('./config/twitterConfig'); // ✅ Corrected name

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ✅ Production runner with polling
async function runProd(channel) {
  console.log(`⏱️ [${new Date().toLocaleTimeString()}] Polling for new tweets...`);

  try {
    const tweets = await fetchTweetsFilter();

    if (tweets.length === 0) {
      console.log('ℹ️ No new tweets found.');
      return;
    }

    for (const { user, tweet } of tweets) {
      await channel.send({
        content: `📢 New promo code from @${user}:\n\nhttps://x.com/${user}/status/${tweet.id}`
      });

      console.log(`✅ Posted tweet from @${user}: ${tweet.text}`);

      // Optional: auto-delete after 15 seconds
      setTimeout(() => {
        channel.messages.fetch({ limit: 1 }).then(messages => {
          const first = messages.first();
          if (first?.author.bot) first.delete().catch(console.error);
        });
      }, 15000);
    }
  } catch (err) {
    console.error('❌ Error during polling:', err);
  }
}

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

    // ✅ Initial PROD fetch
    await runProd(channel);

    // 🔁 Schedule polling every 15 minutes
    setInterval(() => runProd(channel), 1000 * 60 * 15);

  } catch (err) {
    console.error('❌ Error during startup:', err);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);