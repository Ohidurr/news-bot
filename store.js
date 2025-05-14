// store.js
const fs = require('fs');
const path = './posted.json';

function loadPostedIDs() {
  if (!fs.existsSync(path)) return new Set();
  const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
  return new Set(data);
}

function savePostedIDs(postedSet) {
  fs.writeFileSync(path, JSON.stringify([...postedSet], null, 2));
}

module.exports = { loadPostedIDs, savePostedIDs };
