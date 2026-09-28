const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ===== إعدادات Cloudinary =====
const CLOUD_NAME = 'lkebxdhu';
const API_KEY = '469783413467411';
const API_SECRET = '5le1D1ipVuMIZtLT7_QvdlI0Ve4';

// فولدر الباك اب
const BACKUP_DIR = path.join(__dirname, 'cloudinary_backup');
const INFO_FILE = path.join(BACKUP_DIR, 'images_info.json');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`تم انشاء فولدر الباك اب: ${BACKUP_DIR}`);
}

function getAuthHeader() {
  const credentials = `${API_KEY}:${API_SECRET}`;
  return 'Basic ' + Buffer.from(credentials).toString('base64');
}

async function fetchAllResources(resourceType = 'image', nextCursor = null) {
  return new Promise((resolve, reject) => {
    let url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/${resourceType}?max_results=500`;
    if (nextCursor) url += `&next_cursor=${nextCursor}`;
    const options = { headers: { 'Authorization': getAuthHeader() } };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(BACKUP_DIR, filename);
    if (fs.existsSync(filePath)) { console.log(`موجود بالفعل: ${filename}`); resolve(filePath); return; }
    const file = fs.createWriteStream(filePath);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); fs.unlinkSync(filePath);
        downloadImage(res.headers.location, filename).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(filePath); });
    }).on('error', (err) => { fs.unlink(filePath, () => {}); reject(err); });
  });
}

async function backupAll() {
  console.log('بدء باك اب الصور من Cloudinary...');
  let allResources = [];
  let nextCursor = null;
  let page = 1;
  console.log('جاري جلب قايمة الصور...');
  do {
    const result = await fetchAllResources('image', nextCursor);
    if (result.error) { console.error('خطأ:', result.error.message); process.exit(1); }
    allResources = allResources.concat(result.resources || []);
    nextCursor = result.next_cursor || null;
    console.log(`صفحة ${page}: ${result.resources?.length || 0} صورة`);
    page++;
  } while (nextCursor);

  console.log(`اجمالي الصور: ${allResources.length}`);
  if (allResources.length === 0) { console.log('مفيش صور!'); return; }

  const imagesInfo = allResources.map(r => ({
    public_id: r.public_id, url: r.secure_url, format: r.format,
    width: r.width, height: r.height, bytes: r.bytes, created_at: r.created_at,
  }));
  fs.writeFileSync(INFO_FILE, JSON.stringify(imagesInfo, null, 2), 'utf8');
  console.log('تم حفظ معلومات الصور في images_info.json');

  let success = 0, failed = 0;
  const failedList = [];
  for (let i = 0; i < allResources.length; i++) {
    const resource = allResources[i];
    const ext = resource.format || 'jpg';
    const safeName = resource.public_id.replace(/\//g, '_') + '.' + ext;
    try {
      process.stdout.write(`[${i+1}/${allResources.length}] ${safeName}... `);
      await downloadImage(resource.secure_url, safeName);
      console.log('OK');
      success++;
    } catch(err) {
      console.log('FAILED');
      failed++;
      failedList.push({ public_id: resource.public_id, url: resource.secure_url, error: err.message });
    }
    if ((i+1) % 10 === 0) await new Promise(r => setTimeout(r, 300));
  }

  console.log('---');
  console.log(`نجح: ${success} | فشل: ${failed}`);
  console.log(`محفوظ في: ${BACKUP_DIR}`);
  if (failedList.length > 0) {
    fs.writeFileSync(path.join(BACKUP_DIR, 'failed_downloads.json'), JSON.stringify(failedList, null, 2));
    console.log('الصور اللي فشلت: failed_downloads.json');
  }
  console.log('انتهى الباك اب!');
}

backupAll().catch(err => { console.error('خطأ:', err); process.exit(1); });
