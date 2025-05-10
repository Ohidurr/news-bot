// require dot env,  declare vars
require ('dotenv').config
const { Client, GatewayIntentBits } = require('discord.js');
const { TwitterApi } = require('twitter-api-v2').default;

const client = new Client({intents: [GatewayIntentBits.Guilds]});
console.log(require('twitter-api-v2'));
const twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN).readOnly;

const accounts = ['Genshin Impact','HonkaiStar Rail','MarvelRivals'];
const keywords = ['code','redeem','primogem','stellar jade','gift','reward','login'];
const posted = new Set();

async function checkTweets () {
    for (const user of accounts ) {
        try { 
            const { data: userData } = await twitter.v2.userByUsername(user)
            const { data: tweets } = await twitter.v2.userTimeline(userData.id, {
                max_results: 3,
                exclude: ['retweets', 'replies']
            });
            if (!tweets) continue;

            for(const tweet of tweets) {
                const content = tweet.text.toLowerCase();
                if (keywords.some(k => content.includes(k)) && !posted.has(tweet.id)) {
                    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
                    await channel.send (`yerr ya ded gots a new code from @${user}:\nhttps://x.com/${user}/status/${tweet.id}`);
                    posted.add(tweet.id);
                }
            }
        } catch (err){
            console.error (`Error checking @${user}:`, err)
        }
    }
}
client.once('ready'), () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    setInterval(checkTweets, 1000 * 60 * 10)
}

client.login(process.env.DISCORD_BOT_TOKEN)

