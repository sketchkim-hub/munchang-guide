const C='munchang-v5',F=['./','index.html','style.css','app.js','data.json','manifest.json','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
// data.json: network first so edits show up; others cache first
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!=location.origin)return;
 if(u.pathname.endsWith('data.json'))e.respondWith(fetch(e.request).then(r=>{caches.open(C).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>caches.match(e.request)));
 else e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
