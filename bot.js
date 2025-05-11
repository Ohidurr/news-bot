require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { TEST_MODE, DRY_RUN } = require('./settings');

// ✅ Import your testTweet function from tests/
const { postTestTweets, simulateTweetLogic } = require('./tests/testTweet');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

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
  
      console.log('🚀 PROD mode — no test flags enabled. Implement live Twitter fetch here.');
      // await fetchTweetsAndPost(channel); // Future: real Twitter posting logic
  
    } catch (err) {
      console.error('❌ Error during startup:', err);
    }
  });

client.login(process.env.DISCORD_BOT_TOKEN);