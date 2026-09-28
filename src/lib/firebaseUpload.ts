import { uploadToSupabase } from '@/lib/supabaseClient';

export const uploadToFirebaseStorage = async (file: Blob | File, folder: string = 'uploads'): Promise<string> => {
  return await uploadToSupabase(file);
};
