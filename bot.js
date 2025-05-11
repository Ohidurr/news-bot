require ('dotenv').config()
const TEST_MODE = true; // use false to use real api call.

const { Client, GatewayIntentBits } = require('discord.js');
const { TwitterApi } = require('twitter-api-v2');

const client = new Client({intents: [GatewayIntentBits.Guilds]});
const twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN).readOnly;

const accounts = ['GenshinImpact','HonkaiStar Rail','MarvelRivals'];
const keywords = ['code','redeem','primogem','stellar jade','gift','reward','login','free','primo','gems'];
const posted = new Set();
async function checkTweets() {
    console.log('🔍 Running test fetch for 1 tweet...');
  
    try {
      const user = 'GenshinImpact'; // only test one account
      const { data: userData } = await twitter.v2.userByUsername(user);
  
      console.log(`✅ Fetched user: ${userData.username} (ID: ${userData.id})`);
  
      const { data: tweets } = await twitter.v2.userTimeline(userData.id, {
        max_results: 1,
        exclude: ['retweets', 'replies']
      });
  
      if (!tweets || tweets.length === 0) {
        console.log('⚠️ No tweets returned.');
        return;
      }
  
      const tweet = tweets[0];
      console.log('📝 Tweet content:', tweet.text);
  
      const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
      await channel.send(`📢 Test Tweet:\nhttps://x.com/${user}/status/${tweet.id}`);
      console.log('✅ Posted to Discord!');
  
    } catch (err) {
      console.error('❌ Error during test fetch:', err);
    }
  }
// async function checkTweets () {
//      // TEST MODE v 
        async function checkTweets() {
            if (TEST_MODE) {
                console.log('test enabled, not using api')
                await postTestTweet();
                return;
            }
            
        }
        // test mode end ^ 
//     for (const user of accounts ) {
//         try { 
//             const { data: userData } = await twitter.v2.userByUsername(user)
//             const { data: tweets } = await twitter.v2.userTimeline(userData.id, {
//                 max_results: 1,
//                 exclude: ['retweets', 'replies']
//             });
//             if (!tweets) continue;

//             for(const tweet of tweets) {
//                 const content = tweet.text.toLowerCase();
//                 if (keywords.some(k => content.includes(k)) && !posted.has(tweet.id)) {
//                     const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
//                     await channel.send (`yerr ya ded gots a new code from @${user}:\nhttps://x.com/${user}/status/${tweet.id}`);
//                     posted.add(tweet.id);
//                 }
//             }
//         } catch (err){
//             console.error (`Error checking @${user}:`, err)
//         }
//     }
// }
client.once('ready',async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    await checkTweets();
    setInterval(checkTweets, 1000 * 60 * 10)
})
 client.on('messageCreate', async (message) =>{
    if(message.contnet === '!testpromo' && !message.author.bot){
        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        await channel.send('test promo from gangta bot: FREE PRIMOGEMS')
    }
 })

client.login(process.env.DISCORD_BOT_TOKEN)

çç