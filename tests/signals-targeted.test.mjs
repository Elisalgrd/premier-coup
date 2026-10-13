import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from '../src/chess/chess.js';
import { moveUci } from '../src/chess/notation.js';
import { detectSignal, signalStats, defaultSignals } from '../src/play/pre-move-signals.js';
import { mistakeThemes, mostFrequentMistake, targetedPlan } from '../src/learn/targeted.js';
import { emptyState, validateState } from '../src/state/schema.js';
const score={type:'cp',score:0};
function signal(fen,move,extra={}) { const g=new Chess(fen);moveUci(g,move);return detectSignal({fen:g.fen(),previousFen:fen,lastMove:move,currentScore:score,...extra}); }
test('calm positions stay quiet; new threats and free material produce only generic signals',()=>{
 const calm=new Chess();calm.move('e4');assert.equal(signal(calm.fen(),'e7e5'),null);
 const danger=signal('r6k/8/8/8/1B6/8/P7/6K1 b - - 0 1','a8b8');assert.equal(danger.kind,'threat');assert.doesNotMatch(danger.text,/b4|fou/);
 const opportunity=signal('r6k/8/8/8/B7/8/P7/6K1 b - - 0 1','a8e8');assert.equal(opportunity.kind,'opportunity');assert.doesNotMatch(opportunity.text,/e8|tour/);
 assert.equal(signal('7k/8/8/8/2n5/8/8/1Q3R1K b - - 0 1','c4d2').kind,'threat');
 assert.equal(signal('r6k/8/8/8/8/8/5PPP/6K1 b - - 0 1','a8e8').kind,'threat');
 assert.equal(signal(calm.fen(),'e7e5',{previousScore:{type:'cp',score:300}}).kind,'opportunity');
 assert.equal(defaultSignals(5),true);assert.equal(defaultSignals(6),false);
});
test('unverified replies and takebacks never count as successful signals',()=>{
 const stats=signalStats([{kind:'threat',played:'a2a3',success:null},{kind:'threat',success:true},{kind:'opportunity',success:false},{kind:'opportunity',success:null},{kind:'opportunity',success:true,retracted:true}]);
 assert.deepEqual(stats.threat,{total:2,success:1,pending:1});assert.deepEqual(stats.opportunity,{total:1,success:0,pending:0});
});
test('priority uses all errors from only the last ten games and thematic sets really mix sources',()=>{
 const state=emptyState();state.games=[{analysis:{allMoments:Array(20).fill({label:'Mat raté'})}},...Array.from({length:10},()=>({analysis:{allMoments:[{label:'Fourchette subie',entryId:'tac-fork',loss:300}]}}))];
 assert.equal(mostFrequentMistake(state).label,'Fourchette subie');assert.equal(mostFrequentMistake(state).count,10);
 assert.deepEqual(mistakeThemes['Mat raté'],['mateIn1','mateIn2']);assert.deepEqual(mistakeThemes['Clouage subi'],['pin']);
 state.cards={c:{id:'c',type:'mistake',principle:'Fourchette subie',challenge:{solution:['e2e4']},box:0,due:'2026-10-13'}};
 const manifest={themes:['fork','pin']}, rows=Array.from({length:20},(_,i)=>['p'+i,'','',800,'0x1']);rows.push(['wrong','','',800,'0x2']);
 const plan=targetedPlan(state,'Fourchette subie',rows,manifest,{seed:1});assert.equal(plan.length,10);assert.equal(plan[0].kind,'mistake');assert.equal(plan[1].kind,'puzzle');assert.ok(plan.every(p=>p.row?.[0]!=='wrong'));
 state.targeted={label:'Fourchette subie',plan,index:3};assert.equal(validateState(state).targeted.index,3);
});
