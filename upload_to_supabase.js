const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_HOSTNAME = 'acmmilazknnircuquozr.supabase.co';
const SUPABASE_URL = 'https://' + SUPABASE_HOSTNAME;
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';
const BUCKET_NAME = 'menu-images';
const BACKUP_DIR = path.join(__dirname, 'cloudinary_backup');

function getContentType(ext) {
  const map = { '.webp':'image/webp', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.gif':'image/gif', '.avif':'image/avif', '.svg':'image/svg+xml' };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function uploadFile(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(fileName);
    const contentType = getContentType(ext);
    const fileBuffer = fs.readFileSync(filePath);
    const options = {
      hostname: SUPABASE_HOSTNAME,
      path: `/storage/v1/object/${BUCKET_NAME}/${fileName}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length,
        'x-upsert': 'true'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

async function createBucket() {
  console.log('انشاء bucket على Supabase...');
  const body = JSON.stringify({ id: BUCKET_NAME, name: BUCKET_NAME, public: true });
  const result = await makeRequest({
    hostname: SUPABASE_HOSTNAME,
    path: '/storage/v1/bucket',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);
  if (result.status === 200 || result.status === 201) console.log('تم انشاء الـ bucket!');
  else if (result.status === 409) console.log('الـ bucket موجود بالفعل OK');
  else console.log('bucket status:', result.status, JSON.stringify(result.body));
}

async function main() {
  console.log('بدء رفع الصور على Supabase Storage...\n');
  await createBucket();

  const files = fs.readdirSync(BACKUP_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.webp','.jpg','.jpeg','.png','.gif','.avif','.svg'].includes(ext);
  });

  console.log(`\nعدد الصور: ${files.length}\n`);
  const urlMapping = {};
  let success = 0, failed = 0;
  const failedList = [];

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const filePath = path.join(BACKUP_DIR, fileName);
    try {
      process.stdout.write(`[${i+1}/${files.length}] ${fileName}... `);
      const publicUrl = await uploadFile(filePath, fileName);
      urlMapping[fileName] = publicUrl;
      console.log('OK');
      success++;
    } catch(err) {
      console.log('FAILED: ' + err.message.substring(0, 80));
      failed++;
      failedList.push({ file: fileName, error: err.message });
    }
    if ((i+1) % 20 === 0) await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync(path.join(BACKUP_DIR, 'supabase_urls.json'), JSON.stringify(urlMapping, null, 2));
  if (failedList.length > 0) {
    fs.writeFileSync(path.join(BACKUP_DIR, 'upload_failed.json'), JSON.stringify(failedList, null, 2));
  }

  console.log('\n---');
  console.log(`نجح: ${success} | فشل: ${failed}`);
  console.log('تم حفظ الـ URLs في: cloudinary_backup/supabase_urls.json');
  console.log('انتهى الرفع!');
}

main().catch(err => { console.error('خطأ:', err); process.exit(1); });
