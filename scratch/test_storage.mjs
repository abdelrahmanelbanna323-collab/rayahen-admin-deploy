import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const buckets = [
  "rayahen-menu.appspot.com",
  "rayahen-menu.firebasestorage.app"
];

for (const b of buckets) {
  const firebaseConfig = {
    apiKey: "AIzaSyBossqusBFLn4kc1Vu9XqYRmrQwsHV-MfI",
    authDomain: "rayahen-menu.firebaseapp.com",
    projectId: "rayahen-menu",
    storageBucket: b,
    messagingSenderId: "58816652625",
    appId: "1:58816652625:web:804f52aba81ccfd1f95f70"
  };

  const app = initializeApp(firebaseConfig, b);
  const storage = getStorage(app);

  console.log("\nTesting bucket:", b);
  try {
    const dummyBuffer = Buffer.from("test image data");
    const testRef = ref(storage, `test/${Date.now()}.txt`);
    const snapshot = await uploadBytes(testRef, dummyBuffer);
    console.log("Upload snapshot:", snapshot.metadata.fullPath);
    const url = await getDownloadURL(snapshot.ref);
    console.log("Upload SUCCESS! URL:", url);
  } catch (err) {
    console.error("Upload FAILED:", err.code, err.status_, err.message);
  }
}
