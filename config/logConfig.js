const fs = require('fs');
const path = './codes.json';

function loadCodes() {
  if (!fs.existsSync(path)) {
    console.warn(`⚠️ codes.json not found, initializing new file.`);
    return {};
  }

  try {
    const content = fs.readFileSync(path, 'utf-8');
    const parsed = JSON.parse(content);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.warn(`⚠️ codes.json was not a valid object, resetting...`);
      return {};
    }
    return parsed;
  } catch (err) {
    console.error(`❌ Failed to load codes.json:`, err.message);
    return {};
  }
}

function saveCodes(codesByGame) {
  try {
    fs.writeFileSync(path, JSON.stringify(codesByGame, null, 2));
    console.log(`💾 Saved codes.json with ${Object.keys(codesByGame).length} game(s).`);
  } catch (err) {
    console.error(`❌ Failed to save codes.json:`, err.message);
  }
}

module.exports = { loadCodes, saveCodes };