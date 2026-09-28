import fs from 'fs';

const FIREBASE_PROJECT = 'rayahen-menu';
const FIREBASE_API_KEY = 'AIzaSyBossqusBFLn4kc1Vu9XqYRmrQwsHV-MfI';
const TARGET_URL = encodeURIComponent(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/rayahen_menu/menuItems?key=${FIREBASE_API_KEY}`);
const PROXY_URL = `https://api.allorigins.win/raw?url=${TARGET_URL}`;

async function main() {
  console.log('Fetching from Firebase via Proxy...');
  console.log('Proxy URL:', PROXY_URL);
  
  try {
    const res = await fetch(PROXY_URL);
    const text = await res.text();
    fs.writeFileSync('d:/Projects/rayahen-admin-deploy/scratch/firebase_raw.json', text);
    console.log('Saved raw response, length:', text.length);
    
    if (res.ok) {
      const doc = JSON.parse(text);
      const values = doc.fields?.data?.arrayValue?.values || [];
      console.log(`Found ${values.length} items in Firebase!`);
      fs.writeFileSync('d:/Projects/rayahen-admin-deploy/scratch/firebase_values.json', JSON.stringify(values, null, 2));
    } else {
      console.error('Proxy/Firebase error:', res.status, text.substring(0, 500));
    }
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}

main();
