require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { TEST_MODE, DRY_RUN } = require('./settings');
const { postTestTweets, simulateTweetLogic } = require('./tests/testTweet');
const { fetchTweetsFilter } = require('./config/twitterConfig'); 
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

    console.log('🚀 PROD mode — fetching real tweets from Twitter API');

    const tweets = await fetchTweetsFilter();

    for (const { user, tweet } of tweets) {
      await channel.send({
        content: `📢 New promo code from @${user}:\n\nhttps://x.com/${user}/status/${tweet.id}`
      });

      // Optional: auto-delete after 10s
      setTimeout(() => {
        channel.messages.fetch({ limit: 1 }).then(messages => {
          const first = messages.first();
          if (first?.author.bot) first.delete().catch(console.error);
        });
      }, 10000);
    }

  } catch (err) {
    console.error('❌ Error during startup:', err);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);