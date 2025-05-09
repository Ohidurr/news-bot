// require dot env,  declare vars
require ('dotenv').config
const { Client, GatewayIntentBits } = require('discord.js')
const { TwitterAPi } = require('twitter-api-v2');

const client = new Client({intents: [GatewayIntentBits.Guilds]})
const twitter = new TwitterAPi(proccess.env.TWITTER_BEARER_TOKEN).readOnly;

const accounts = ['Genshin Impact','HonkaiStar Rail','MarvelRivals']
const keywords = ['code','redeem','primogem','stellar jade','gift','reward','login']
const posted 

async function checkTweets () {
    for (const user of accounts ) {
        try { 
            const { data: userData } = await twitter.v2.userByUsername(user)
            const { data: tweets } = await twitter.v2.userTimeline(userData.id, {
                max_results: 3,
                exclude: ['retweets', 'replies']
            })
        }
    }
}