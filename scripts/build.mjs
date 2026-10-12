import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),out=path.resolve(root,'dist');if(path.dirname(out)!==root)throw Error('Chemin de build invalide');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const dir of ['src','assets','curriculum','data','videos'])if(fs.existsSync(dir))fs.cpSync(dir,path.join(out,dir),{recursive:true});
const version=JSON.parse(fs.readFileSync('package.json','utf8').replace(/^\uFEFF/, '')).version;
for(const file of ['index.html','manifest.webmanifest','chess-LICENSE.txt'])fs.writeFileSync(path.join(out,file),fs.readFileSync(file,'utf8').replaceAll('__VERSION__',version));fs.writeFileSync(path.join(out,'.nojekyll'),'');
function list(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?list(path.join(dir,x.name)):[path.join(dir,x.name)]);}
const core=list(out).map(p=>'./'+path.relative(out,p).replaceAll('\\','/')).filter(p=>!p.includes('/vendor/')&&!p.startsWith('./data/')&&!p.startsWith('./videos/'));
fs.writeFileSync(path.join(out,'sw.js'),`const CACHE=${JSON.stringify('premier-coup-'+version)},FILES=${JSON.stringify(core)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('premier-coup-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||e.request.headers.has('range'))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok&&!/\\.(mp4|mp3)$/.test(u.pathname)){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));});`);
console.log('Build '+version+' : '+core.length+' fichiers légers, aucun média précaché.');
