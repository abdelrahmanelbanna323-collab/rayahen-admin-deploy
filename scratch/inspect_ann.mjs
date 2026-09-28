import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function inspectAnnouncements() {
  const d = await getDoc(doc(db, 'menu_state', 'global'));
  if (d.exists()) {
    const data = d.data();
    for (const ann of data.announcements?.data || []) {
      console.log("ID:", ann.id, "TitleAr:", ann.titleAr, "isActive:", ann.isActive);
      console.log("Main imageUrl starts with:", ann.imageUrl?.substring(0, 50));
      if (ann.branchOverrides) {
        for (const [branch, ov] of Object.entries(ann.branchOverrides)) {
          console.log(`  Branch [${branch}]:`, "titleAr:", ov.titleAr, "isActive:", ov.isActive, "imageUrl prefix:", ov.imageUrl?.substring(0, 50), "length:", ov.imageUrl?.length);
        }
      }
    }
  }
}

inspectAnnouncements();
