const fs = require('fs');
const path = require('path');
const d = 'src/components/admin';
fs.readdirSync(d).forEach(f => {
  if (!f.endsWith('.tsx')) return;
  const fp = path.join(d, f);
  let c = fs.readFileSync(fp, 'utf8');
  if (c.includes('uploadToSupabase')) {
    c = c.replace(/uploadToSupabase/g, 'uploadToFirebaseStorage');
    c = c.replace(/@\/lib\/supabaseClient/g, '@/lib/firebaseUpload');
    fs.writeFileSync(fp, c);
    console.log('Updated ' + f);
  }
});
