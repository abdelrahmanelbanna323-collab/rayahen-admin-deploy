const fs = require('fs');
const path = require('path');

const files = [
  'src/components/admin/CategoriesManager.tsx',
  'src/components/admin/MenuItemsManager.tsx',
  'src/components/admin/PromotionsManager.tsx',
];

for (const fp of files) {
  let c = fs.readFileSync(fp, 'utf8');
  // Replace the wrong doUpload calls back to uploadToFirebaseStorage (which is already imported)
  c = c.replace(/await doUpload\(/g, 'await uploadToFirebaseStorage(');
  // Remove the inline doUpload function definition if it was added (for AnnouncementsManager it was added inline)
  fs.writeFileSync(fp, c);
  console.log('Fixed:', fp);
}

// For AnnouncementsManager - it doesn't have the import, it has the inline doUpload function
// Let's check and fix it separately
const annFile = 'src/components/admin/AnnouncementsManager.tsx';
let ann = fs.readFileSync(annFile, 'utf8');

// Replace the inline doUpload function with uploadToFirebaseStorage from the lib
// First add the import at the top
if (!ann.includes("from '@/lib/firebaseUpload'")) {
  ann = ann.replace(
    `import { useMenuStore, AnnouncementPost } from '@/store/useMenuStore';`,
    `import { useMenuStore, AnnouncementPost } from '@/store/useMenuStore';\nimport { uploadToFirebaseStorage } from '@/lib/firebaseUpload';`
  );
}

// Remove the inline doUpload function
ann = ann.replace(
  /\n  const doUpload = async \(file: File \| Blob\): Promise<string> => \{[\s\S]*?\n  \};\n/,
  '\n'
);

// Replace any doUpload calls
ann = ann.replace(/await doUpload\(/g, 'await uploadToFirebaseStorage(');

fs.writeFileSync(annFile, ann);
console.log('Fixed: AnnouncementsManager.tsx');
console.log('All done!');
