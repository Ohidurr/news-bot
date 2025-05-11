const { TwitterApi } = require('twitter-api-v2');
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN).readOnly;

module.exports = { twitterClient };