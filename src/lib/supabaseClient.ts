import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://acmmilazknnircuquozr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadToSupabase = async (file: File | Blob): Promise<string> => {
  const fileNameStr = (file as File).name || 'file.jpg';
  const fileExt = fileNameStr.split('.').pop() || (file.type?.includes('png') ? 'png' : file.type?.includes('video') ? 'mp4' : 'jpg');
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${fileName}`;
  const contentType = file.type || (fileExt === 'mp4' ? 'video/mp4' : 'image/jpeg');

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('انتهت مهلة الرفع. يرجى التحقق من سرعة الاتصال.')), 25000)
  );

  const uploadPromise = (async (): Promise<string> => {
    // 1. Try via Supabase JS SDK client
    try {
      const { data, error } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, { upsert: true, contentType });

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('menu-images')
          .getPublicUrl(filePath);
        return publicUrl;
      }
    } catch (sdkErr) {
      console.warn('Supabase SDK upload failed, attempting direct fetch...', sdkErr);
    }

    // 2. Direct REST upload fallback
    const res = await fetch(`${supabaseUrl}/storage/v1/object/menu-images/${filePath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        'Content-Type': contentType,
        'x-upsert': 'true'
      },
      body: file
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`فشل رفع الملف: ${res.status} ${errText}`);
    }

    return `${supabaseUrl}/storage/v1/object/public/menu-images/${filePath}`;
  })();

  return Promise.race([uploadPromise, timeoutPromise]);
};
