import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export const uploadToFirebaseStorage = async (file: Blob | File, folder: string = 'menu-images'): Promise<string> => {
  try {
    const fileExt = file.type === 'video/mp4' ? 'mp4'
      : file.type === 'image/webp' ? 'webp'
      : file.type === 'image/png' ? 'png'
      : file.type === 'image/gif' ? 'gif'
      : 'jpg';
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const storageRef = ref(storage, filename);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    throw error;
  }
};
