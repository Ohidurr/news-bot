require('dotenv').config();
const { apiSources, DRY_RUN } = require('./settings');
const { Client, GatewayIntentBits } = require('discord.js');
const { loadPostedIDs, savePostedIDs } = require('./store');
const { loadCodes, saveCodes } = require('./config/logConfig');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
process.on('unhandledRejection', console.error);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const posted = loadPostedIDs();
const codeLog = loadCodes();

async function fetchCodesFromAPI(game, apiUrl) {
  try {
    const res = await fetch(apiUrl);
    console.log(`📡 Response for ${game}: ${res.status}`);
    const data = await res.json();

    console.log(`📦 Raw response for ${game}:`, JSON.stringify(data, null, 2));
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
  try {
    console.log(`⏱️ [${new Date().toLocaleTimeString()}] Checking for promo codes...`);

    for (const { name, game, apiUrl } of apiSources) {
      console.log(`🌐 Fetching codes for ${game} from ${apiUrl}`);
      const codes = await fetchCodesFromAPI(game, apiUrl);
      console.log(`🔍 ${game}: received ${codes.length} code(s)`);

      const newCodes = codes
        .filter(code => {
          if (!code || !code.code) return false;
          const isExpired = code.expires && new Date(code.expires) < new Date();
          return !isExpired && !posted.has(code.code);
        })
        .slice(0, 5);

      console.log(`🆕 ${game}: ${newCodes.length} new code(s) after filter`);

      for (const code of newCodes) {
        console.log(`➡️ Processing code: ${code.code}`);

        const rewardText = Array.isArray(code.rewards) ? code.rewards.join(', ') : code.rewards || 'N/A';
        const safeRewardText = rewardText.replace(/[*_~`]/g, '\\$&');
        const expiresFormatted = code.expires
          ? new Date(code.expires).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
          : 'Unknown';
        const formattedName = name.replace(/(^\w|\s\w)/g, c => c.toUpperCase());

        const message = `🔔 **New code for ${formattedName}**\n` +
                        `Use \`${code.code}\` for **${safeRewardText}**\n` +
                        `Expiration date: ${expiresFormatted}`;

        if (DRY_RUN) {
          console.log(`[DRY_RUN] Would post:\n${message}\n`);
        } else {
          try {
            const sent = await channel.send(message);
            console.log(`✅ Posted to Discord: ${code.code}`);

            // Only add to log and posted if message was sent
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

            posted.add(code.code);
            savePostedIDs(posted);

          } catch (err) {
            console.error(`❌ Failed to post to Discord: ${code.code}`, err.message);
          }
        }
      }
    }

    console.log(`📝 Saving codes to codes.json...`);
    console.log(`💾 Final codeLog:`, JSON.stringify(codeLog, null, 2));
    saveCodes(codeLog);

  } catch (err) {
    console.error('❌ runProd() failed:', err.message);
  }
}

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  try {
    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
    await runProd(channel);
    setInterval(() => runProd(channel), 1000 * 60 * 5);
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);