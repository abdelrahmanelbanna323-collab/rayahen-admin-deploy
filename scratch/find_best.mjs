import fs from 'fs';

const data = JSON.parse(fs.readFileSync('leveldb_dump.json', 'utf8'));
let maxItems = 0;
let bestState = null;

for (const item of data) {
  try {
    let val = item.value;
    
    // LevelDB localStorage uses UTF-16LE or has null bytes, strip them:
    val = val.replace(/\u0000/g, '');
    
    // Find the first '{'
    const firstBrace = val.indexOf('{');
    const lastBrace = val.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonStr = val.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonStr);
      
      if (parsed && parsed.state && parsed.state.menuItems) {
        if (parsed.state.menuItems.length > maxItems) {
          maxItems = parsed.state.menuItems.length;
          bestState = parsed;
        }
      }
    }
  } catch(e) {
    // try to just match "menuItems":[...] via regex if json fails
  }
}

console.log('Max menu items found via JSON.parse:', maxItems);

if (bestState) {
  fs.writeFileSync('restored_state.json', JSON.stringify(bestState, null, 2));
  console.log('Saved to restored_state.json');
} else {
  console.log('No state found.');
}
