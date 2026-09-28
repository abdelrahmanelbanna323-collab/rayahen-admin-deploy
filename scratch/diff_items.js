const fs = require('fs');

const restored = require('../restored_state.json');
const restoredItems = restored.state.menuItems;

console.log('Restored items:', restoredItems.length);

let defaultCount = 0;
let userCount = 0;

restoredItems.forEach(item => {
  if (item.id && item.id.match(/^[a-z]+[0-9]+$/)) {
    defaultCount++;
  } else {
    userCount++;
    console.log('User added item:', item.id, item.name);
  }
});

console.log('Default style IDs:', defaultCount);
console.log('Other IDs:', userCount);
