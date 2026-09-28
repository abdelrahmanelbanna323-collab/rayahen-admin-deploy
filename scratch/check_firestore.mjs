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

async function check() {
  const d = await getDoc(doc(db, 'menu_state', 'global'));
  if (d.exists()) {
    const data = d.data();
    console.log("Firestore doc exists!");
    console.log("Categories count:", data.categories?.data?.length);
    console.log("MenuItems count:", data.menuItems?.data?.length);
    console.log("Announcements count:", data.announcements?.data?.length);
    console.log("Promotions count:", data.promotions?.data?.length);
    console.log("Settings:", data.settings);
    console.log("Updated at:", data.settings?.updatedAt);
  } else {
    console.log("Firestore doc DOES NOT EXIST!");
  }
}

check();
