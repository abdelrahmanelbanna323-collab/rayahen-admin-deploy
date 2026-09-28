import fs from 'fs';

const SUPABASE_URL = 'https://acmmilazknnircuquozr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

console.log('📖 Reading final_state.json (the MASTER backup with 15 cats + 313 items)...');
const goodData = JSON.parse(fs.readFileSync('d:/Projects/rayahen-admin-deploy/scratch/final_state.json', 'utf8'));
const goodCategories = goodData.data.categories;  // 15 categories
const goodMenuItems  = goodData.data.menuItems;    // 313 items
console.log(`✅ Loaded: ${goodCategories.length} categories, ${goodMenuItems.length} items`);

console.log('\n📡 Fetching rayahen_menu_storage (has correct admin + announcements)...');
const storageRes = await fetch(`${SUPABASE_URL}/rest/v1/menu_state?id=eq.rayahen_menu_storage&select=data`, {
  headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
}).then(r => r.json());
const storageData = storageRes[0].data;

// ====== من rayahen_menu_storage ======
const goodAdminUsers = Array.isArray(storageData.adminUsers)
  ? storageData.adminUsers
  : storageData.adminUsers?.data;

const rawAnnouncements = Array.isArray(storageData.announcements)
  ? storageData.announcements
  : storageData.announcements?.data;

// تنظيف صور Base64 من الإعلانات
const cleanAnnouncements = rawAnnouncements?.map(a => ({
  ...a,
  imageUrl: a.imageUrl && !a.imageUrl.startsWith('data:') ? a.imageUrl : undefined,
  branchOverrides: a.branchOverrides || {}
}));

const rawPromotions = Array.isArray(storageData.promotions)
  ? storageData.promotions
  : storageData.promotions?.data;

const goodRatingUrl = storageData.ratingUrl || 'https://rayahen-rating.vercel.app/';
const goodVatSettings = storageData.vatSettings || {};

const updatedAt = new Date().toISOString();

console.log('\n📊 Data to merge:');
console.log('  ✅ categories: 15 (from final_state.json)');
console.log('  ✅ menuItems: 313 (from final_state.json)');
console.log('  ✅ adminUsers:', JSON.stringify(goodAdminUsers));
console.log('  ✅ announcements:', cleanAnnouncements?.length, 'items');
console.log('  ✅ promotions:', rawPromotions?.length, 'items');
console.log('  ✅ ratingUrl:', goodRatingUrl);

// ====== البناء الكامل بالبنية {data:[...]} التي يتوقعها الكود ======
const masterGlobalData = {
  categories:    { data: goodCategories,    updatedAt },  // 15 قسم ✅
  menuItems:     { data: goodMenuItems,     updatedAt },  // 313 صنف ✅
  announcements: { data: cleanAnnouncements, updatedAt }, // 2 إعلان ✅
  promotions:    { data: rawPromotions,     updatedAt },  // 2 بروموشن ✅
  settings: {
    adminUsers: goodAdminUsers,   // باسوورد 202026 ✅
    ratingUrl:  goodRatingUrl,
    vatSettings: goodVatSettings,
    updatedAt,
  },
};

console.log('\n📤 Uploading MASTER global data to Supabase...');
const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/menu_state?id=eq.global`, {
  method: 'PATCH',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  },
  body: JSON.stringify({ data: masterGlobalData }),
});

if (updateRes.ok) {
  const updated = await updateRes.json();
  const ud = updated[0]?.data;
  console.log('\n✅ ✅ ✅  FULL RESTORE SUCCESS!');
  console.log('  categories.data.length :', ud?.categories?.data?.length, '(expected 15)');
  console.log('  menuItems.data.length  :', ud?.menuItems?.data?.length, '(expected 313)');
  console.log('  announcements.data.len :', ud?.announcements?.data?.length);
  console.log('  promotions.data.length :', ud?.promotions?.data?.length);
  console.log('  admin passwordHash     :', ud?.settings?.adminUsers?.[0]?.passwordHash, '(expected 202026)');
  console.log('  ratingUrl              :', ud?.settings?.ratingUrl);
} else {
  const errText = await updateRes.text();
  console.error('❌ Failed:', updateRes.status, errText);
}
