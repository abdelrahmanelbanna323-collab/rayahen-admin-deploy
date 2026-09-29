"use client";

import React, { useState } from 'react';
import { useMenuStore } from '@/store/useMenuStore';
import { translateBatch, Lang } from '@/lib/autoTranslate';

export default function GlobalTranslateButton() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState('');
  const menuItems = useMenuStore((state) => state.menuItems);
  const categories = useMenuStore((state) => state.categories);
  const promotions = useMenuStore((state) => state.promotions);
  const announcements = useMenuStore((state) => state.announcements);
  const syncToFirebase = useMenuStore((state) => state.syncToFirebase);

  const handleTranslateAll = async () => {
    setIsTranslating(true);
    setProgress('جاري الترجمة...');

    try {
      const langsToTranslate: Lang[] = ['EN', 'IT', 'RU'];
      let changesMade = false;

      // 1. Categories
      const newCategories = [...categories];
      for (let i = 0; i < newCategories.length; i++) {
        const cat = newCategories[i];
        if (cat.nameAr && (!cat.nameEn || !cat.nameIt || !cat.nameRu)) {
          const reqs = langsToTranslate.map(l => ({ text: cat.nameAr, lang: l }));
          const results = await translateBatch(reqs);
          if (results[0] && !cat.nameEn) { cat.nameEn = results[0]; changesMade = true; }
          if (results[1] && !cat.nameIt) { cat.nameIt = results[1]; changesMade = true; }
          if (results[2] && !cat.nameRu) { cat.nameRu = results[2]; changesMade = true; }
        }
      }
      if (changesMade) useMenuStore.setState({ categories: newCategories });

      // 2. Menu Items
      const newMenuItems = [...menuItems];
      let itemChanges = false;
      for (let i = 0; i < newMenuItems.length; i++) {
        const item = newMenuItems[i];
        const reqs = [];
        
        // Name
        if (item.nameAr && (!item.nameEn || !item.nameIt || !item.nameRu)) {
          langsToTranslate.forEach(l => reqs.push({ text: item.nameAr, lang: l, key: 'name', itemIndex: i }));
        }
        // Description
        if (item.descriptionAr && (!item.descriptionEn || !item.descriptionIt || !item.descriptionRu)) {
          langsToTranslate.forEach(l => reqs.push({ text: item.descriptionAr, lang: l, key: 'desc', itemIndex: i }));
        }
        
        if (reqs.length > 0) {
           const texts = reqs.map(r => ({ text: r.text, lang: r.lang }));
           setProgress(`جاري ترجمة الصنف: ${item.nameAr}`);
           const results = await translateBatch(texts);
           results.forEach((res, idx) => {
             const r = reqs[idx];
             if (r.key === 'name') {
               if (r.lang === 'EN') item.nameEn = res;
               if (r.lang === 'IT') item.nameIt = res;
               if (r.lang === 'RU') item.nameRu = res;
               itemChanges = true;
             } else {
               if (r.lang === 'EN') item.descriptionEn = res;
               if (r.lang === 'IT') item.descriptionIt = res;
               if (r.lang === 'RU') item.descriptionRu = res;
               itemChanges = true;
             }
           });
        }
      }
      if (itemChanges) {
        useMenuStore.setState({ menuItems: newMenuItems });
        changesMade = true;
      }

      if (changesMade) {
        setProgress('جاري الحفظ...');
        await syncToFirebase();
        setProgress('تمت الترجمة والحفظ بنجاح!');
      } else {
        setProgress('كل شيء مترجم مسبقاً!');
      }

    } catch (e) {
      console.error(e);
      setProgress('حدث خطأ أثناء الترجمة.');
    } finally {
      setTimeout(() => {
        setIsTranslating(false);
        setProgress('');
      }, 3000);
    }
  };

  return (
    <button
      onClick={handleTranslateAll}
      disabled={isTranslating}
      title="ترجمة جميع النصوص المفقودة إلى الإنجليزية، الإيطالية، والروسية"
      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 w-full col-span-2 sm:col-span-1"
    >
      <span>{isTranslating ? '⏳' : '🌐'}</span>
      <span>{isTranslating ? progress : 'ترجمة تلقائية للكل'}</span>
    </button>
  );
}
