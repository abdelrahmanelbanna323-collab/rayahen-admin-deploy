const fs = require('fs');
let s = fs.readFileSync('src/store/useMenuStore.ts', 'utf8');

// Fix the auto-sync subscriber at the bottom of the file
// Replace the old guard (requires isFirebaseSynced) with one that doesn't
s = s.replace(
  /if \(!state\.isFirebaseSynced \|\| state\.lastSyncStatus === 'syncing'\) return;/,
  "// Don't block on isFirebaseSynced - sync whenever state changes, just not during active sync\n    if (state.lastSyncStatus === 'syncing') return;"
);

// Rename syncTimeout variable in the subscriber to avoid conflict with module-level syncTimeout
s = s.replace(
  /if \(typeof window !== 'undefined'\) \{\r?\n  let syncTimeout: any;\r?\n  useMenuStore\.subscribe/,
  "if (typeof window !== 'undefined') {\n  let autoSyncTimeout: any;\n  useMenuStore.subscribe"
);

// Update clearTimeout and the variable name in that block
// Find the last occurrence pattern
const idx = s.lastIndexOf('clearTimeout(syncTimeout);\n    syncTimeout = setTimeout');
if (idx !== -1) {
  s = s.slice(0, idx) +
    'clearTimeout(autoSyncTimeout);\n    autoSyncTimeout = setTimeout' +
    s.slice(idx + 'clearTimeout(syncTimeout);\n    syncTimeout = setTimeout'.length);
}

// Change the 2000ms to 500ms in the auto-sync subscriber
const subIdx = s.lastIndexOf('}, 2000);');
if (subIdx !== -1) {
  s = s.slice(0, subIdx) + '}, 500);' + s.slice(subIdx + '}, 2000);'.length);
}

fs.writeFileSync('src/store/useMenuStore.ts', s, 'utf8');
console.log('Done!');

// Verify
const hasOldGuard = s.includes('!state.isFirebaseSynced');
const has500 = s.includes('}, 500);');
const hasAutoTimeout = s.includes('autoSyncTimeout');
console.log('Old guard removed:', !hasOldGuard);
console.log('500ms debounce:', has500);
console.log('autoSyncTimeout variable:', hasAutoTimeout);
