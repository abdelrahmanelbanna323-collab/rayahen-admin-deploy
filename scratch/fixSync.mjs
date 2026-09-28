const fs = require('fs');
let code = fs.readFileSync('src/store/useMenuStore.ts', 'utf8');

// Remove monkey-patch
code = code.replace(/\(setOriginal: any, get: any\) => \{\r?\n\s*const set = \(\.\.\.args: any\[\]\) => \{\r?\n\s*setOriginal\(\.\.\.args\);\r?\n\s*if \(typeof window !== 'undefined'\) \{\r?\n\s*clearTimeout\(window\.syncTimeout\);\r?\n\s*window\.syncTimeout = setTimeout\(\(\) => \{\r?\n\s*syncStateToSupabase\(get\(\)\)\.catch\(\(e: any\) => console\.error\('auto-sync error:', e\)\);\r?\n\s*\}, 2000\);\r?\n\s*\}\r?\n\s*\};\r?\n\s*return \{/g, '(set, get) => ({');

code = code.replace(/\/\/ @ts-ignore\r?\n\s*persist\(/g, 'persist(');

// Add subscribe at the end
if (!code.includes('useMenuStore.subscribe')) {
  code += `

if (typeof window !== 'undefined') {
  let syncTimeout: any;
  useMenuStore.subscribe((state) => {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      syncStateToSupabase(state).catch((e: any) => console.error('auto-sync error:', e));
    }, 2000);
  });
}
`;
}

fs.writeFileSync('src/store/useMenuStore.ts', code);
console.log('Fixed useMenuStore.ts');
