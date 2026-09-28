import fs from 'fs';

const FIREBASE_PROJECT = 'rayahen-menu';
const FIREBASE_API_KEY = 'AIzaSyBossqusBFLn4kc1Vu9XqYRmrQwsHV-MfI';

async function main() {
  console.log('Fetching from Firebase...');
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/rayahen_menu/menuItems?key=${FIREBASE_API_KEY}`;
  console.log('URL:', url);
  
  try {
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync('d:/Projects/rayahen-admin-deploy/scratch/firebase_raw.json', text);
    console.log('Saved raw response.');
    
    if (res.ok) {
      const doc = JSON.parse(text);
      const values = doc.fields?.data?.arrayValue?.values || [];
      console.log(`Found ${values.length} items in Firebase!`);
      fs.writeFileSync('d:/Projects/rayahen-admin-deploy/scratch/firebase_values.json', JSON.stringify(values, null, 2));
    } else {
      console.error('Firebase error:', res.status, text);
    }
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}

main();
