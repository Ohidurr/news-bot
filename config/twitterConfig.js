const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config()
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN).readOnly;

//Twitter API 
// config/twitterService.js (optional separation of concerns)
//const { twitterClient } = require('./twitterConfig');
const { keywords, LIMIT_TWEETS, accounts } = require('../settings');


const posted = new Set();

async function fetchTweetsFilter() {
    const { loadPostedIDs, savePostedIDs } = require('../store');
    const posted = loadPostedIDs();
    const results = [];
  
    for (const username of accounts) {
      try {
        const { data: userData } = await twitterClient.v2.userByUsername(username);
  
        // ✅ Wrapped rate-limit safe call here
        const res = await twitterClient.v2.userTimeline(userData.id, {
          max_results: LIMIT_TWEETS, // should be between 5 and 100
          exclude: ['retweets', 'replies']
        });
  
        if (res.rateLimit?.remaining === 0) {
          const wait = res.rateLimit.reset - Math.floor(Date.now() / 1000);
          console.warn(`⚠️ Rate limit hit for @${username}. Wait ${wait} seconds.`);
          continue; // skip this user for now
        }
  
        const tweets = res.data;
  
        for (const tweet of tweets || []) {
          const content = tweet.text.toLowerCase();
  
          if (keywords.some(k => content.includes(k)) && !posted.has(tweet.id)) {
            results.push({ user: username, tweet });
            posted.add(tweet.id);
          }
        }
      } catch (err) {
        console.error(`❌ Error fetching tweets for @${username}:`, err);
      }
    }
  
    savePostedIDs(posted);
    return results;
  }

module.exports = { twitterClient, fetchTweetsFilter };