import fs from 'fs';
import path from 'path';

const dir = 'd:/Projects/leveldb_backup';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

const pUtf8 = Buffer.from('"menuItems":[', 'utf8');
const pUtf16 = Buffer.from('"menuItems":[', 'utf16le');

for (const file of files) {
  const buf = fs.readFileSync(path.join(dir, file));
  let idx = 0;
  let count = 0;
  
  while ((idx = buf.indexOf(pUtf8, idx)) !== -1) {
    console.log(`Found utf8 match at offset ${idx} in ${file}`);
    const start = Math.max(0, idx - 1000);
    const end = Math.min(buf.length, idx + 1000000); // 1MB after
    fs.writeFileSync(`d:/Projects/rayahen-admin-deploy/scratch/match_${file}_utf8_${idx}.bin`, buf.subarray(start, end));
    idx += pUtf8.length;
    count++;
  }
  
  idx = 0;
  while ((idx = buf.indexOf(pUtf16, idx)) !== -1) {
    console.log(`Found utf16 match at offset ${idx} in ${file}`);
    const start = Math.max(0, idx - 1000);
    const end = Math.min(buf.length, idx + 1000000); // 1MB after
    fs.writeFileSync(`d:/Projects/rayahen-admin-deploy/scratch/match_${file}_utf16_${idx}.bin`, buf.subarray(start, end));
    idx += pUtf16.length;
    count++;
  }
  
  if (count > 0) {
    console.log(`Total matches in ${file}: ${count}`);
  }
}
