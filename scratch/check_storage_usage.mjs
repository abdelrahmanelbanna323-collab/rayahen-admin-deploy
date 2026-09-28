const supabaseUrl = 'https://acmmilazknnircuquozr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

async function listFiles() {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/list/menu-images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ limit: 1000, prefix: '' })
  });
  const files = await res.json();
  console.log("Total files count:", files.length);
  let totalBytes = 0;
  for (const f of files) {
    if (f.metadata?.size) totalBytes += f.metadata.size;
  }
  console.log("Total bytes:", totalBytes, "MB:", (totalBytes / (1024 * 1024)).toFixed(2));
}

listFiles();
