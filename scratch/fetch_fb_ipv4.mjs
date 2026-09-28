import http from 'http';
import https from 'https';

const FIREBASE_PROJECT = 'rayahen-menu';
const FIREBASE_API_KEY = 'AIzaSyBossqusBFLn4kc1Vu9XqYRmrQwsHV-MfI';

const options = {
  hostname: 'firestore.googleapis.com',
  port: 443,
  path: `/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/rayahen_menu/menuItems?key=${FIREBASE_API_KEY}`,
  method: 'GET',
  family: 4 // Force IPv4!
};

console.log('Fetching from Firebase via IPv4...');

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    import('fs').then(fs => {
      fs.writeFileSync('d:/Projects/rayahen-admin-deploy/scratch/firebase_raw.json', data);
      console.log('Saved raw response, length:', data.length);
      try {
        const doc = JSON.parse(data);
        const values = doc.fields?.data?.arrayValue?.values || [];
        console.log(`Found ${values.length} items in Firebase!`);
      } catch(e) { console.error('Parse error'); }
    });
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
