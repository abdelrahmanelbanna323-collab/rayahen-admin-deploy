const fs = require('fs');
const path = require('path');

const adminDir = 'src/components/admin';

const firebaseUploadCode = `
  const doUpload = async (file: File | Blob): Promise<string> => {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { storage } = await import('@/lib/firebase');
    const ext = file.type.startsWith('video/') ? 'mp4' : (file.type === 'image/png' ? 'png' : 'jpg');
    const filePath = \`uploads/\${Date.now()}_\${Math.random().toString(36).slice(2)}.\${ext}\`;
    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };
`;

const files = fs.readdirSync(adminDir).filter(f => f.endsWith('.tsx'));

for (const f of files) {
  const fp = path.join(adminDir, f);
  let content = fs.readFileSync(fp, 'utf8');

  // Check if it has the old cloudinary upload pattern
  if (!content.includes('cloudinary.com') && !content.includes('uploadToFirebaseStorage')) continue;

  // Replace the whole upload function with Firebase one
  // Pattern: function named uploadToFirebaseStorage or similar that contains cloudinary
  content = content.replace(
    /const uploadToFirebaseStorage = async \(file: File \| Blob\): Promise<string> => \{[\s\S]*?\n  \};\n/,
    firebaseUploadCode
  );

  // Also fix the call site: replace uploadToFirebaseStorage(...) with doUpload(...)
  content = content.replace(/uploadToFirebaseStorage\(/g, 'doUpload(');

  fs.writeFileSync(fp, content);
  console.log('Fixed:', f);
}

console.log('Done!');
