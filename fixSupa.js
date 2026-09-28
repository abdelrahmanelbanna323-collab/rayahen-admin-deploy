const fs = require('fs');
const path = require('path');

const dashPath = 'src/app/(admin)/dashboard/page.tsx';
let dashStr = fs.readFileSync(dashPath, 'utf8');
dashStr = dashStr.replace(/في السحابة \(Supabase\)/g, 'في السحابة (Firebase)');
dashStr = dashStr.replace(/إعدادات Supabase/g, 'إعدادات Firebase');
fs.writeFileSync(dashPath, dashStr);

const supaPath = 'src/lib/supabaseClient.ts';
let supaStr = fs.readFileSync(supaPath, 'utf8');
if (!supaStr.includes('uploadToSupabase')) {
  supaStr += `
export const uploadToSupabase = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = \`\${Math.random().toString(36).substring(2, 15)}.\${fileExt}\`;
    const filePath = \`\${fileName}\`;
    
    const { data, error } = await supabase.storage
      .from('rayahen-images')
      .upload(filePath, file, { upsert: true });
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('rayahen-images')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    return null;
  }
};
`;
  fs.writeFileSync(supaPath, supaStr);
}

const compDir = 'src/components/admin';
fs.readdirSync(compDir).forEach(f => {
  const fp = path.join(compDir, f);
  if (!fp.endsWith('.tsx')) return;
  let c = fs.readFileSync(fp, 'utf8');
  if (c.includes('uploadToCloudinary')) {
    c = c.replace(/uploadToCloudinary/g, 'uploadToSupabase');
    c = c.replace(/@\/lib\/cloudinaryUpload/g, '@/lib/supabaseClient');
    fs.writeFileSync(fp, c);
    console.log('Updated ' + f);
  }
});
