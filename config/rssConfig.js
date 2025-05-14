const Parser = require('rss-parser');
const parser = new Parser();
const { rssFeeds, keywords } = require('../settings');
const { loadPostedIds, savePostedIds } = require('../store');

const posted = loadPostedIds('postedRss.json');

async function fetchRss() {
  const results = [];

  for (const { name, url } of rssFeeds) {
    try {
      const feed = await parser.parseURL(url);
      const items = feed.items || [];

      for (const item of items.slice(0, 3)) {
        const content = item.title.toLowerCase();

        if (keywords.some(k => content.includes(k)) && !posted.has(item.link)) {
          results.push({ source: name, item });
          posted.add(item.link);
        }
      }

    } catch (err) {
      console.error(`❌ Failed to fetch RSS for ${name}:`, err.message);
    }
  }

  savePostedIds(posted, 'postedRss.json');
  return results;
}

module.exports = { fetchRss };