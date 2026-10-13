import test from "node:test";
import assert from "node:assert/strict";
import { Chess } from "../src/chess/chess.js";
import { moveUci, uci } from "../src/chess/notation.js";
import { analyzeGame, hasCompleteAnalysis } from "../src/chess/analysis.js";
import { emptyState, validateState } from "../src/state/schema.js";
export function sevenGame() {
  const game = new Chess();
  for (const san of ["e4","e5","Nf3","Nc6","Bc4","Bc5","d3","Nf6","O-O","d6","Nc3","O-O","a3","a6"]) game.move(san);
  return {id:"seven", color:"w", initialFen:new Chess().fen(), moves:game.history({verbose:true}).map(uci), headers:{White:"Toi",Black:"Adversaire"}};
}
export function sevenEngine(record) {
  let ply = 0;
  return { search: async fen => {
    const g = new Chess(fen), before = g.turn() === record.color;
    const best = g.moves({verbose:true}).map(uci).find(m => !before || m !== record.moves[ply * 2]);
    if (!before) ply++;
    return {type:"cp", score:before ? 0 : 200 + ply, best, line:[best]};
  }};
}
test("seven mistakes stay chronological while the original worst-five result stays compatible",async()=>{
 const record=sevenGame(), state=emptyState();
 const result=await analyzeGame(record,sevenEngine(record),{state});
 assert.equal(result.allMoments.length,7); assert.equal(result.moments.length,5);
 assert.deepEqual(result.allMoments.map(m=>m.ply),[1,3,5,7,9,11,13]);
 assert.deepEqual(result.moments.map(m=>m.ply),[13,11,9,7,5]);
 for(const m of result.allMoments) { assert.ok(m.question && m.risk && m.better && m.afterFen); }
 record.alerts=[result.allMoments[0],{...result.allMoments[1],fen:new Chess().fen()},{...result.allMoments[2],retracted:true}];
 await analyzeGame(record,sevenEngine(record),{state});
 assert.equal(record.analysis.allMoments.length,7); assert.equal(Object.keys(state.cards).length,7);
});
test("old reports remain readable and identifiable for full analysis",()=>{
 const state=emptyState(),record=sevenGame(); record.analysis={moments:[],depth:12};state.games=[record];
 const restored=validateState(state).games[0]; assert.equal(hasCompleteAnalysis(restored),false);
 restored.analysis.allMoments=[];assert.equal(hasCompleteAnalysis(restored),true);
});
