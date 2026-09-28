import fs from 'fs';

const filePath = 'src/store/useMenuStore.ts';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Patch sanitize to block all base64/blob
const sanitizeRegex = /if \(typeof obj === 'string'\) \{[\s\S]*?return '' as unknown as T;\s*\}\s*\}/;
const sanitizeReplacement = `if (typeof obj === 'string') {
    // Prevent any base64/blob strings from ever entering Firestore
    if (obj.startsWith('data:') || obj.startsWith('blob:')) {
      console.warn('⚠️ Prevented base64/blob string from being sent to Firestore:', obj.substring(0, 30));
      return '' as unknown as T;
    }
  }`;

if (sanitizeRegex.test(code)) {
  code = code.replace(sanitizeRegex, sanitizeReplacement);
  console.log("Patched sanitize!");
} else {
  console.warn("sanitizeRegex did not match");
}

// 2. Make announcement and vat actions immediate and clean up duplicates
code = code.replace(
  /addAnnouncement: \(post\) => \{[\s\S]*?syncStateToFirestore\(get\(\)\);\s*syncStateToFirestore\(get\(\)\);\s*\}/,
  `addAnnouncement: (post) => {
        set((state) => ({ announcements: [post, ...state.announcements] }));
        syncStateToFirestore(get(), undefined, true);
      }`
);

code = code.replace(
  /updateAnnouncement: \(id, updated\) => \{[\s\S]*?syncStateToFirestore\(get\(\)\);\s*syncStateToFirestore\(get\(\)\);\s*\}/,
  `updateAnnouncement: (id, updated) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, ...updated } : a
          ),
        }));
        syncStateToFirestore(get(), undefined, true);
      }`
);

code = code.replace(
  /toggleAnnouncement: \(id\) => \{[\s\S]*?syncStateToFirestore\(get\(\)\);\s*syncStateToFirestore\(get\(\)\);\s*\}/,
  `toggleAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
          ),
        }));
        syncStateToFirestore(get(), undefined, true);
      }`
);

code = code.replace(
  /deleteAnnouncement: \(id\) => \{[\s\S]*?syncStateToFirestore\(get\(\)\);\s*syncStateToFirestore\(get\(\)\);\s*\}/,
  `deleteAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        }));
        syncStateToFirestore(get(), undefined, true);
      }`
);

code = code.replace(
  /reorderAnnouncements: \(newOrder\) => \{[\s\S]*?syncStateToFirestore\(get\(\)\);\s*syncStateToFirestore\(get\(\)\);\s*\}/,
  `reorderAnnouncements: (newOrder) => {
        set({ announcements: newOrder });
        syncStateToFirestore(get(), undefined, true);
      }`
);

code = code.replace(
  /setVatSetting: \(branchId, enabled\) => \{[\s\S]*?syncStateToFirestore\(get\(\)\);\s*\}/,
  `setVatSetting: (branchId, enabled) => {
        set((state) => ({ vatSettings: { ...state.vatSettings, [branchId]: enabled } }));
        syncStateToFirestore(get(), undefined, true);
      }`
);

fs.writeFileSync(filePath, code, 'utf8');
console.log("Successfully updated useMenuStore.ts!");
