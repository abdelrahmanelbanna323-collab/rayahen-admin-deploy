import fs from 'fs';

const SUPABASE_URL = 'https://acmmilazknnircuquozr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

async function restore() {
  console.log('Reading restored_state.json...');
  const data = JSON.parse(fs.readFileSync('d:/Projects/rayahen-admin-deploy/restored_state.json', 'utf8'));
  const state = data.state;
  
  console.log('Reading extracted_menu_fb.json...');
  const menuItems = JSON.parse(fs.readFileSync('d:/Projects/rayahen-admin-deploy/scratch/extracted_menu_fb.json', 'utf8'));
  
  state.menuItems = menuItems;
  
  console.log(`Ready to upload ${state.menuItems.length} items and ${state.categories.length} categories.`);
  
  const payload = {
    id: 'rayahen_menu_storage',
    data: state
  };
  
  fs.writeFileSync('d:/Projects/rayahen-admin-deploy/scratch/final_state.json', JSON.stringify(payload, null, 2));
  
  console.log('Uploading to Supabase via REST...');
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/menu_state`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  });
  
  if (res.ok) {
    console.log(`✅ Successfully restored ${state.menuItems.length} items and ${state.categories.length} categories to Supabase!`);
  } else {
    console.error('Failed to upload to Supabase:', res.status, await res.text());
  }
}

restore();
