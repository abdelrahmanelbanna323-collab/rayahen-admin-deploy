const fs = require('fs');
const path = require('path');
const d = 'src/components/admin';
fs.readdirSync(d).forEach(f => {
  if (!f.endsWith('.tsx')) return;
  const fp = path.join(d, f);
  let c = fs.readFileSync(fp, 'utf8');
  c = c.replace(/const downloadUrl = await uploadToSupabase\(([^)]+)\);(\s+)URL\.revokeObjectURL\(localUrl\);(\s+)setImagePreview\(downloadUrl\);/g, 'const downloadUrl = await uploadToSupabase($1);\nif (!downloadUrl) throw new Error("Upload failed");$2URL.revokeObjectURL(localUrl);$3setImagePreview(downloadUrl);');
  c = c.replace(/const downloadUrl = await uploadToSupabase\(([^)]+)\);(\s+)setImagePreview\(downloadUrl\);/g, 'const downloadUrl = await uploadToSupabase($1);\nif (!downloadUrl) throw new Error("Upload failed");$2setImagePreview(downloadUrl);');
  c = c.replace(/const cloudinaryUrl = await uploadToSupabase\(([^)]+)\);/g, 'const cloudinaryUrl = await uploadToSupabase($1) as string;');
  fs.writeFileSync(fp, c);
  console.log(f);
});
