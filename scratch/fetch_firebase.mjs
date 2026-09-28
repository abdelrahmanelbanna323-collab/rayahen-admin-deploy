import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyBossqusBFLn4kc1Vu9XqYRmrQwsHV-MfI",
  authDomain: "rayahen-menu.firebaseapp.com",
  projectId: "rayahen-menu",
  storageBucket: "rayahen-menu.firebasestorage.app",
  messagingSenderId: "58816652625",
  appId: "1:58816652625:web:804f52aba81ccfd1f95f70"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchAll() {
  try {
    console.log("Fetching categories...");
    const catSnapshot = await getDocs(collection(db, "categories"));
    const categories = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Found ${categories.length} categories.`);
    
    console.log("Fetching menuItems...");
    const menuSnapshot = await getDocs(collection(db, "menuItems"));
    const menuItems = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Found ${menuItems.length} menu items.`);
    
    fs.writeFileSync('firebase_backup.json', JSON.stringify({ categories, menuItems }, null, 2));
    console.log("Saved to firebase_backup.json");
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchAll();
