require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { apiSources } = require('./settings');
const { loadPostedIDs, savePostedIDs } = require('./store');
const fetch = require('node-fetch');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const posted = loadPostedIDs();

async function fetchCodesFromAPI(game, apiUrl) {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error(`❌ Failed to fetch ${game}:`, err.message);
    return [];
  }
}

async function runProd(channel) {
  console.log(`⏱️ [${new Date().toLocaleTimeString()}] Checking for promo codes...`);

  for (const { name, game, apiUrl } of apiSources) {
    const codes = await fetchCodesFromAPI(game, apiUrl);

    for (const code of codes) {
      if (!posted.has(code.code)) {
        const message = `🎁 **New ${name} Code from ${code.source}**\n` +
                        `🔑 Code: **${code.code}**\n` +
                        `🎉 Rewards: ${code.rewards.join(', ')}\n` +
                        `⏳ Expires: ${new Date(code.expires).toLocaleString()}`;
        await channel.send(message);
        posted.add(code.code);
        savePostedIDs(posted);
      }
    }
  }
}

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
  await runProd(channel);
  setInterval(() => runProd(channel), 1000 * 60 * 5); // every 5 minutes
});

client.login(process.env.DISCORD_BOT_TOKEN);