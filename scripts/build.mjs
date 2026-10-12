import fs from "node:fs";
import path from "node:path";
const root = process.cwd(),
  out = path.resolve(root, "dist");
if (path.dirname(out) !== root) throw Error("Chemin de build invalide");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const dir of ["src", "assets", "curriculum", "data", "videos"])
  if (fs.existsSync(dir))
    fs.cpSync(dir, path.join(out, dir), {
      recursive: true,
      filter: (source) => !source.endsWith("lichess-examples.json"),
    });
const version = JSON.parse(
  fs.readFileSync("package.json", "utf8").replace(/^\uFEFF/, ""),
).version;
for (const file of [
  "index.html",
  "manifest.webmanifest",
  "chess-LICENSE.txt",
  "THIRD_PARTY_LICENSES.md",
  "LICENSE",
])
  fs.writeFileSync(
    path.join(out, file),
    fs.readFileSync(file, "utf8").replaceAll("__VERSION__", version),
  );
fs.writeFileSync(path.join(out, ".nojekyll"), "");
function list(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((x) =>
      x.isDirectory() ? list(path.join(dir, x.name)) : [path.join(dir, x.name)],
    );
}
const core = list(out)
  .map((p) => "./" + path.relative(out, p).replaceAll("\\", "/"))
  .filter(
    (p) =>
      !p.includes("/vendor/") &&
      !p.startsWith("./data/") &&
      !p.startsWith("./videos/"),
  );
fs.writeFileSync(
  path.join(out, "sw.js"),
  `const CACHE=${JSON.stringify("premier-coup-" + version)},CONTENT='premier-coup-content-v2',FILES=${JSON.stringify(core)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(url=>new Request(url,{cache:"reload"})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('premier-coup-')&&k!==CACHE&&k!==CONTENT).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
async function media(request){const cache=await caches.open(CONTENT),key=new Request(request.url),cached=await cache.match(key);if(cached){const range=request.headers.get('range');if(!range)return cached;const bytes=await cached.arrayBuffer(),m=/bytes=(\\d*)-(\\d*)/.exec(range);if(!m)return cached;const start=m[1]?Number(m[1]):Math.max(0,bytes.byteLength-Number(m[2])),end=m[1]&&m[2]?Math.min(Number(m[2]),bytes.byteLength-1):bytes.byteLength-1;if(start>end||start>=bytes.byteLength)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.byteLength}});return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':cached.headers.get('Content-Type')||'video/mp4','Content-Range':'bytes '+start+'-'+end+'/'+bytes.byteLength,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});}return fetch(request);}
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;const isMedia=/\\.(mp4|mp3)$/.test(u.pathname),isContent=u.pathname.includes('/data/')||u.pathname.includes('/vendor/')||u.pathname.includes('/videos/');if(isMedia){e.respondWith(media(e.request));e.waitUntil(caches.open(CONTENT).then(async c=>{const key=new Request(e.request.url);if(!await c.match(key)){const r=await fetch(key);if(r.ok&&r.status===200)await c.put(key,r);}}).catch(()=>{}));return;}e.respondWith((async()=>{const cache=await caches.open(isContent?CONTENT:CACHE),cached=await cache.match(e.request,{ignoreSearch:true});if(isContent&&cached)return cached;try{const r=await fetch(e.request,isContent?undefined:{cache:"no-cache"});if(r.ok)await cache.put(e.request,r.clone());return r;}catch{return cached||(e.request.mode==='navigate'?await caches.match('./index.html'):Response.error());}})());});`,
);
console.log(
  "Build " +
    version +
    " : " +
    core.length +
    " fichiers légers, aucun média ni moteur précaché.",
);
