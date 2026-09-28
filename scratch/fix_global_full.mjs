import fs from 'fs';

const SUPABASE_URL = 'https://acmmilazknnircuquozr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

console.log('📡 Fetching both rows from Supabase...');

const [globalRes, storageRes] = await Promise.all([
  fetch(`${SUPABASE_URL}/rest/v1/menu_state?id=eq.global&select=data`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  }).then(r => r.json()),
  fetch(`${SUPABASE_URL}/rest/v1/menu_state?id=eq.rayahen_menu_storage&select=data`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  }).then(r => r.json()),
]);

const globalData = globalRes[0].data;
const storageData = storageRes[0].data;

// ====== من rayahen_menu_storage ======
// adminUsers (الصح)
const goodAdminUsers = Array.isArray(storageData.adminUsers) 
  ? storageData.adminUsers 
  : storageData.adminUsers?.data;

// announcements (بالبنية {data:[...]} التي يتوقعها الكود)
const rawAnnouncements = Array.isArray(storageData.announcements) 
  ? storageData.announcements 
  : storageData.announcements?.data;

// نمسح صور Base64 من الإعلانات (كبيرة جداً للـ DB)
const cleanAnnouncements = rawAnnouncements?.map(a => ({
  ...a,
  // نحتفظ بالصورة فقط لو كانت URL حقيقي (مش base64)
  imageUrl: a.imageUrl && !a.imageUrl.startsWith('data:') ? a.imageUrl : undefined,
  branchOverrides: a.branchOverrides || {}
}));

// promotions (الصح من storage)
const rawPromotions = Array.isArray(storageData.promotions) 
  ? storageData.promotions 
  : storageData.promotions?.data;

// ratingUrl
const goodRatingUrl = storageData.ratingUrl || globalData.settings?.ratingUrl || '';

console.log('📊 From rayahen_menu_storage:');
console.log('  adminUsers:', JSON.stringify(goodAdminUsers));
console.log('  announcements count:', cleanAnnouncements?.length);
console.log('  promotions count:', rawPromotions?.length);
console.log('  ratingUrl:', goodRatingUrl);

// ====== بناء الـ global المصلوح ======
const updatedAt = new Date().toISOString();

const fixedGlobalData = {
  ...globalData,
  // settings مع الباسوورد الصح
  settings: {
    ...globalData.settings,
    adminUsers: goodAdminUsers,
    ratingUrl: goodRatingUrl,
    updatedAt,
  },
  // announcements بالبنية الصح {data:[...]}
  announcements: {
    data: cleanAnnouncements,
    updatedAt,
  },
  // promotions بالبنية الصح {data:[...]}
  promotions: {
    data: rawPromotions,
    updatedAt,
  },
  // categories و menuItems موجودين ومصلوحين بالفعل
};

console.log('\n🔧 Fixed global will have:');
console.log('  settings.adminUsers:', JSON.stringify(fixedGlobalData.settings.adminUsers));
console.log('  announcements.data.length:', fixedGlobalData.announcements.data?.length);
console.log('  promotions.data.length:', fixedGlobalData.promotions.data?.length);
console.log('  categories.data.length:', fixedGlobalData.categories?.data?.length);
console.log('  menuItems.data.length:', fixedGlobalData.menuItems?.data?.length);

console.log('\n📤 Uploading fixed global to Supabase...');
const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/menu_state?id=eq.global`, {
  method: 'PATCH',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  },
  body: JSON.stringify({ data: fixedGlobalData }),
});

if (updateRes.ok) {
  const updated = await updateRes.json();
  const ud = updated[0]?.data;
  console.log('\n✅ SUCCESS! Final global row:');
  console.log('  categories.data:', ud?.categories?.data?.length, 'items');
  console.log('  menuItems.data:', ud?.menuItems?.data?.length, 'items');
  console.log('  announcements.data:', ud?.announcements?.data?.length, 'items');
  console.log('  promotions.data:', ud?.promotions?.data?.length, 'items');
  console.log('  adminPassword:', ud?.settings?.adminUsers?.[0]?.passwordHash);
  console.log('  ratingUrl:', ud?.settings?.ratingUrl);
} else {
  const errText = await updateRes.text();
  console.error('❌ Failed:', updateRes.status, errText);
}
