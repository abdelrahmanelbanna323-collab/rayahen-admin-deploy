/**
 * Upload master state to Firebase Firestore via REST API
 * Firestore doc: menu_state/global
 * Images stay on Supabase Storage (URLs unchanged)
 */
import { readFileSync } from 'fs';

const PROJECT_ID = 'rayahen-menu';
const API_KEY = 'AIzaSyBossqusBFLn4kc1Vu9XqYRmrQwsHV-MfI';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/menu_state/global?key=${API_KEY}`;

console.log('📖 Reading final_state.json (master backup)...');
const goodData = JSON.parse(readFileSync('d:/Projects/rayahen-admin-deploy/scratch/final_state.json', 'utf8'));
const goodCategories = goodData.data.categories;  // 15 cats
const goodMenuItems  = goodData.data.menuItems;    // 313 items

// Announcements & promotions from rayahen_menu_storage
const SUPABASE_URL = 'https://acmmilazknnircuquozr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

console.log('📡 Fetching extra data from Supabase...');
const storageRes = await fetch(`${SUPABASE_URL}/rest/v1/menu_state?id=eq.rayahen_menu_storage&select=data`, {
  headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
}).then(r => r.json());
const storageData = storageRes[0].data;

const goodAdminUsers = Array.isArray(storageData.adminUsers) ? storageData.adminUsers : [];
const rawAnnouncements = Array.isArray(storageData.announcements) ? storageData.announcements : storageData.announcements?.data || [];
const rawPromotions = Array.isArray(storageData.promotions) ? storageData.promotions : storageData.promotions?.data || [];
const goodRatingUrl = storageData.ratingUrl || 'https://rayahen-rating.vercel.app/';

// Clean base64 images from announcements (not suitable for Firestore 1MB limit)
const cleanAnnouncements = rawAnnouncements.map(a => ({
  ...a,
  imageUrl: a.imageUrl && !a.imageUrl.startsWith('data:') ? a.imageUrl : '',
  branchOverrides: a.branchOverrides || {}
}));

const updatedAt = new Date().toISOString();

// Build Firestore document fields using Firestore REST format
// Helper to convert JS value to Firestore REST value
function toFirestore(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return { integerValue: String(val) };
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestore) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestore(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

const state = {
  categories: { data: goodCategories, updatedAt },
  menuItems:   { data: goodMenuItems, updatedAt },
  announcements: { data: cleanAnnouncements, updatedAt },
  promotions: { data: rawPromotions, updatedAt },
  settings: {
    adminUsers: goodAdminUsers,
    ratingUrl: goodRatingUrl,
    vatSettings: {},
    updatedAt,
  }
};

const firestoreDoc = { fields: {} };
for (const [k, v] of Object.entries(state)) {
  firestoreDoc.fields[k] = toFirestore(v);
}

console.log('📊 State to upload:');
console.log('  categories.data:', goodCategories.length);
console.log('  menuItems.data:', goodMenuItems.length);
console.log('  announcements.data:', cleanAnnouncements.length);
console.log('  promotions.data:', rawPromotions.length);
console.log('  adminUsers:', JSON.stringify(goodAdminUsers));
console.log('  ratingUrl:', goodRatingUrl);

console.log('\n📤 Uploading to Firestore via REST (PATCH = upsert)...');
const res = await fetch(FIRESTORE_URL, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(firestoreDoc),
});

if (res.ok) {
  const result = await res.json();
  console.log('\n✅ SUCCESS! Firestore doc updated.');
  console.log('  Name:', result.name);
  console.log('  UpdateTime:', result.updateTime);
} else {
  const err = await res.text();
  console.error('❌ Failed:', res.status, err);
  console.log('\n⚠️  If you get a 403 error, Firestore rules may need to allow writes.');
  console.log('   Go to Firebase Console > Firestore > Rules and set:');
  console.log('   rules_version = \'2\';');
  console.log('   service cloud.firestore {');
  console.log('     match /databases/{database}/documents {');
  console.log('       match /{document=**} { allow read, write: if true; }');
  console.log('     }');
  console.log('   }');
}
