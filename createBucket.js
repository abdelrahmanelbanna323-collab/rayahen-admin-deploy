const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const matchUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);
const matchKey = env.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);

if (!matchUrl || !matchKey) {
  console.error("Missing env");
  process.exit(1);
}

const supabaseUrl = matchUrl[1];
const supabaseKey = matchKey[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeBucket() {
  console.log("Checking bucket 'rayahen-images'...");
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.find(b => b.name === 'rayahen-images');
  
  if (exists) {
    console.log("Bucket already exists! Updating to public...");
    await supabase.storage.updateBucket('rayahen-images', { public: true });
  } else {
    console.log("Creating public bucket 'rayahen-images'...");
    const { data, error } = await supabase.storage.createBucket('rayahen-images', { public: true });
    if (error) {
      console.error("Error creating bucket:", error);
    } else {
      console.log("Bucket created successfully:", data);
    }
  }
}

makeBucket();
