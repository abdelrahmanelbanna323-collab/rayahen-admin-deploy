import fs from 'fs';
import path from 'path';
import { Level } from 'level';
import { execSync } from 'child_process';

const profilesDir = 'C:\\Users\\DELL\\AppData\\Local\\Google\\Chrome\\User Data';
const tempDir = 'd:\\Projects\\leveldb_all_profiles';

async function main() {
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const profiles = fs.readdirSync(profilesDir).filter(n => n.startsWith('Profile ') || n === 'Default');
  
  let bestItems = 0;
  let bestState = null;
  let bestProfile = '';

  for (const profile of profiles) {
    const ldbPath = path.join(profilesDir, profile, 'Local Storage', 'leveldb');
    if (!fs.existsSync(ldbPath)) continue;

    console.log(`Copying LevelDB for ${profile}...`);
    const copyDest = path.join(tempDir, profile.replace(' ', '_'));
    if (!fs.existsSync(copyDest)) fs.mkdirSync(copyDest);
    
    try {
      execSync(`xcopy "${ldbPath}\\*" "${copyDest}\\" /Y /E /C /Q`, { stdio: 'ignore' });
    } catch(e) {
      // ignore copy errors
    }

    console.log(`Scanning ${profile}...`);
    try {
      const db = new Level(copyDest, { valueEncoding: 'binary' });
      
      for await (const [key, value] of db.iterator()) {
        const keyStr = Buffer.from(key).toString('utf8');
        const valBuf = Buffer.from(value);
        let valStr = '';

        if (valBuf.length > 0) {
          if (valBuf[0] === 0x00) {
            valStr = valBuf.subarray(1).toString('utf16le');
          } else if (valBuf[0] === 0x01) {
            valStr = valBuf.subarray(1).toString('utf8');
          } else {
            valStr = valBuf.toString('utf8');
          }
        }

        if (keyStr.includes('rayahen-menu-storage')) {
          const firstBrace = valStr.indexOf('{');
          const lastBrace = valStr.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonStr = valStr.substring(firstBrace, lastBrace + 1);
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed && parsed.state && parsed.state.menuItems) {
                const numItems = parsed.state.menuItems.length;
                console.log(`  -> Found state in ${profile} with ${numItems} items.`);
                if (numItems > bestItems) {
                  bestItems = numItems;
                  bestState = parsed;
                  bestProfile = profile;
                }
              }
            } catch(e) {}
          }
        }
      }
      await db.close();
    } catch (e) {
      console.log(`  Error reading ${profile}:`, e.message);
    }
  }

  if (bestState) {
    fs.writeFileSync('d:/Projects/rayahen-admin-deploy/restored_best.json', JSON.stringify(bestState, null, 2));
    console.log(`SUCCESS! Best state found in ${bestProfile} with ${bestItems} items.`);
  } else {
    console.log('No valid state found in any profile.');
  }
}

main();
