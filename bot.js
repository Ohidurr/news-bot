require('dotenv').config();
const { apiSources, DRY_RUN } = require('./settings');
const { Client, GatewayIntentBits } = require('discord.js');
const { loadPostedIDs, savePostedIDs } = require('./store');
const { loadCodes, saveCodes } = require('./codeLog'); // for tracking all codes

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
process.on('unhandledRejection', console.error);

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const posted = loadPostedIDs();
const codeLog = loadCodes(); // new JSON format per game
const AUTO_DELETE_MS = 60_000;

async function fetchCodesFromAPI(game, apiUrl) {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.codes)) return data.codes;

    console.error(`❌ Unexpected format for ${game}:`, JSON.stringify(data));
    return [];
  } catch (err) {
    console.error(`❌ Failed to fetch ${game}:`, err.message);
    return [];
  }
}

async function runProd(channel) {
  console.log(`⏱️ [${new Date().toLocaleTimeString()}] Checking for promo codes...`);

  for (const { name, game, apiUrl } of apiSources) {
    const codes = await fetchCodesFromAPI(game, apiUrl);
    const newCodes = codes
      .filter(code => {
        const isExpired = code.expires && new Date(code.expires) < new Date();
        return !isExpired && !posted.has(code.code);
      })
      .slice(0, 3);

    for (const code of newCodes) {
      // Format reward & expiration
      const rewardText = Array.isArray(code.rewards) ? code.rewards.join(', ') : code.rewards || 'N/A';
      const exp = code.expires ? new Date(code.expires).toLocaleDateString() : 'Unknown';
      const formattedName = name.replace(/(^\w|\s\w)/g, c => c.toUpperCase());

      const message = `🔔 New code for **${formattedName}**\n` +
                      `Use \`${code.code}\` for **${rewardText}**\n` +
                      `Expiration date: ${exp}`;

      // Store in global code log
      if (!codeLog[game]) codeLog[game] = {};
      if (!codeLog[game][code.code]) {
        codeLog[game][code.code] = {
          rewards: Array.isArray(code.rewards) ? code.rewards : [code.rewards || 'N/A'],
          source: code.source,
          status: code.status || 'OK',
          expires: code.expires || null,
          addedAt: new Date().toISOString()
        };
      } else {
        codeLog[game][code.code].status = code.status || 'OK';
      }

      if (DRY_RUN) {
        console.log(`[DRY_RUN] Would post code ${code.code} from ${game}`);
      } else {
        const sent = await channel.send(message);
        console.log(`✅ Posted code ${code.code} from ${game}`);

        setTimeout(() => sent.delete().catch(console.error), AUTO_DELETE_MS);
      }

      posted.add(code.code);
      savePostedIDs(posted);
    }
  }

  saveCodes(codeLog); // ✅ persist the code log to codes.json
}

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  try {
    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
    await runProd(channel); // initial run
    setInterval(() => runProd(channel), 1000 * 60 * 5); // every 5 minutes
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);