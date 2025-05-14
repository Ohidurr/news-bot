module.exports = {
  TEST_MODE: false,
  DRY_RUN: false,
  LIMIT_TWEETS: 5,
  keywords: [
    'code', 'redeem', 'primogem', 'stellar jade', 'gift', 'reward',
    'login', 'free', 'primo', 'gems', 'Redemption', 'Codes', 'livestream', 'jades', 'hsr', 'test'
  ],
  accounts: ['WahidXD'],
  rssFeeds: [
    {
      name: 'WahidXD',
      url: 'https://rsshub.app/twitter/user/WahidXD' // optional if still polling RSS
    }
  ],
  apiSources: [
    {
      name: 'Genshin Impact',
      game: 'genshin',
      apiUrl: 'https://hoyo-codes.seria.moe/codes?game=genshin'
    },
    {
      name: 'Honkai Star Rail',
      game: 'hkrpg',
      apiUrl: 'https://hoyo-codes.seria.moe/codes?game=hkrpg'
    },
    {
      name: 'Zenless Zone Zero',
      game: 'nap',
      apiUrl: 'https://hoyo-codes.seria.moe/codes?game=nap'
    }
  ]
};