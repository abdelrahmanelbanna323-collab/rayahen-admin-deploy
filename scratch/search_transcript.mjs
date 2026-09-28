import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/DELL/.gemini/antigravity-ide/brain/4cbcdc3f-62ab-4565-b948-672a27691c08/.system_generated/logs/transcript_full.jsonl'),
  crlfDelay: Infinity
});

let found = false;

rl.on('line', (line) => {
  if (line.includes('initialMenuItems') && line.includes('Waffle')) {
    console.log('Found it!');
    fs.writeFileSync('d:/Projects/rayahen-admin-deploy/scratch/old_state.txt', line);
    found = true;
    process.exit(0);
  }
});

rl.on('close', () => {
  if (!found) {
    console.log('Did not find the items inside transcript_full.jsonl');
  }
});
