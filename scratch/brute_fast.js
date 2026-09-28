const fs = require('fs');
const snappy = require('snappy');
const path = require('path');

const dir = 'd:/Projects/leveldb_backup';
const file = '005418.ldb'; // The biggest file!
const buf = fs.readFileSync(path.join(dir, file));

console.log(`Processing ${file} (${buf.length} bytes)...`);

let validBlocks = 0;
let lastLog = Date.now();

for (let i = 0; i < buf.length; i++) {
  if (Date.now() - lastLog > 2000) {
    console.log(`Progress: ${i} / ${buf.length} (${((i/buf.length)*100).toFixed(2)}%)`);
    lastLog = Date.now();
  }
  
  // Quick heuristic: Snappy varint for 1KB-64KB block usually starts with a byte > 128
  // But let's just try everything to be safe.
  try {
    const uncompressed = snappy.uncompressSync(buf.subarray(i));
    validBlocks++;
    
    // Check for menuItems
    const u8 = uncompressed.toString('utf8');
    const u16 = uncompressed.toString('utf16le');
    
    if (u8.includes('menuItems') || u16.includes('menuItems') || u16.includes('313') || u8.includes('313') || u16.includes('categories') || u16.includes('adminUsers')) {
      console.log(`  Found potential state at offset ${i}! Length: ${uncompressed.length}`);
      fs.writeFileSync(`d:/Projects/rayahen-admin-deploy/scratch/block_${i}.bin`, uncompressed);
    }
  } catch(e) {
    // ignore
  }
}

console.log(`Done! Valid snappy blocks found: ${validBlocks}`);
