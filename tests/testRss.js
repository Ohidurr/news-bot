require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

const { DISCORD_CHANNEL_ID, keywords, rssFeeds } = require('./settings');
const { loadPostedIds, savePostedIds } = require('./store');

const posted = loadPostedIds('postedRss.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function fetchAndPost(channel) {
  for (const { name, url } of rssFeeds) {
    try {
      console.log(`🔍 Fetching RSS feed: ${name}`);
      const feed = await parser.parseURL(url);
      const items = feed.items || [];

      for (const item of items.slice(0, 3)) {
        const content = item.title.toLowerCase();
        console.log(`👀 "${item.title}"`);

        if (keywords.some(k => content.includes(k))) {
          if (posted.has(item.link)) {
            console.log(`⚠️ Already posted: ${item.link}`);
            continue;
          }

          await channel.send(`📢 New promo from ${name}:\n${item.link}`);
          console.log(`✅ Posted: ${item.link}`);
          posted.add(item.link);
          savePostedIds(posted, 'postedRss.json');
          return;
        }
      }

      console.log('ℹ️ No matching tweets found.');

    } catch (err) {
      console.error(`❌ Failed to fetch RSS for ${name}:`, err.message);
    }
  }
}

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
  await fetchAndPost(channel);
  client.destroy(); // close after one run
});

client.login(process.env.DISCORD_BOT_TOKEN);