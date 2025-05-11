async function getChannel(client) {
    return await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
  }
  
  module.exports = { getChannel };