const CACHE='premier-coup-v5';
const FILES=['./?v=4','./index.html?v=4','./style.css','./app.js?v=4','./content.js?v=4','./coaching.js?v=4','./advanced.js','./training.js?v=4','./engine.js','./chess.js','./manifest.webmanifest?v=4','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('premier-coup-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return r;}).catch(()=>caches.match(e.request).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html?v=4'):Response.error()))));});
