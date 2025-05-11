const keywords = [
    'code', 'redeem', 'primogem', 'stellar jade',
    'gift', 'reward', 'login', 'free', 'primo', 'gems'
  ];
  
  async function postTestTweet(channel) {
    const user = 'GenshinImpact';
    const tweet = {
      id: '1234567890',
      text: '🎁 Redemption Code: GENSHIN100 for 100 Primogems!'
    };
  
    const content = tweet.text.toLowerCase();
  
    if (keywords.some(k => content.includes(k))) {
      await channel.send({
        content: `📢 **New promo code from @${user}:**\n\nhttps://x.com/${user}/status/${tweet.id}`
      });
      console.log('✅ Mock tweet posted to Discord');
    } else {
      console.log('ℹ️ Mock tweet does not contain matching keywords');
    }
  }
  
  module.exports = { postTestTweet };