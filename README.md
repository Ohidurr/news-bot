# 🎮 Discord Hoyoverse Promo Code Bot

A lightweight Discord bot that fetches and posts the latest promo codes for **Genshin Impact**, **Honkai: Star Rail**, and **Zenless Zone Zero** using the [seriaati/hoyo-codes](https://github.com/seriaati/hoyo-codes) API.

---

## 🚀 Features

- 🔄 Polls the API every 3 minutes for new promo codes
- 🎯 Posts new codes in a clean, readable format
- 🖱️ Adds a **"Redeem Here"** button that links directly to each game's official code redemption site
- ✅ Avoids duplicate posts using a local `codes.json` and `posted.json` system
- 🧪 `DRY_RUN` mode for safe testing without posting to Discord

---

## 📸 Example Discord Output
🌀 Genshin Impact:
GENSHIN123 = 100 Primogems, Mora x50
With a button below that says:

**[Redeem Here](https://genshin.hoyoverse.com/en/gift)**

---