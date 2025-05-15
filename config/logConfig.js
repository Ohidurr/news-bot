const fs = require('fs');
const path = './codes.json';

function loadCodes() {
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

function saveCodes(codesByGame) {
  fs.writeFileSync(path, JSON.stringify(codesByGame, null, 2));
}

module.exports = { loadCodes, saveCodes };