const fs = require('fs');

const menuCode = fs.readFileSync('D:/Projects/rayahen-menu-deploy/src/store/useMenuStore.ts', 'utf8');
let adminCode = fs.readFileSync('scratch/syncFix2.js', 'utf8');

// 1. Fix imports
adminCode = adminCode.replace(/import \{ supabase \} from '@\/lib\/supabaseClient';/, "import { db } from '@/lib/firebase';\nimport { doc, setDoc, onSnapshot } from 'firebase/firestore';");

// 2. Add setVatSetting to interface
adminCode = adminCode.replace(
  'setRatingUrl: (url: string) => void;',
  'setRatingUrl: (url: string) => void;\n  setVatSetting: (branchId: string, enabled: boolean) => void;'
);

// 3. Extract syncStateToFirestore from menu app
const syncStartMenu = menuCode.indexOf('// ✅ Deep sanitizer:');
const syncEndMenu = menuCode.indexOf('export const useMenuStore = create');
const syncFunction = menuCode.substring(syncStartMenu, syncEndMenu);

// 4. Replace syncStateToSupabase in admin app
const syncStartAdmin = adminCode.indexOf('// ✅ Deep sanitizer:');
const syncEndAdmin = adminCode.indexOf('export const useMenuStore = create');
adminCode = adminCode.substring(0, syncStartAdmin) + syncFunction + adminCode.substring(syncEndAdmin);

// 5. Extract initSupabaseListener & syncToSupabase from menu app
const listenerStartMenu = menuCode.indexOf('// Sync Trigger');
const listenerEndMenu = menuCode.indexOf('// System Settings Actions', listenerStartMenu);
let listenerFunction = menuCode.substring(listenerStartMenu, listenerEndMenu);

if (adminCode.includes('initFirebaseListener: () => (() => void) | void;')) {
  listenerFunction = listenerFunction.replace(/initSupabaseListener/g, 'initFirebaseListener');
  listenerFunction = listenerFunction.replace(/syncToSupabase/g, 'syncToFirebase');
  listenerFunction = listenerFunction.replace(/isSupabaseSynced/g, 'isFirebaseSynced');
}

// 6. Replace listener in admin app
const listenerStartAdmin = adminCode.indexOf('// Sync Trigger');
const listenerEndAdmin = adminCode.indexOf('// System Settings Actions', listenerStartAdmin);

if (listenerStartAdmin !== -1 && listenerEndAdmin !== -1) {
  adminCode = adminCode.substring(0, listenerStartAdmin) + listenerFunction + adminCode.substring(listenerEndAdmin);
} else {
  console.log('Listener boundaries not found in admin app!');
}

// 7. Fix any lingering syncStateToSupabase calls in admin actions
adminCode = adminCode.replace(/syncStateToSupabase/g, 'syncStateToFirestore');

// 8. Fix the subscribe block at the bottom
const subscribeStart = adminCode.indexOf('if (typeof window !== \'undefined\') {');
if (subscribeStart !== -1) {
  adminCode = adminCode.substring(0, subscribeStart);
}

adminCode += `if (typeof window !== 'undefined') {
  let syncTimeout: any;
  useMenuStore.subscribe((state) => {
    if (!state.isFirebaseSynced || state.lastSyncStatus === 'syncing') return;
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      syncStateToFirestore(state).catch((e: any) => console.error('auto-sync error:', e));
    }, 2000);
  });
}
`;

fs.writeFileSync('src/store/useMenuStore.ts', adminCode);
console.log('Fixed successfully with bounds check.');
