const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
  });
  
  const posted = new Set();
  
  async function postTestTweet(channel) {
    const user = 'GenshinImpact';
    const tweet = {
      id: '12345',
      text: 'HSRNEWYEAR2025 – Redeem for free Stellar Jade!'
    };
  
    const content = tweet.text.toLowerCase();
    if (keywords.some(k => content.includes(k))) {
      await channel.send({
        content: `📢 **New promo code from @${user}:**\n\nhttps://x.com/${user}/status/${tweet.id}`
      });
    }
  }
  
  async function checkTweets() {
    const channel = await getChannel(client);
  
    if (TEST_MODE) {
      console.log('🧪 TEST_MODE enabled — using mock tweet');
      return await postTestTweet(channel);
    }
  
    for (const user of accounts) {
      try {
        const { data: userData } = await twitterClient.v2.userByUsername(user);
        const { data: tweets } = await twitterClient.v2.userTimeline(userData.id, {
          max_results: 3,
          exclude: ['retweets', 'replies']
        });
  
        for (const tweet of tweets || []) {
          const content = tweet.text.toLowerCase();
          if (keywords.some(k => content.includes(k)) && !posted.has(tweet.id)) {
            await channel.send({
              content: `📢 New promo code from @${user}:\n\nhttps://x.com/${user}/status/${tweet.id}`
            });
            posted.add(tweet.id);
          }
        }
      } catch (err) {
        console.error(`❌ Error fetching tweets for @${user}:`, err);
      }
    }
  }