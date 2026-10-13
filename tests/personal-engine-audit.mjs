import fs from "node:fs";
import assert from "node:assert/strict";
import { nodeEngine } from "../scripts/engine-node.mjs";
import { parsePgn } from "../src/play/import.js";
import { analyzeGame } from "../src/chess/analysis.js";
import { gameProfile } from "../src/chess/game-profile.js";
import { buildReviewScript, reviewSceneGame } from "../src/play/review-script.js";
import { moveUci } from "../src/chess/notation.js";
const engine=await nodeEngine(),results=[];
for(const color of ['w','b']){
 const record=parsePgn('1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0',{color});
 await analyzeGame(record,engine,{depth:12});
 const p=gameProfile(record);
 for(const s of buildReviewScript(record)){const g=reviewSceneGame(record,s);for(const step of s.branch){assert.equal(g.fen(),step.fen);moveUci(g,step.move);assert.equal(g.fen(),step.afterFen);}}
 if(color==='b'){assert.ok(record.analysis.allMoments.some(m=>m.ply===6));assert.match(p.facts.find(f=>f.kind==='turning').text,/roi/);}else assert.ok(p.facts.some(f=>f.kind==='strength'));
 results.push({color,profile:p,record});
}
fs.writeFileSync('docs/personal-engine-audit.json',JSON.stringify(results,null,2)+'\n');
console.log('Stockfish depth 12: both colours, full-game profile and every displayed continuation validated.');
process.exit(0);
