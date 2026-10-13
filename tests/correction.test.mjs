import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptableCorrection, checkCorrection, CorrectionSession } from '../src/play/correction.js';
import { Chess } from '../src/chess/chess.js';
import { emptyState, validateState } from '../src/state/schema.js';
import { dueCards } from '../src/learn/srs.js';
import { addDays, dateKey } from '../src/ui/helpers.js';
test('accepts alternative within 50 cp, rejects a loss, respects mate and score perspective',()=>{
 assert.equal(acceptableCorrection({type:'cp',score:100},{type:'cp',score:-60}),true);
 assert.equal(acceptableCorrection({type:'cp',score:100},{type:'cp',score:200}),false);
 assert.equal(acceptableCorrection({type:'cp',score:1500},{type:'cp',score:-1000}),false);
 assert.equal(acceptableCorrection({type:'mate',score:2},{type:'cp',score:-900}),false);
 assert.equal(acceptableCorrection({type:'mate',score:2},{type:'mate',score:-4}),true);
 assert.equal(acceptableCorrection(null,null,true),true);
});
test('dedicated depth 12 validation accepts an alternative and recovers from unavailable engine',async()=>{
 const depths=[]; let n=0;
 const engine={search:async(_,o)=>{depths.push(o.depth);return n++ ? {type:'cp',score:-60,line:[]} : {best:'e2e4',type:'cp',score:100};}};
 assert.equal((await checkCorrection(engine,new Chess().fen(),'d2d4')).ok,true);assert.deepEqual(depths,[12,12]);
 assert.equal((await checkCorrection({search:async()=>{throw Error('offline');}},new Chess().fen(),'d2d4')).unavailable,true);
});
test('one grade per position survives reloading and failures are due tomorrow with priority',()=>{
 const state=emptyState(),m={ply:1,fen:new Chess().fen(),line:['d2d4'],best:'d2d4',played:'e2e4',label:'Mat raté'},record={id:'g',analysis:{allMoments:[m]}};state.games=[record];
 const run=new CorrectionSession(state,record);run.complete(m,true);run.complete(m,false);
 assert.equal(state.cards['mistake:g:1'].attempts,1);assert.equal(state.cards['mistake:g:1'].box,1);
 const restored=validateState(state),again=new CorrectionSession(restored,restored.games[0]);again.complete(m,true);assert.equal(restored.cards['mistake:g:1'].attempts,1);
 const other={...m,ply:3};run.complete(other,false);
 assert.equal(state.cards['mistake:g:3'].due,addDays(dateKey(),1));assert.equal(state.cards['mistake:g:3'].box,0);
 assert.equal(dueCards(state,addDays(dateKey(),1))[0].id,'mistake:g:3');assert.equal(Object.keys(state.cards).length,2);
});
