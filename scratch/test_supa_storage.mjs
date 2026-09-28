const supabaseUrl = 'https://acmmilazknnircuquozr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

async function testStorageApi() {
  const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    }
  });
  const data = await res.json();
  console.log("Buckets:", data);

  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/menu-images/test-${Date.now()}.txt`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      'Content-Type': 'text/plain',
      'x-upsert': 'true'
    },
    body: 'hello world'
  });
  console.log("Upload status:", uploadRes.status, await uploadRes.text());
}

testStorageApi();
