// تم التحويل من Cloudinary → Supabase → Firebase Storage
import { uploadToFirebaseStorage } from '@/lib/firebaseUpload';

export const uploadToCloudinary = async (file: Blob | File): Promise<string> => {
  return await uploadToFirebaseStorage(file, 'menu-images');
};
