const fs = require('fs');

const file = 'src/store/useMenuStore.ts';
let content = fs.readFileSync(file, 'utf8');

const oldFuncRegex = /const syncStateToFirestore = async \([\s\S]*?\n\};\n/m;
const newFunc = `
let syncTimeout: NodeJS.Timeout | null = null;
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

content = content.replace(/let syncTimeout: NodeJS\.Timeout \| null = null;\nconst syncStateToFirestore = async \([\s\S]*?\n\};\n/, '');
content = content.replace(oldFuncRegex, newFunc);
// If it failed to replace because of previous mess up:
if (!content.includes('setTimeout(async () => {')) {
  // It means regex didn't match the whole thing due to my previous python script corrupting it!
  // I will just read the file, find "let syncTimeout" and manually fix it.
  const lines = content.split('\\n');
  // I'll use a safer approach in the next step.
}

fs.writeFileSync(file, content);
