import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const dir=path.resolve(process.argv[2]||'data/puzzles');
const {Chess}=await import(pathToFileURL(path.resolve(process.argv[3]||'src/chess/chess.js')));
const manifest=JSON.parse(await fs.readFile(path.join(dir,'manifest.json'),'utf8'));
const seen=new Set();let count=0,bytes=0;
for(const [id,shard] of Object.entries(manifest.shards)){
 const text=await fs.readFile(path.join(dir,shard.file),'utf8');
 assert.equal(createHash('sha256').update(text).digest('hex'),shard.sha256,id+' checksum');
 assert.equal(Buffer.byteLength(text),shard.bytes,id+' bytes');
 assert(shard.bytes<400*1024,id+' shard budget');bytes+=shard.bytes;
 const data=JSON.parse(text);assert.equal(data.length,shard.count);assert.equal(new Set(data.map(p=>p[0])).size,data.length,id+' duplicate');
 const bands=Array(6).fill(0);
 for(const row of data){
  const [pid,fen,moves,rating,mask]=row;assert.equal(row.length,5);assert(rating>=400&&rating<=2200);assert(/^0x[0-9a-f]+$/.test(mask));
  const band=rating<700?0:rating<1000?1:rating<1200?2:rating<1400?3:rating<1700?4:5;bands[band]++;
  const themes=manifest.themes.filter((t,i)=>(BigInt(mask)&(1n<<BigInt(i)))!==0n);
  if(id==='mixed')assert(!themes.includes('equality'));
  if(!seen.has(pid)){const g=new Chess(fen);const uci=moves.split(' ');assert(uci.length>=2,pid+' solution length');for(const move of uci)assert(g.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]}),pid+' move');if(themes.includes('mate'))assert(g.isCheckmate(),pid+' mate');seen.add(pid);}
 }
 assert.deepEqual(bands,shard.bands,id+' band counts');count+=data.length;
}
assert(bytes<15*1024*1024,'total size budget');
assert.equal(manifest.shards.mixed.count,2000,'mixed coverage');
console.log(JSON.stringify({ok:true,shards:Object.keys(manifest.shards).length,rows:count,uniquePuzzles:seen.size,bytes}));
