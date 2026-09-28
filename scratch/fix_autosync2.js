const fs = require('fs');
let s = fs.readFileSync('src/store/useMenuStore.ts', 'utf8');

// Replace the entire bottom subscriber block with a proper data-fingerprint approach
const oldSubscriber = `if (typeof window !== 'undefined') {
  let autoSyncTimeout: any;
  useMenuStore.subscribe((state) => {
    // Don't block on isFirebaseSynced - sync whenever state changes, just not during active sync
    if (state.lastSyncStatus === 'syncing') return;
    clearTimeout(autoSyncTimeout);
    autoSyncTimeout = setTimeout(() => {
      syncStateToFirestore(state).catch((e: any) => console.error('auto-sync error:', e));
    }, 500);
  });
}`;

const newSubscriber = `if (typeof window !== 'undefined') {
  // Only re-sync when actual DATA changes, not status/flag fields.
  // This prevents the infinite loop: sync success -> state change -> sync again -> ...
  let autoSyncTimeout: any;
  let prevFingerprint = '';
  const getFingerprint = (state: any): string => {
    return JSON.stringify({
      mi: state.menuItems?.length,
      cat: state.categories?.length,
      pro: state.promotions?.length,
      ann: state.announcements?.length,
      au: state.adminUsers?.length,
      ru: state.ratingUrl,
      vat: state.vatSettings,
    });
  };
  useMenuStore.subscribe((state) => {
    const fp = getFingerprint(state);
    if (fp === prevFingerprint) return; // nothing meaningful changed
    prevFingerprint = fp;
    clearTimeout(autoSyncTimeout);
    autoSyncTimeout = setTimeout(() => {
      syncStateToFirestore(useMenuStore.getState()).catch((e: any) => console.error('auto-sync error:', e));
    }, 800);
  });
}`;

if (s.includes(oldSubscriber)) {
  s = s.replace(oldSubscriber, newSubscriber);
  fs.writeFileSync('src/store/useMenuStore.ts', s, 'utf8');
  console.log('SUCCESS: subscriber replaced with fingerprint approach');
} else {
  console.log('block not found as-is, trying regex...');
  // Try to replace the whole block at end of file with regex
  const idx = s.lastIndexOf('if (typeof window');
  if (idx !== -1) {
    s = s.slice(0, idx) + newSubscriber + '\n';
    fs.writeFileSync('src/store/useMenuStore.ts', s, 'utf8');
    console.log('SUCCESS via lastIndexOf cut');
  } else {
    console.log('FAIL: could not locate block');
  }
}
