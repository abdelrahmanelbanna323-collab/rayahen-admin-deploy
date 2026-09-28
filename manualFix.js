const fs = require('fs');
let c = fs.readFileSync('src/store/useMenuStore.ts', 'utf8');

const startIdx = c.indexOf('let syncTimeout: NodeJS.Timeout | null = null;');
const endIdx = c.indexOf('export const useMenuStore = create');

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `let syncTimeout: NodeJS.Timeout | null = null;
const syncStateToFirestore = async (
  state: MenuStoreState,
  setStatus?: (s: 'success' | 'error', msg?: string) => void
) => {
  if (typeof window === 'undefined') return;
  
  if (syncTimeout) clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(async () => {
    try {
      const updatedAt = new Date().toISOString();
      const categoriesPayload = sanitize({ data: state.categories, updatedAt });
      const menuItemsPayload = sanitize({ data: state.menuItems, updatedAt });
      const promotionsPayload = sanitize({ data: state.promotions, updatedAt });
      const announcementsPayload = sanitize({ data: state.announcements, updatedAt });
      const settingsPayload = sanitize({ adminUsers: state.adminUsers, ratingUrl: state.ratingUrl || '', vatSettings: state.vatSettings || {}, updatedAt });
      
      const stateData = {
        categories: categoriesPayload,
        menuItems: menuItemsPayload,
        promotions: promotionsPayload,
        announcements: announcementsPayload,
        settings: settingsPayload,
      };

      const syncPromise = setDoc(doc(db, 'menu_state', 'global'), stateData);

      await syncPromise;
      console.log('🔥 Synced to Firestore successfully!');
      setStatus?.('success');
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error('❌ Firestore sync error:', msg);
      setStatus?.('error', msg);
    }
  }, 1500);
};

`;
  
  c = c.substring(0, startIdx) + replacement + c.substring(endIdx);
  fs.writeFileSync('src/store/useMenuStore.ts', c);
  console.log('Fixed successfully');
}
