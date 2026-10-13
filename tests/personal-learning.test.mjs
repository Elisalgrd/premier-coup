import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Chess } from "../src/chess/chess.js";
import { moveUci, uci } from "../src/chess/notation.js";
import { emptyState, validateState } from "../src/state/schema.js";
import { lessonStages } from "../src/learn/lesson-state.js";
import { LessonPlayer } from "../src/learn/lesson-player.js";
import { dailyCourses, nextDailyEntry } from "../src/learn/daily-courses.js";
import { sessionPlan } from "../src/learn/session.js";
import { startSession } from "../src/learn/session-player.js";
import { dateKey } from "../src/ui/helpers.js";
import { branchEvidence, personalExplanation, locationWords } from "../src/chess/review-evidence.js";
import { gameProfile, hasPersonalAnalysis } from "../src/chess/game-profile.js";
import { analyzePendingGame } from "../src/play/analysis-task.js";
import { buildReviewScript, reviewSceneGame } from "../src/play/review-script.js";
const entries=JSON.parse(fs.readFileSync('curriculum/index.json'));
const entry=id=>JSON.parse(fs.readFileSync(`curriculum/entries/${id}.json`));
const fen='r6k/8/8/8/8/1B6/P7/6K1 w - - 0 1';
const mistake=(f=fen,ply=1)=>({fen:f,ply,played:'b3a4',best:'a2a3',reply:'a8a4',replyLine:['a8a4','g1f2','a4a2'],line:['a2a3','a8a3','b3g8'],loss:300,severity:'gaffe',entryId:'proc-blunder-check'});
const game=()=>({id:'test',initialFen:fen,color:'w',moves:['b3a4','a8e8'],analysis:{version:3,depth:12,decisions:[],allMoments:[mistake()]}});

test('every priority course teaches before the quiz and before any board answer',()=>{
 assert.equal(new Set(dailyCourses.map(c=>c.id)).size,13);
 for(const c of dailyCourses){assert.ok(entries.some(e=>e.id===c.id));assert.ok(c.goal&&c.why&&c.feedback&&c.transfer);assert.ok(c.answers[c.correct]);const stages=lessonStages(entry(c.id)),quiz=stages.findIndex(s=>s.kind==='quiz'),firstAnswer=stages.findIndex(s=>['challenge','exercise','practice'].includes(s.kind));assert.ok(quiz>1&&quiz<firstAnswer);assert.equal(stages[0].key,'objective');assert.ok(stages.slice(0,quiz).every(s=>s.kind==='screen'));}
});
test('learning moves on while spaced mastery and existing quiz results remain intact',()=>{
 const s=emptyState();s.entries['ouv-principles']={viewedAt:'2026-10-12'};s.entries['tac-fork']={viewedAt:'2026-10-12'};
 const snapshot=structuredClone(s);assert.equal(nextDailyEntry(s,entries).id,'proc-opponent-threat');assert.deepEqual(s,snapshot);
 const p=sessionPlan(s,entries);assert.equal(p.tasks[0].kind,'lesson');assert.ok(!p.tasks.some(t=>t.kind==='mixed'));s.session=p;assert.deepEqual(validateState(s).session,p);
});
test('a new daily lesson never jumps to practice; unfinished same-day lessons resume by key',()=>{
 const e=entry('tac-fork'),s=emptyState();s.entries[e.id]={lesson:{version:2,finished:true,key:'retain',sessionKey:'yesterday'}};
 assert.equal(new LessonPlayer(e,{state:s},{onDone(){},sessionKey:'today'}).step,0);
 s.entries[e.id].lesson={version:2,finished:false,key:'screen:2',sessionKey:'today'};
 const p=new LessonPlayer(e,{state:s},{sessionKey:'today'});assert.equal(p.stages[p.step].key,'screen:2');
 s.entries[e.id].lesson.sessionKey='yesterday';const resumed=new LessonPlayer(e,{state:s},{sessionKey:'today'});assert.equal(resumed.stages[resumed.step].key,'screen:2');
});
test('reopening a completed daily session preserves its receipt and never resets to lesson one',async()=>{
 const s=emptyState();s.session=sessionPlan(s,entries,dateKey());s.session.index=s.session.tasks.length-1;s.session.done=true;
 const root={innerHTML:''},ctx={state:s,entries,save(){}};const before=structuredClone(s.session),cleanup=await startSession(ctx,root);cleanup();assert.equal(s.session.tasks[0].entryId,before.tasks[0].entryId);assert.equal(s.session.done,true);assert.match(root.innerHTML,/Leçon terminée/);
});
test('personal explanations identify pieces, the actual reply and the legal alternative',()=>{
 const r=game(),e=personalExplanation(r,r.analysis.allMoments[0]);assert.match(e.cause,/fou/);assert.match(e.cause,/tour/);assert.match(e.actualText,/pas le coup joué/);assert.match(e.question,/peux-tu reprendre/);assert.deepEqual(e.punishment.losses,['fou','pion']);assert.ok(e.punishment.steps.length>=3);
 const actual=game();actual.moves[1]='a8a4';assert.match(personalExplanation(actual,actual.analysis.allMoments[0]).actualText,/effectivement/);
 const unfinished=game();unfinished.moves.length=1;assert.match(personalExplanation(unfinished,unfinished.analysis.allMoments[0]).actualText,/s’arrête/);
});
test('illegal tails are dropped and en passant records the pawn actually captured',()=>{
 assert.equal(branchEvidence(fen,['b3a4','a8a4','z9z8'],'w').steps.length,2);
 const p=new Chess();for(const m of ['e4','a6','e5','d5'])p.move(m);
 const b=branchEvidence(p.fen(),['e5d6'],'w');assert.deepEqual(b.gains,['pion']);assert.equal(new Chess(b.finalFen).get('d5'),undefined);
});
test('each review continuation starts from its exact scene and can be played in both colours',()=>{
 for(const r of [game(),{id:'black',initialFen:'6k1/7p/1b6/8/8/8/8/R6K b - - 0 1',color:'b',moves:['b6a5','a1a5'],analysis:{allMoments:[{fen:'6k1/7p/1b6/8/8/8/8/R6K b - - 0 1',ply:1,played:'b6a5',best:'h7h6',reply:'a1a5',replyLine:['a1a5','g8f7'],line:['h7h6','a1a7'],loss:300}]}}]){
  for(const s of buildReviewScript(r)){const g=reviewSceneGame(r,s);for(const step of s.branch){assert.equal(g.fen(),step.fen);moveUci(g,step.move);assert.equal(g.fen(),step.afterFen);}}
 }
 assert.match(locationWords('a8','b'),/en bas, à droite/);assert.match(locationWords('a8','w'),/en haut, à gauche/);
});
test('whole-game facts distinguish a normal developed opening from a custom starting position',()=>{
 const g=new Chess();for(const m of ['e4','e5','Nf3','Nc6','Bc4','Bc5','d3','Nf6','O-O','d6','Nc3','O-O','a3','a6'])g.move(m);
 const r={id:'opening',initialFen:new Chess().fen(),color:'w',moves:g.history({verbose:true}).map(uci),analysis:{version:3,decisions:[],allMoments:[]}};
 const p=gameProfile(r);assert.equal(p.ownMoves,7);assert.match(p.facts.find(f=>f.kind==='opening').text,/sorti 3/);assert.ok(p.facts.some(f=>f.kind==='strength'));assert.equal(gameProfile(game()).facts.some(f=>f.kind==='opening'),false);
});
test('repeated mechanisms cite the actual moves and compare only other recent games',()=>{
 const r=game();r.moves=['b3a4','a8e8','a4b3','e8a8','b3a4','a8a4'];const g=new Chess(fen);for(const m of r.moves.slice(0,4))moveUci(g,m);r.analysis.allMoments.push(mistake(g.fen(),5));
 const p=gameProfile(r,[r,{...game(),id:'other'}]);assert.match(p.facts.find(f=>f.kind==='pattern').text,/coups 1, 3/);assert.equal(p.recurringGames,1);assert.equal(p.comparedGames,1);
});
test('cancelling an upgrade keeps the old complete analysis and its review schedule',async()=>{
 const r=game(),old=structuredClone(r.analysis),state=emptyState();state.games=[r];state.cards.keep={box:4,due:'2026-12-01'};const controller=new AbortController();
 await assert.rejects(analyzePendingGame(r,{search:async()=>{controller.abort();return {type:'cp',score:0,best:'a2a3',line:['a2a3']};}},{state,signal:controller.signal,save(){}}));assert.deepEqual(r.analysis,old);assert.equal(state.cards.keep.box,4);assert.equal(r.analysisStatus,'interrupted');assert.equal(hasPersonalAnalysis({analysis:{allMoments:[]}}),false);
});

test('a mating capture is explained as mate, never as an ordinary exchange',()=>{
 const g=new Chess();for(const m of ['e4','e5','Bc4','Nc6','Qh5'])g.move(m);
 const r={id:'mate',color:'b',initialFen:g.fen(),moves:['g8f6','h5f7'],analysis:{allMoments:[]}};
 const m={fen:g.fen(),played:'g8f6',reply:'h5f7',replyLine:['h5f7'],best:'g7g6',line:['g7g6'],ply:1};
 const e=personalExplanation(r,m);assert.match(e.cause,/échec et mat/);assert.doesNotMatch(e.cause,/juger l’échange/);assert.match(e.question,/roi/);assert.match(e.why,/passage/);r.analysis.allMoments=[m];assert.equal(gameProfile(r).focus.entryId,"proc-opponent-threat");
});
