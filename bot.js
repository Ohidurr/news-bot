require('dotenv').config();
const { apiSources, DRY_RUN } = require('./settings');
const { Client, GatewayIntentBits } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadPostedIDs, savePostedIDs } = require('./store');
const { loadCodes, saveCodes } = require('./config/logConfig');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
process.on('unhandledRejection', console.error);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const posted = loadPostedIDs();
const codeLog = loadCodes();

const gameEmojis = {
  'hkrpg': '🚂',
  'genshin': '🌀',
  'nap': '💤',
};

const redeemLinks = {
  'hkrpg': 'https://hsr.hoyoverse.com/gift',
  'genshin': 'https://genshin.hoyoverse.com/en/gift',
  'nap': 'https://zenless.hoyoverse.com/redemption',
};

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
        });

      if (newCodes.length === 0) continue;

      const emoji = gameEmojis[game.toLowerCase()] || '🔔';
      const formattedName = name.replace(/(^\w|\s\w)/g, c => c.toUpperCase());
      const redeemLink = redeemLinks[game.toLowerCase()] || 'https://www.hoyoverse.com/';

      const codeLines = newCodes.map(code => {
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
        return `➤ \`${code.code}\``;
      });

      const message = `${emoji} **${formattedName}** 🔗\n${codeLines.join('\n')}`;

      if (DRY_RUN) {
        console.log(`[DRY_RUN] Would post:\n${message}\n`);
      } else {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Redeem Here')
            .setStyle(ButtonStyle.Link)
            .setURL(redeemLink)
        );

        try {
          await channel.send({ content: message, components: [row] });
          console.log(`✅ Posted ${newCodes.length} codes for ${game}`);
          savePostedIDs(posted);
        } catch (err) {
          console.error(`❌ Failed to post for ${game}:`, err.message);
        }
      }
    }

    console.log(`📝 Saving codes to codes.json...`);
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
    setInterval(() => runProd(channel), 1000 * 60 * 6); // every 3 minutes
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);