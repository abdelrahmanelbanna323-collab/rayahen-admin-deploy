import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBossqusBFLn4kc1Vu9XqYRmrQwsHV-MfI",
  authDomain: "rayahen-menu.firebaseapp.com",
  projectId: "rayahen-menu",
  storageBucket: "rayahen-menu.appspot.com",
  messagingSenderId: "58816652625",
  appId: "1:58816652625:web:804f52aba81ccfd1f95f70"
};

const supabaseUrl = 'https://acmmilazknnircuquozr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

async function uploadBase64ToSupabase(base64Str, prefix = 'ann') {
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const ext = mimeType.split('/')[1] || 'jpg';
  const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

  const res = await fetch(`${supabaseUrl}/storage/v1/object/menu-images/${fileName}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      'Content-Type': mimeType,
      'x-upsert': 'true'
    },
    body: buffer
  });

  if (!res.ok) {
    console.error("Failed to upload base64 to Supabase:", res.status, await res.text());
    return null;
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/menu-images/${fileName}`;
  console.log("Uploaded base64 to Supabase successfully:", publicUrl);
  return publicUrl;
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanBase64() {
  const d = await getDoc(doc(db, 'menu_state', 'global'));
  if (!d.exists()) return;
  const data = d.data();

  let modified = false;

  for (const ann of data.announcements?.data || []) {
    if (ann.imageUrl?.startsWith('data:')) {
      const url = await uploadBase64ToSupabase(ann.imageUrl, 'ann_main');
      if (url) {
        ann.imageUrl = url;
        modified = true;
      }
    }
    if (ann.branchOverrides) {
      for (const [branch, ov] of Object.entries(ann.branchOverrides)) {
        if (ov.imageUrl?.startsWith('data:')) {
          console.log(`Uploading base64 for branch [${branch}]...`);
          const url = await uploadBase64ToSupabase(ov.imageUrl, `ann_${branch}`);
          if (url) {
            ov.imageUrl = url;
            modified = true;
          }
        }
      }
    }
  }

  for (const item of data.menuItems?.data || []) {
    if (item.imageUrl?.startsWith('data:')) {
      const url = await uploadBase64ToSupabase(item.imageUrl, 'item');
      if (url) {
        item.imageUrl = url;
        modified = true;
      }
    }
  }

  if (modified) {
    data.settings.updatedAt = new Date().toISOString();
    await setDoc(doc(db, 'menu_state', 'global'), data);
    console.log("SUCCESS! Cleaned all base64 from Firestore. New size:", (JSON.stringify(data).length / 1024).toFixed(2), "KB");
  } else {
    console.log("No base64 needed cleaning.");
  }
}

cleanBase64();
