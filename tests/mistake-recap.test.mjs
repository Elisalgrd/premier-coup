import test from "node:test";
import assert from "node:assert/strict";
import { Chess } from "../src/chess/chess.js";
import { mistakeList, nextGameRule, dominantMistake } from "../src/play/mistake-recap.js";
const m={fen:new Chess().fen(),played:'e2e4',best:'d2d4',severity:'gaffe',label:'Mat raté',ply:1,loss:200};
test('list is chronological, human-readable and links the right question',()=>{
 const list=mistakeList({analysis:{allMoments:[{...m,ply:3},m]}});
 assert.deepEqual(list.map(x=>x.ply),[1,3]);assert.match(list[0].playedText,/ton pion/);assert.match(list[0].bestText,/au centre/);assert.ok(list[0].question);
 assert.doesNotMatch(list[0].playedText + list[0].bestText,/\b[a-h][1-8]\b/);
});
test('next rule favours frequency, then the largest loss, with a quiet empty result',()=>{
 const other={...m,label:'Mat du couloir',loss:400};
 assert.equal(dominantMistake([m,other]).label,other.label);
 assert.equal(dominantMistake([m,other,m]).label,m.label);
 assert.match(nextGameRule({analysis:{allMoments:[other,m]}}),/case de fuite/);
 assert.equal(nextGameRule({analysis:{allMoments:[]}}),'');assert.deepEqual(mistakeList({}),[]);
});
