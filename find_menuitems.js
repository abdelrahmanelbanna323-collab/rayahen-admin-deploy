const fs = require('fs');
const path = require('path');

const dirs = [
  'C:/Users/DELL/AppData/Local/Google/Chrome/User Data/Profile 19/Local Storage/leveldb',
  'C:/Users/DELL/AppData/Local/Google/Chrome/User Data/Profile 8/Local Storage/leveldb'
];

dirs.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    if (f === 'LOCK' || f.endsWith('.log')) return;
    const full = path.join(dir, f);
    try {
      const buf = fs.readFileSync(full);
      
      const pUtf8 = Buffer.from('menuItems', 'utf8');
      const pUtf16 = Buffer.from('menuItems', 'utf16le');
      
      let cUtf8 = 0, cUtf16 = 0;
      let idx = 0;
      while ((idx = buf.indexOf(pUtf8, idx)) !== -1) { cUtf8++; idx += pUtf8.length; }
      idx = 0;
      while ((idx = buf.indexOf(pUtf16, idx)) !== -1) { cUtf16++; idx += pUtf16.length; }
      
      if (cUtf8 > 0 || cUtf16 > 0) {
        console.log(`File: ${f} in ${path.basename(path.dirname(path.dirname(full)))}: utf8=${cUtf8}, utf16=${cUtf16}, size=${buf.length}`);
      }
    } catch(err) {
      console.log('Error reading:', f, err.message);
    }
  });
});
