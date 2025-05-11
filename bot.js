require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { TEST_MODE } = require('./settings');

// ✅ Import your testTweet function from tests/
const { postTestTweet } = require('./tests/testTweet');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);

    if (TEST_MODE) {
      console.log('🧪 TEST_MODE is enabled — running testTweet');
      await postTestTweet(channel);
    }
  } catch (err) {
    console.error('❌ Error during startup:', err);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);