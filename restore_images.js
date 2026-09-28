const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, setDoc } = require('firebase/firestore');

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

const CLOUD_NAME = 'eafi192e';
const PRESET = 'rayahen_preset';

async function uploadToCloudinary(base64Image) {
  try {
    const formData = new URLSearchParams();
    formData.append('file', base64Image);
    formData.append('upload_preset', PRESET);
    
    // using native fetch which is available in Node 18+
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return data.secure_url;
    } else {
      console.log('Failed to upload to Cloudinary', await res.text());
      return null;
    }
  } catch (err) {
    console.error('Error uploading:', err);
    return null;
  }
}

async function runMigration() {
  console.log('Fetching new menuItems document...');
  const menuDocRef = doc(db, 'rayahen_menu', 'menuItems');
  const menuDoc = await getDoc(menuDocRef);
  if (!menuDoc.exists()) {
    console.log('No new menu items doc found!');
    return;
  }
  
  let newItems = menuDoc.data().data || [];
  console.log(`Found ${newItems.length} items in the new document.`);

  console.log('Fetching old items from rayahen_menu_items...');
  const oldColRef = collection(db, 'rayahen_menu_items');
  const oldDocs = await getDocs(oldColRef);
  
  const oldItemsMap = new Map();
  oldDocs.forEach(d => {
    oldItemsMap.set(d.id, d.data());
  });
  console.log(`Found ${oldItemsMap.size} items in the old collection.`);

  let updatedCount = 0;

  for (let i = 0; i < newItems.length; i++) {
    const item = newItems[i];
    if (!item.imageUrl || item.imageUrl === '') {
      const oldItem = oldItemsMap.get(item.id);
      if (oldItem && oldItem.imageUrl && oldItem.imageUrl.startsWith('data:')) {
        console.log(`Restoring image for: ${item.nameAr} ...`);
        const cloudUrl = await uploadToCloudinary(oldItem.imageUrl);
        if (cloudUrl) {
          item.imageUrl = cloudUrl;
          updatedCount++;
          console.log(`[SUCCESS] Cloudinary URL: ${cloudUrl}`);
        }
      } else if (oldItem && oldItem.imageUrl && oldItem.imageUrl.startsWith('http')) {
        item.imageUrl = oldItem.imageUrl;
        updatedCount++;
        console.log(`[RESTORED] HTTP URL for ${item.nameAr}`);
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`Saving ${updatedCount} restored images to Firestore...`);
    await setDoc(menuDocRef, { data: newItems, updatedAt: new Date().toISOString() }, { merge: true });
    console.log('Migration complete!');
  } else {
    console.log('No images needed restoration.');
  }
  
  process.exit(0);
}

runMigration().catch(console.error);
