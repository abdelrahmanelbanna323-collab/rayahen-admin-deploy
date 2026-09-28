import fs from 'fs';

let code = fs.readFileSync('src/store/useMenuStore.ts', 'utf8');

// 1. Revert Imports
code = code.replace(
  `const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;\nconst SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || '';`,
  `import { db } from '@/lib/firebase';\nimport { doc, setDoc, onSnapshot } from 'firebase/firestore';`
);

// 2. Revert syncStateToFirestore
const syncStart = code.indexOf(`// Helper to push state to Supabase safely`);
const syncEnd = code.indexOf(`export const useMenuStore`);
if (syncStart !== -1 && syncEnd !== -1) {
  const replacement = `// Helper to push state to Firestore safely — returns success/error
const syncStateToFirestore = async (
  state: MenuStoreState,
  setStatus?: (s: 'success' | 'error', msg?: string) => void
) => {
  if (typeof window === 'undefined') return;
  try {
    const updatedAt = new Date().toISOString();
    const cleanImage = (url: string | undefined) => (url && (url.startsWith('data:') || url.startsWith('blob:'))) ? '' : url;
    
    const cleanCategories = state.categories.map(c => ({ ...c, imageUrl: cleanImage(c.imageUrl) }));
    const categoriesPayload = sanitize({ data: cleanCategories, updatedAt });
    
    const cleanMenuItems = state.menuItems.map(item => ({ ...item, imageUrl: cleanImage(item.imageUrl) }));
    const menuItemsPayload = sanitize({ data: cleanMenuItems, updatedAt });
    
    const cleanPromotions = state.promotions.map(p => ({ ...p, imageUrl: cleanImage(p.imageUrl) }));
    const promotionsPayload = sanitize({ data: cleanPromotions, updatedAt });
    
    const cleanAnnouncements = state.announcements.map(a => ({
      ...a, 
      branchOverrides: Object.fromEntries(
        Object.entries(a.branchOverrides || {}).map(([k, v]) => [k, { ...v, imageUrl: cleanImage(v.imageUrl) }])
      )
    }));
    const announcementsPayload = sanitize({ data: cleanAnnouncements, updatedAt });
    const settingsPayload = sanitize({ adminUsers: state.adminUsers, ratingUrl: state.ratingUrl || '', vatSettings: state.vatSettings || {}, updatedAt });
    
    const stateData = {
      categories: categoriesPayload,
      menuItems: menuItemsPayload,
      promotions: promotionsPayload,
      announcements: announcementsPayload,
      settings: settingsPayload,
    };

    const syncPromise = setDoc(doc(db, 'menu_state', 'global'), stateData, { merge: true });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('انتهى وقت الاتصال بالسحابة (20 ثانية).')), 20000)
    );
    await Promise.race([syncPromise, timeoutPromise]);
    console.log('🔥 Synced to Firestore successfully!');
    setStatus?.('success');
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error('❌ Firestore sync error:', msg);
    setStatus?.('error', msg);
  }
};\n\n`;

  code = code.substring(0, syncStart) + replacement + code.substring(syncEnd);
}

// 3. Revert initSupabaseListener
const listenerStart = code.indexOf(`// Realtime Listener (Supabase polling)`);
const listenerEnd = code.indexOf(`// Menu Item Actions`);
if (listenerStart !== -1 && listenerEnd !== -1) {
  const replacementListener = `// Realtime Listener (Firebase Firestore)
      initSupabaseListener: () => {
        if (typeof window === 'undefined') return;

        if (get().unsubListeners) return get().unsubListeners!;

        try {
          const docRef = doc(db, 'menu_state', 'global');

          const applyData = (data: any) => {
            if (!data) return;
            if (data.categories?.data) set({ categories: data.categories.data, isSupabaseSynced: true });
            if (data.promotions?.data) set({ promotions: data.promotions.data });
            if (data.announcements?.data) set({ announcements: data.announcements.data });
            if (data.settings) {
              set({
                adminUsers: data.settings.adminUsers || get().adminUsers,
                ratingUrl: data.settings.ratingUrl || get().ratingUrl,
                vatSettings: data.settings.vatSettings || get().vatSettings || {},
              });
            }
            const serverTimestamp = data.settings?.updatedAt ? new Date(data.settings.updatedAt).getTime() : 0;
            const localTimestamp = get().lastItemsUpdatedAt || 0;
            if (get().menuItems.length === 0 || serverTimestamp > localTimestamp) {
              if (data.menuItems?.data) {
                const items = data.menuItems.data as MenuItem[];
                items.sort((a: any, b: any) => (a.orderIndex ?? 99999) - (b.orderIndex ?? 99999));
                set({ menuItems: items, lastItemsUpdatedAt: serverTimestamp });
              }
            }
          };

          const unsub = onSnapshot(docRef, (snap) => {
            if (snap.exists()) applyData(snap.data());
          }, (e) => {
            console.log('Firestore listener error, local mode active.', e);
          });

          const cleanup = () => {
            unsub();
            set({ unsubListeners: null });
          };

          set({ unsubListeners: cleanup });
          return cleanup;
        } catch (e) {
          console.log('Firestore listener status: Local mode active.', e);
        }
      },

      `;
  
  code = code.substring(0, listenerStart) + replacementListener + code.substring(listenerEnd);
}

fs.writeFileSync('src/store/useMenuStore.ts', code);
console.log('Reverted useMenuStore.ts back to Firebase successfully!');
