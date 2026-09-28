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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testPerf() {
  console.log("Reading menu_state/global...");
  const t0 = Date.now();
  const d = await getDoc(doc(db, 'menu_state', 'global'));
  console.log("Read completed in", Date.now() - t0, "ms");
  
  if (d.exists()) {
    const data = d.data();
    const jsonStr = JSON.stringify(data);
    console.log("Document JSON size:", (jsonStr.length / 1024).toFixed(2), "KB");
    
    // Check if there are any data: or blob: urls in announcements or items
    let hasBase64 = false;
    for (const item of data.menuItems?.data || []) {
      if (item.imageUrl?.startsWith('data:')) {
        hasBase64 = true;
        console.log("Found base64 in menuItem:", item.nameAr, item.imageUrl.length);
      }
    }
    for (const ann of data.announcements?.data || []) {
      if (ann.imageUrl?.startsWith('data:')) {
        hasBase64 = true;
        console.log("Found base64 in announcement:", ann.titleAr, ann.imageUrl.length);
      }
      if (ann.branchOverrides) {
        for (const [b, ov] of Object.entries(ann.branchOverrides)) {
          if (ov.imageUrl?.startsWith('data:')) {
            console.log("Found base64 in announcement override:", b, ov.imageUrl.length);
          }
        }
      }
    }
    console.log("Has base64?", hasBase64);

    console.log("Testing write time to menu_state/global...");
    const t1 = Date.now();
    data.settings.updatedAt = new Date().toISOString();
    await setDoc(doc(db, 'menu_state', 'global'), data);
    console.log("Write completed in", Date.now() - t1, "ms");
  }
}

testPerf();
