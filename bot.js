// require dot env,  declare vars
require ('dotenv').config
const { Client, GatewayIntentBits } = require('discord.js')
const { TwitterAPi } = require('twitter-api-v2');

const client = new Client({intents: [GatewayIntentBits.Guilds]})
const twitter = new TwitterAPi(proccess.env.TWITTER_BEARER_TOKEN).readOnly;

