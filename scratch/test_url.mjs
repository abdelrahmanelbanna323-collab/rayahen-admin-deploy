const supabaseUrl = 'https://acmmilazknnircuquozr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

async function testUploadAndFetch() {
  const fileName = `test_${Date.now()}.png`;
  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/menu-images/${fileName}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      'Content-Type': 'image/png',
      'x-upsert': 'true'
    },
    body: Buffer.from("dummy-png-data")
  });
  console.log("Upload HTTP status:", uploadRes.status);
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/menu-images/${fileName}`;
  console.log("Public URL:", publicUrl);

  const getRes = await fetch(publicUrl);
  console.log("Get Public URL HTTP status:", getRes.status);
}

testUploadAndFetch();
