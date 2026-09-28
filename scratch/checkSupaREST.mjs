import fs from 'fs';

const SUPABASE_URL = 'https://acmmilazknnircuquozr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

async function check() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/menu_items?select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  if (res.ok) {
    const data = await res.json();
    console.log(`Supabase has ${data.length} items in menu_items table.`);
    fs.writeFileSync('d:/Projects/rayahen-admin-deploy/scratch/supabase_dump.json', JSON.stringify(data, null, 2));
  } else {
    console.error('Error:', res.status, await res.text());
  }
}

check();
