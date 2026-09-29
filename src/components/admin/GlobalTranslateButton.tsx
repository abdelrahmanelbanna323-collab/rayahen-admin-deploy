"use client";

import React, { useState } from 'react';
import { useMenuStore } from '@/store/useMenuStore';
import { batchTranslate } from '@/lib/autoTranslate';
import type { Lang } from '@/lib/translations';

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
      let changesMade = false;

      // Helper to do translation for one entity
      const translateFields = async (text: string, currentEn: any, currentIt: any, currentRu: any) => {
        let en = currentEn; let it = currentIt; let ru = currentRu;
        let changed = false;
        
        if (text && !en) {
          const res = await batchTranslate([text], 'EN');
          en = res[0] || text; changed = true;
        }
        if (text && !it) {
          const res = await batchTranslate([text], 'IT');
          it = res[0] || text; changed = true;
        }
        if (text && !ru) {
          const res = await batchTranslate([text], 'RU');
          ru = res[0] || text; changed = true;
        }
        
        return { en, it, ru, changed };
      };

      // 1. Categories
      const newCategories = [...categories];
      for (let i = 0; i < newCategories.length; i++) {
        const cat = newCategories[i];
        if (cat.nameAr && (!cat.nameEn || !cat.nameIt || !cat.nameRu)) {
          setProgress(`جاري ترجمة القسم: ${cat.nameAr}`);
          const { en, it, ru, changed } = await translateFields(cat.nameAr, cat.nameEn, cat.nameIt, cat.nameRu);
          if (changed) {
            cat.nameEn = en; cat.nameIt = it; cat.nameRu = ru;
            changesMade = true;
          }
        }
      }
      if (changesMade) useMenuStore.setState({ categories: newCategories });

      // 2. Menu Items
      const newMenuItems = [...menuItems];
      let itemChanges = false;
      for (let i = 0; i < newMenuItems.length; i++) {
        const item = newMenuItems[i];
        
        // Name
        if (item.nameAr && (!item.nameEn || !item.nameIt || !item.nameRu)) {
          setProgress(`جاري ترجمة الصنف: ${item.nameAr}`);
          const { en, it, ru, changed } = await translateFields(item.nameAr, item.nameEn, item.nameIt, item.nameRu);
          if (changed) { item.nameEn = en; item.nameIt = it; item.nameRu = ru; itemChanges = true; }
        }
        // Description
        if (item.descriptionAr && (!item.descriptionEn || !item.descriptionIt || !item.descriptionRu)) {
          setProgress(`جاري ترجمة وصف: ${item.nameAr}`);
          const { en, it, ru, changed } = await translateFields(item.descriptionAr, item.descriptionEn, item.descriptionIt, item.descriptionRu);
          if (changed) { item.descriptionEn = en; item.descriptionIt = it; item.descriptionRu = ru; itemChanges = true; }
        }
      }
      if (itemChanges) {
        useMenuStore.setState({ menuItems: newMenuItems });
        changesMade = true;
      }

      // 3. Promotions
      const newPromos = [...promotions];
      let promoChanges = false;
      for (let i = 0; i < newPromos.length; i++) {
        const p = newPromos[i];
        if (p.titleAr && (!p.titleEn || !p.titleIt || !p.titleRu)) {
          setProgress(`جاري ترجمة العرض: ${p.titleAr}`);
          const { en, it, ru, changed } = await translateFields(p.titleAr, p.titleEn, p.titleIt, p.titleRu);
          if (changed) { p.titleEn = en; p.titleIt = it; p.titleRu = ru; promoChanges = true; }
        }
      }
      if (promoChanges) {
        useMenuStore.setState({ promotions: newPromos });
        changesMade = true;
      }

      // 4. Announcements
      const newAnns = [...announcements];
      let annChanges = false;
      for (let i = 0; i < newAnns.length; i++) {
        const p = newAnns[i];
        if (p.titleAr && (!p.titleEn || !(p as any).titleIt || !(p as any).titleRu)) {
          setProgress(`جاري ترجمة عنوان الإعلان: ${p.titleAr}`);
          const { en, it, ru, changed } = await translateFields(p.titleAr, p.titleEn, (p as any).titleIt, (p as any).titleRu);
          if (changed) { p.titleEn = en; (p as any).titleIt = it; (p as any).titleRu = ru; annChanges = true; }
        }
        if (p.contentAr && (!p.contentEn || !(p as any).contentIt || !(p as any).contentRu)) {
          setProgress(`جاري ترجمة محتوى الإعلان: ${p.titleAr}`);
          const { en, it, ru, changed } = await translateFields(p.contentAr, p.contentEn, (p as any).contentIt, (p as any).contentRu);
          if (changed) { p.contentEn = en; (p as any).contentIt = it; (p as any).contentRu = ru; annChanges = true; }
        }
      }
      if (annChanges) {
        useMenuStore.setState({ announcements: newAnns });
        changesMade = true;
      }

      if (changesMade) {
        setProgress('جاري الحفظ والسحابة...');
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
