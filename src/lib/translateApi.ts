export async function translateText(text: string, toLang: 'en' | 'it' | 'ru'): Promise<string> {
  if (!text) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    return '';
  } catch (error) {
    console.error('Translation error:', error);
    return '';
  }
}