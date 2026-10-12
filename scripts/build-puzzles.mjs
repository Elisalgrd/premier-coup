/** Lichess CC0 extraction; Node >=24. Run with --help for options. */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { Decompress } from './vendor/fzstd.mjs';
import { createHash } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here=path.dirname(fileURLToPath(import.meta.url));
const flags=Object.fromEntries(process.argv.slice(2).map((s,i,a)=>s.startsWith('--')?[s.slice(2),a[i+1]?.startsWith('--')?true:a[i+1]??true]:null).filter(Boolean));
if(flags.help){console.log('node build-puzzles.mjs --curriculum CURRICULUM.md --out data/puzzles --chess path/to/chess.js [--source local.csv.zst] [--max-mb 320] [--timeout-sec 1200]\nDefault network source is the Lichess puzzle database. No archive is saved; stream has a byte limit and timeout.');process.exit(0);}
const sourceUrl='https://database.lichess.org/lichess_db_puzzle.csv.zst';
const outDir=path.resolve(flags.out||path.join(here,'../data/puzzles'));
const curriculumPath=path.resolve(flags.curriculum||'CURRICULUM.md');
const chessPath=path.resolve(flags.chess||path.join(here,'../src/chess/chess.js'));
const { Chess }=await import(pathToFileURL(chessPath));
const maxBytes=Number(flags['max-mb']||320)*1024*1024;
const timeout=Number(flags['timeout-sec']||1200)*1000;
const curriculum=await fsp.readFile(curriculumPath,'utf8');
const sections=[...curriculum.matchAll(/^### `([^`]+)`[^\n]*\n([\s\S]*?)(?=^### |^## |$(?![\s\S]))/gm)];
const entries=sections.map(([,id,body])=>{
  const meta=body.match(/^\*\*Méta\*\*[^\n]*/m)?.[0]||'';
  const tagText=meta.slice(Math.max(0,meta.search(/\btags?\b/i)));
  const tags=/\btags?\b/i.test(meta)?[...tagText.matchAll(/`([^`]+)`/g)].map(m=>m[1]).filter(t=>!t.includes('-')&&t!=='OpeningTags'&&t!=='Italian_Game'):[];
  return {id,priority:meta.match(/· ([SABC]) ·/)?.[1]||null,palier:Number(meta.match(/palier (\d)/)?.[1]||0),tags:[...new Set(tags)]};
});
const annex=curriculum.split('## ANNEXE A')[1]?.split('## ANNEXE B')[0]||'';
for(const line of annex.split('\n')){
  if(!line.startsWith('| `'))continue;
  const cells=line.split('|');
  const tags=[...cells[1].matchAll(/`([^`]+)`/g)].map(m=>m[1]);
  const ids=[...cells[2].matchAll(/`([^`]+)`/g)].map(m=>m[1]);
  for(const id of ids){const entry=entries.find(e=>e.id===id);if(entry)entry.tags=[...new Set([...entry.tags,...tags])];}
}
const bands=[[400,700],[700,1000],[1000,1200],[1200,1400],[1400,1700],[1700,2201]];
const counts={rows:0,qualified:0,rejectedQuality:0,invalidCsv:0,bytes:0};
const buckets=new Map(entries.filter(e=>e.tags.length).map(e=>[e.id,{entry:e,bands:bands.map(()=>({count:0,rows:[]}))}]));
buckets.set('mixed',{entry:{id:'mixed',tags:['mix']},bands:bands.map(()=>({count:0,rows:[]}))});
const tagToIds=new Map();
for(const [id,b] of buckets)for(const tag of b.entry.tags){if(!tagToIds.has(tag))tagToIds.set(tag,[]);tagToIds.get(tag).push(id);}
const allThemes=new Set();
const tagCounts={};
let seed=0x20_80_2026;
function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;}
function reservoir(bucket,row,capacity){bucket.count++;if(bucket.rows.length<capacity)bucket.rows.push(row);else{const i=Math.floor(random()*bucket.count);if(i<capacity)bucket.rows[i]=row;}}
function csvLine(line){const cells=[];let s='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){s+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){cells.push(s);s='';}else s+=c;}cells.push(s);return cells;}
function eligibleOpening(id,row){if(id==='ouv-white-italian')return row.openings.some(t=>t==='Italian_Game'||t.startsWith('Italian_Game_'));if(id==='ouv-black-e5')return row.openings.some(t=>/^(Italian_Game|Ruy_Lopez|Scotch_Game|Four_Knights_Game|Three_Knights_Opening|Petrov|Kings_Gambit|Vienna_Game|Bishops_Opening|Philidor_Defense)/.test(t));if(id==='ouv-black-d5')return row.openings.some(t=>/^(Queens_Gambit_Declined|Queens_Pawn_Game|London_System|Semi-Slav_Defense|Slav_Defense|Tarrasch_Defense|Colle_System)/.test(t));return true;}
let header;
let lastLog=Date.now();
function consume(line){
 if(!header){header=csvLine(line.replace(/^\uFEFF/,''));const required=['PuzzleId','FEN','Moves','Rating','RatingDeviation','Popularity','NbPlays','Themes','GameUrl','OpeningTags'];if(!required.every(c=>header.includes(c)))throw new Error('Unknown Lichess CSV schema');return;}
 counts.rows++;const f=csvLine(line);if(f.length!==header.length){counts.invalidCsv++;return;}
 const raw=Object.fromEntries(header.map((h,i)=>[h,f[i]]));
 const rating=Number(raw.Rating),deviation=Number(raw.RatingDeviation),popularity=Number(raw.Popularity),plays=Number(raw.NbPlays);
 if(!(rating>=400&&rating<=2200&&deviation<=90&&popularity>=85&&plays>=500)){counts.rejectedQuality++;return;}
 const row={id:raw.PuzzleId,fen:raw.FEN,moves:raw.Moves,rating,deviation,popularity,plays,themes:raw.Themes.split(' ').filter(Boolean),gameUrl:raw.GameUrl,openings:raw.OpeningTags.split(' ').filter(Boolean)};
 if(!/^[A-Za-z0-9]+$/.test(row.id)||row.moves.split(' ').some(m=>!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(m))){counts.invalidCsv++;return;}
 counts.qualified++;for(const t of row.themes){allThemes.add(t);tagCounts[t]=(tagCounts[t]||0)+1;}
 const band=bands.findIndex(([a,b])=>rating>=a&&rating<b);const ids=new Set(row.themes.flatMap(t=>tagToIds.get(t)||[]));
 if(!row.themes.includes('equality'))for(const id of tagToIds.get('mix')||[])ids.add(id);
 for(const id of ids){const bucket=buckets.get(id);if(eligibleOpening(id,row))reservoir(bucket.bands[band],row,id==='mixed'?2000:300);}
 if(Date.now()-lastLog>15000){console.log(JSON.stringify({rows:counts.rows,qualified:counts.qualified,receivedMB:Math.round(counts.bytes/1048576)}));lastLog=Date.now();}
}
const abort=new AbortController();const timer=setTimeout(()=>abort.abort(new Error('Extraction timeout')),timeout);
const archiveHash=createHash('sha256');let input,sourceMeta,download;
try{
 if(flags.source){input=fs.createReadStream(path.resolve(flags.source));sourceMeta={file:path.basename(flags.source),contentLength:(await fsp.stat(path.resolve(flags.source))).size};}
 else if(flags.curl||process.platform==='win32'){download=spawn(process.platform==='win32'?'curl.exe':'curl',['--fail','--location','--silent','--show-error','--max-time',String(timeout/1000),'--max-filesize',String(maxBytes),sourceUrl],{windowsHide:true,stdio:['ignore','pipe','inherit']});input=download.stdout;sourceMeta={url:sourceUrl,transport:'curl'};download.on('error',e=>input.destroy(e));}
 else {const response=await fetch(sourceUrl,{signal:abort.signal,headers:{'Accept-Encoding':'identity'}});if(!response.ok)throw new Error(`HTTP ${response.status}`);const length=Number(response.headers.get('content-length')||0);if(length>maxBytes){await response.body.cancel();throw new Error(`Source ${length} bytes exceeds cap ${maxBytes}`);}sourceMeta={url:sourceUrl,contentLength:length,etag:response.headers.get('etag'),lastModified:response.headers.get('last-modified')};input=Readable.fromWeb(response.body);}
 const downloadExit=download?new Promise((resolve,reject)=>download.once('exit',code=>code===0?resolve():reject(new Error(`curl exited ${code}`)))):Promise.resolve();
 let pending='';const textDecoder=new TextDecoder();const decompressor=new Decompress((chunk,final)=>{pending+=textDecoder.decode(chunk,{stream:!final});const lines=pending.split('\n');pending=lines.pop();for(const line of lines)consume(line.replace(/\r$/,''));if(final&&pending){consume(pending);pending='';}});
 for await(const chunk of input){counts.bytes+=chunk.length;if(counts.bytes>maxBytes)throw new Error('Byte limit exceeded');archiveHash.update(chunk);decompressor.push(chunk);}
 decompressor.push(new Uint8Array(0),true);await downloadExit;
 if(!header||counts.rows<1000)throw new Error('Source ended before any meaningful puzzle dataset was decoded');
 sourceMeta.sha256=archiveHash.digest('hex');
}finally{clearTimeout(timer);input?.destroy();download?.kill();}

const themes=[...allThemes].sort();const themeBits=new Map(themes.map((t,i)=>[t,1n<<BigInt(i)]));
function compact(row){return[row.id,row.fen,row.moves,row.rating,'0x'+row.themes.reduce((mask,t)=>mask|(themeBits.get(t)||0n),0n).toString(16)];}
function select(bucket,total){const arrays=bucket.bands.map(b=>[...b.rows]);const result=[];let any=true;while(result.length<total&&any){any=false;for(const arr of arrays){if(arr.length&&result.length<total){result.push(arr.pop());any=true;}}}return result.sort((a,b)=>a.rating-b.rating||a.id.localeCompare(b.id));}
const validated=new Map();
function validate(row){if(validated.has(row.id))return validated.get(row.id);try{const g=new Chess(row.fen);const moves=row.moves.split(' ');let startFen;for(const [i,uci] of moves.entries()){if(!g.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]}))throw new Error('illegal move');if(i===0)startFen=g.fen();}if(row.themes.includes('mate')&&!g.isCheckmate())throw new Error('Mate tag without terminal checkmate');const data={valid:true,startFen,checkmate:g.isCheckmate()};validated.set(row.id,data);return data;}catch(e){const data={valid:false,error:e.message};validated.set(row.id,data);return data;}}
await fsp.mkdir(outDir,{recursive:true});
const shardManifest={};const examples={};const rejected=[];let bytesWritten=0;
for(const [id,bucket] of buckets){
 const selected=select(bucket,id==='mixed'?2000:300).filter(row=>{const result=validate(row);if(!result.valid)rejected.push({id:row.id,entry:id,error:result.error});return result.valid;});
 const data=JSON.stringify(selected.map(compact));const file=id+'.json';await fsp.writeFile(path.join(outDir,file),data);const bytes=Buffer.byteLength(data);bytesWritten+=bytes;
 const availableByBand=bucket.bands.map(b=>b.count);const selectedByBand=bands.map(([a,b])=>selected.filter(r=>r.rating>=a&&r.rating<b).length);
 shardManifest[id]={file,count:selected.length,bytes,sha256:createHash('sha256').update(data).digest('hex'),bands:selectedByBand,availableByBand,tags:bucket.entry.tags,priority:bucket.entry.priority||null,palier:bucket.entry.palier??null};
 examples[id]=[...selected].sort((a,b)=>(Math.abs(a.rating-850)+a.moves.split(' ').length*70)-(Math.abs(b.rating-850)+b.moves.split(' ').length*70)||a.id.localeCompare(b.id)).slice(0,5).map(row=>({...row,source:'https://lichess.org/training/'+row.id,solverFen:validate(row).startFen,initialMove:row.moves.split(' ')[0],solution:row.moves.split(' ').slice(1)}));
}
const manifest={schema:1,generatedAt:new Date().toISOString(),source:{...sourceMeta,license:'CC0-1.0',documentation:'https://database.lichess.org/#puzzles',themesDocumentation:'https://github.com/lichess-org/lila/blob/master/translation/source/puzzleTheme.xml'},quality:{minPopularity:85,minPlays:500,maxRatingDeviation:90,rating:[400,2200]},format:['id','fenBeforeOpponentMove','uciMovesSpaceSeparated','rating','themesHexBitmask'],themeEncoding:'BigInt hex string; bit index follows themes[]; avoids loss above 53 bits',themes,bands:bands.map(([a,b])=>[a,b===2201?2200:b]),sampling:{method:'seeded reservoir per rating band, balanced round robin filling sparse bands',seed:'0x20802026',mixedExcludes:['equality']},counts,bytes:bytesWritten,shards:shardManifest,withoutPuzzleTags:entries.filter(e=>!e.tags.length).map(e=>({id:e.id,priority:e.priority,palier:e.palier})),below150:entries.filter(e=>['S','A'].includes(e.priority)&&(shardManifest[e.id]?.count||0)<150).map(e=>({id:e.id,count:shardManifest[e.id]?.count||0,reason:e.tags.length?'Insufficient quality-filtered source coverage':'Requires a dedicated drill, plan-choice, game or analysis; no mapped tactical tag'})),tagCounts,validation:{uniquePuzzles:validated.size,legalLines:[...validated.values()].filter(v=>v.valid).length,rejected}};
await fsp.writeFile(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2));
await fsp.writeFile(path.join(here,'../curriculum/lichess-examples.json'),JSON.stringify(examples,null,2));
console.log(JSON.stringify({rows:counts.rows,qualified:counts.qualified,shards:Object.keys(shardManifest).length,bytes:bytesWritten,uniqueValidated:validated.size,rejected:rejected.length,below150:manifest.below150},null,2));
if(bytesWritten>15*1024*1024||Object.values(shardManifest).some(s=>s.bytes>400*1024))throw new Error('Shard size budget exceeded');
