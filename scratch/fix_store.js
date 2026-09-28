const fs = require('fs');

let code = fs.readFileSync('scratch/syncFix2.js', 'utf8');

// 1. Fix imports
code = code.replace(
  `import { supabase } from '@/lib/supabaseClient';`,
  `import { db } from '@/lib/firebase';\nimport { doc, setDoc, onSnapshot } from 'firebase/firestore';`
);

// 2. Replace syncStateToFirestore
const syncStart = code.indexOf(`// Helper to push state to Supabase safely`);
const syncEnd = code.indexOf(`export const useMenuStore = create`);

if (syncStart !== -1 && syncEnd !== -1) {
  const firebaseSync = `// Helper to push state to Firestore safely — returns success/error
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
    
    // We store the entire state as one row to make it simple and atomic
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

  code = code.substring(0, syncStart) + firebaseSync + code.substring(syncEnd);
}

// 3. Replace initSupabaseListener
const listenerStart = code.indexOf(`// Realtime Listener (Supabase polling)`);
const listenerEnd = code.indexOf(`// System Settings Actions`);

if (listenerStart !== -1 && listenerEnd !== -1) {
  const firebaseListener = `// Realtime Listener (Firebase Firestore)
      initSupabaseListener: () => {
        if (typeof window === 'undefined') return;

        // Prevent multiple listeners
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
  
  code = code.substring(0, listenerStart) + firebaseListener + code.substring(listenerEnd);
}

fs.writeFileSync('src/store/useMenuStore.ts', code);
console.log('Successfully reverted store to firebase from syncFix2.js!');
