import https from 'https';
import http from 'http';

const FIREBASE_PROJECT = 'rayahen-menu';
const FIREBASE_API_KEY = 'AIzaSyBossqusBFLn4kc1Vu9XqYRmrQwsHV-MfI';
const TARGET_PATH = `/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/rayahen_menu/menuItems?key=${FIREBASE_API_KEY}`;

// Free proxies from public APIs
async function getProxies() {
  const res = await fetch('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt');
  const text = await res.text();
  return text.split('\n').filter(p => p.trim() && p.includes(':')).slice(0, 20); // try top 20
}

async function tryProxy(proxyStr) {
  return new Promise((resolve) => {
    const [host, port] = proxyStr.trim().split(':');
    console.log(`Trying proxy ${host}:${port}...`);
    
    const req = http.request({
      host: host,
      port: port,
      method: 'CONNECT',
      path: 'firestore.googleapis.com:443',
      timeout: 5000
    });

    req.on('connect', (res, socket, head) => {
      console.log(`Connected to proxy ${host}! Fetching Firebase...`);
      const tlsSocket = https.request({
        host: 'firestore.googleapis.com',
        path: TARGET_PATH,
        socket: socket,
        agent: false
      }, (fbRes) => {
        let data = '';
        fbRes.on('data', chunk => data += chunk);
        fbRes.on('end', () => {
          if (fbRes.statusCode === 200) {
            import('fs').then(fs => {
              fs.writeFileSync('d:/Projects/rayahen-admin-deploy/scratch/firebase_recovered.json', data);
              const doc = JSON.parse(data);
              const items = doc.fields?.data?.arrayValue?.values || [];
              console.log(`🎉 SUCCESS! Recovered ${items.length} items from Firebase via proxy ${host}!`);
              resolve(true);
            });
          } else {
            console.log('Firebase returned', fbRes.statusCode);
            resolve(false);
          }
        });
      });
      tlsSocket.on('error', () => resolve(false));
      tlsSocket.end();
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function main() {
  console.log('Fetching proxy list...');
  try {
    const proxies = await getProxies();
    console.log(`Got ${proxies.length} proxies.`);
    for (const proxy of proxies) {
      const success = await tryProxy(proxy);
      if (success) {
        process.exit(0);
      }
    }
    console.log('All proxies failed.');
  } catch (e) {
    console.error('Failed to run proxy script', e);
  }
}

main();
