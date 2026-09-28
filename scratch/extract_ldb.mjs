import { Level } from 'level';
import fs from 'fs';

const dbPath = 'd:/Projects/leveldb_backup';

async function extract() {
  const db = new Level(dbPath, { keyEncoding: 'binary', valueEncoding: 'binary' });
  console.log("Opened LevelDB at " + dbPath);

  let maxItems = 0;
  let bestState = null;

  for await (const [keyBuf, valBuf] of db.iterator()) {
    const keyStr = keyBuf.toString('utf8');
    
    // Only care about menu-storage
    if (keyStr.includes('menu-storage') || keyStr.includes('rayahen-menu')) {
      let valStr = '';
      if (valBuf.length > 0) {
        if (valBuf[0] === 0x00) {
          // UTF-16LE
          valStr = valBuf.subarray(1).toString('utf16le');
        } else if (valBuf[0] === 0x01) {
          // Latin1/UTF8
          valStr = valBuf.subarray(1).toString('utf8');
        } else {
          valStr = valBuf.toString('utf8');
        }
      }

      // Find the first '{'
      const firstBrace = valStr.indexOf('{');
      const lastBrace = valStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonStr = valStr.substring(firstBrace, lastBrace + 1);
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed && parsed.state && parsed.state.menuItems) {
            if (parsed.state.menuItems.length > maxItems) {
              maxItems = parsed.state.menuItems.length;
              bestState = parsed;
              console.log('Found state with', maxItems, 'items in key', keyStr);
            }
          }
        } catch(e) {}
      }
    }
  }

  if (bestState) {
    fs.writeFileSync('restored_state.json', JSON.stringify(bestState, null, 2));
    console.log(`SUCCESS! Saved state with ${maxItems} items to restored_state.json`);
  } else {
    console.log('FAILED to find any valid state.');
  }
}

extract().catch(console.error);
