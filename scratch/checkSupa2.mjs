import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://acmmilazknnircuquozr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase.from('menu_items').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Supabase has ${data.length} items in menu_items table.`);
    if (data.length > 0) {
      const fs = await import('fs');
      fs.writeFileSync('d:/Projects/rayahen-admin-deploy/scratch/supabase_dump.json', JSON.stringify(data, null, 2));
      console.log('Saved to supabase_dump.json');
    }
  }
}

check();
