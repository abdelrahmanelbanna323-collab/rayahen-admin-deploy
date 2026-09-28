import fs from 'fs';

const SUPABASE_URL = 'https://acmmilazknnircuquozr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

// القراءة من final_state.json (الداتا الصحيحة)
console.log('📖 Reading final_state.json (the correct backup)...');
const goodData = JSON.parse(fs.readFileSync('d:/Projects/rayahen-admin-deploy/scratch/final_state.json', 'utf8'));
const goodCategories = goodData.data.categories;  // 15 categories as array
const goodMenuItems = goodData.data.menuItems;      // 313 items as array

console.log(`✅ Loaded: ${goodCategories.length} categories, ${goodMenuItems.length} items`);

// جلب الـ global row الحالي عشان نحافظ على settings وبقية الحاجات
console.log('📡 Fetching current global row from Supabase...');
const res = await fetch(`${SUPABASE_URL}/rest/v1/menu_state?id=eq.global&select=*`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  }
});
const rows = await res.json();

if (!rows || rows.length === 0) {
  console.error('❌ global row not found!');
  process.exit(1);
}

const currentData = rows[0].data;
console.log(`📊 Current global: cats type=${typeof currentData.categories}, items type=${typeof currentData.menuItems}`);

// بناء الـ data بالبنية الصح التي يتوقعها الكود: {data: [...]}
// الكود في useMenuStore.ts يبحث عن: data.categories.data ، data.menuItems.data
const fixedData = {
  ...currentData,
  categories: { data: goodCategories },   // ✅ البنية الصح: {data: [...15 قسم...]}
  menuItems:  { data: goodMenuItems },     // ✅ البنية الصح: {data: [...313 صنف...]}
};

console.log(`🔧 Fixed data structure:`);
console.log(`   - categories.data: ${fixedData.categories.data.length} items`);
console.log(`   - menuItems.data: ${fixedData.menuItems.data.length} items`);
console.log(`   - settings.updatedAt: ${fixedData.settings?.updatedAt}`);

// رفع الـ global المصلوح
console.log('📤 Uploading fixed global row to Supabase...');
const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/menu_state?id=eq.global`, {
  method: 'PATCH',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  },
  body: JSON.stringify({ data: fixedData }),
});

if (updateRes.ok) {
  const updated = await updateRes.json();
  const ud = updated[0]?.data;
  console.log(`✅ SUCCESS! Updated global row:`);
  console.log(`   - categories.data.length: ${ud?.categories?.data?.length}`);
  console.log(`   - menuItems.data.length: ${ud?.menuItems?.data?.length}`);
  console.log(`   - Settings preserved: ${!!ud?.settings}`);
} else {
  const errText = await updateRes.text();
  console.error('❌ Failed to update:', updateRes.status, errText);
}
