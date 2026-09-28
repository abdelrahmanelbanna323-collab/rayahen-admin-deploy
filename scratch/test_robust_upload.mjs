const supabaseUrl = 'https://acmmilazknnircuquozr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

async function uploadToSupabaseTest(fileBuffer, mimeType, name) {
  const fileExt = name.split('.').pop() || 'jpg';
  const filePath = `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  
  const res = await fetch(`${supabaseUrl}/storage/v1/object/menu-images/${filePath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      'Content-Type': mimeType,
      'x-upsert': 'true'
    },
    body: fileBuffer
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload error: ${res.status} ${errText}`);
  }

  const url = `${supabaseUrl}/storage/v1/object/public/menu-images/${filePath}`;
  return url;
}

async function run() {
  const testBuf = Buffer.from("test image content");
  const url = await uploadToSupabaseTest(testBuf, "image/png", "sample.png");
  console.log("Success! Generated URL:", url);
  const checkRes = await fetch(url);
  console.log("Verified URL status:", checkRes.status);
}

run();
