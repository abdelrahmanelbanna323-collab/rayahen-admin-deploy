const data = require('../leveldb_dump.json');

const items = new Set();
data.forEach(entry => {
  // Fix the key format, it has null bytes
  const cleanKey = entry.key.replace(/\x00/g, '');
  const match = cleanKey.match(/tr_[a-z]{2}_(.*)/);
  if (match) {
    items.add(match[1]);
  }
});

console.log('Total unique items found from translations:', items.size);
const fs = require('fs');
fs.writeFileSync('d:/Projects/rayahen-admin-deploy/scratch/extracted_names.json', JSON.stringify(Array.from(items), null, 2));
