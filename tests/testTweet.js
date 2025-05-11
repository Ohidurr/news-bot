const { DRY_RUN } = require('../settings');

const keywords = [
  'code', 'redeem', 'primogem', 'stellar jade',
  'gift', 'reward', 'login', 'free', 'primo', 'gems'
];

// ✅ Define one or more mock tweets
const testTweets = [
  {
    user: 'GenshinImpact',
    id: '1234567890',
    text: '🎁 Redemption Code: GENSHIN100 for 100 Primogems!'
  },
  {
    user: 'honkaistarrail',
    id: '2345678901',
    text: '✨ Special login gift: 80 Stellar Jade!'
  },
  {
    user: 'MarvelRivals',
    id: '3456789012',
    text: 'Here are the patch notes. No rewards this time.'
  }
];

// ✅ Main test-mode function that posts or simulates
async function postTestTweets(channel) {
  for (const tweet of testTweets) {
    const content = tweet.text.toLowerCase();
    const matched = keywords.some(k => content.includes(k));

    if (!matched) {
      console.log(`ℹ️ Skipped: ${tweet.text}`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`[DRY_RUN] Would post tweet from @${tweet.user}: ${tweet.text}`);
    } else {
      const sent = await channel.send({
        content: `📢 **New promo code from @${tweet.user}:**\n\nhttps://x.com/${tweet.user}/status/${tweet.id}`
      });
      console.log(`✅ Posted mock tweet: ${tweet.text}`);

      // Optional auto-delete after 10 seconds
      setTimeout(() => {
        sent.delete().catch(console.error);
      }, 10000);
    }
  }
}

// Optional: logic-only simulator used in dry-run mode
async function simulateTweetLogic(channel) {
  for (const tweet of testTweets) {
    const content = tweet.text.toLowerCase();
    const matched = keywords.some(k => content.includes(k));

    if (matched) {
      console.log(`[DRY_RUN] Would post tweet: ${tweet.text}`);
    } else {
      console.log(`[DRY_RUN] Skipped: ${tweet.text}`);
    }
  }
}

module.exports = {
  postTestTweets,
  simulateTweetLogic
};