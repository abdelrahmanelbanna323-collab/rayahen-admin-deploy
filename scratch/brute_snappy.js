const fs = require('fs');
const snappy = require('snappy');
const path = require('path');

const dir = 'd:/Projects/leveldb_backup';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

for (const file of files) {
  const buf = fs.readFileSync(path.join(dir, file));
  console.log(`Processing ${file} (${buf.length} bytes)...`);
  
  let validBlocks = 0;
  for (let i = 0; i < buf.length; i++) {
    try {
      // Try to uncompress starting at offset i
      // We pass a chunk because snappy will read the varint length
      // and only consume what it needs.
      // But just in case, we pass the rest of the buffer
      const uncompressed = snappy.uncompressSync(buf.subarray(i));
      
      // If we are here, it successfully uncompressed!
      validBlocks++;
      
      // Search for menuItems in UTF-16LE or UTF-8
      const u8 = uncompressed.toString('utf8');
      const u16 = uncompressed.toString('utf16le');
      
      if (u8.includes('menuItems') || u16.includes('menuItems')) {
        console.log(`  Found menuItems at offset ${i} in ${file}!`);
        fs.writeFileSync(`d:/Projects/rayahen-admin-deploy/scratch/block_${file}_${i}.bin`, uncompressed);
      }
      
      // Skip the bytes we just consumed? 
      // We can't easily know how many bytes snappy consumed unless we use a lower level API,
      // but we can just continue to i+1 (it will fail for the middle of a block).
    } catch(e) {
      // Invalid snappy block, continue
    }
  }
  console.log(`  Valid snappy blocks found: ${validBlocks}`);
}
