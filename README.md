# 📢 Discord Promo Code Bot

A lightweight Discord bot that monitors selected Twitter/X accounts for new game promo codes (e.g., Genshin Impact, Honkai Star Rail, Marvel Rivals) and automatically posts them into a Discord channel.

---

## 🚀 Features

- Monitors official accounts for keywords like `code`, `redeem`, `primogem`, etc.
- Posts detected promo tweets into your chosen Discord channel
- `TEST_MODE` for safe testing without hitting Twitter API rate limits
- Organized by modules: config, settings, tests

---

## 📦 Project Structure

discord-promo-bot/
├── bot.js                # Main entry file
├── .env                  # Environment variables
├── setttings.js          # Keywords, accounts, test flag
├── config/
│   ├── twitterConfig.js  # Twitter API setup
│   └── discordConfig.js  # Discord channel utils
├── tests/
│   └── testTweet.js      # Mock tweet testing

---

## ⚙️ Setup

1. **Install dependencies**
```bash
npm install

DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_CHANNEL_ID=your-channel-id
TWITTER_BEARER_TOKEN=your-twitter-bearer-token

node bot.js