import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Chess } from "../src/chess/chess.js";
import { moveUci } from "../src/chess/notation.js";
import { mistakeMessage } from "../src/chess/mistake-text.js";
import { buildReviewScript, reviewSceneGame } from "../src/play/review-script.js";
import { ReviewTimeline } from "../src/play/review-timeline.js";
import { speakReview, reviewVoice } from "../src/play/review-speech.js";
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/mistakes.json'))[2];
const moment={...mistakeMessage(fixture.fen,fixture.played,{...fixture.before,best:fixture.best,line:[fixture.best]},fixture.after),ply:1};
const record={initialFen:fixture.fen,color:'w',moves:[fixture.played],analysis:{allMoments:[moment]}};
test('review scenes show the played move, punishment, reset and best move, then a question',()=>{
 const scenes=buildReviewScript(record);
 assert.deepEqual(scenes.map(s=>s.kind),['intro','before','played','reply','best','takeaway','outro']);
 for(const s of scenes){assert.ok(s.text);const g=reviewSceneGame(record,s);assert.equal(g.fen(),s.fen);if(s.move)moveUci(g,s.move);}
 assert.equal(scenes.find(s=>s.kind==='reply').arrows[0][2],'danger');
 assert.equal(scenes.find(s=>s.kind==='best').fen,fixture.fen);
 assert.equal(scenes.find(s=>s.kind==='best').arrows[0][2],'good');
 assert.equal(scenes.find(s=>s.kind==='takeaway').minMs,3000);
 const black={initialFen:new Chess().fen(),moves:['e2e4','e7e5'],color:'b',analysis:{allMoments:[]}};
 const g=new Chess();moveUci(g,'e2e4');
 const m=mistakeMessage(g.fen(),'e7e5',{type:'cp',score:0,best:'c7c5',line:['c7c5']},{type:'cp',score:250,line:['g1f3']});
 black.analysis.allMoments=[{...m,ply:2}];
 const b=buildReviewScript(black);assert.equal(b.find(s=>s.kind==='best').fen.split(' ')[1],'b');
 assert.equal(b.find(s=>s.kind==='fast').move,'e2e4');
 assert.equal(buildReviewScript({...record,analysis:{allMoments:[]}}).length,1);
});
test('missing speech uses readable subtitle timing and remote voices are excluded',async()=>{
 let duration;await speakReview('Une phrase lisible.',{synth:null,wait:async ms=>duration=ms});assert.ok(duration>=1500);
 const local={name:'Thomas enhanced',voiceURI:'local',lang:'fr-FR',localService:true};
 assert.equal(reviewVoice({}, {getVoices:()=>[{name:'Remote',lang:'fr-FR',localService:false},local]}),local);
});
test('pause cancels both waits; resume replays the same board scene without advancing twice',async()=>{
 const shown=[],waiters=[];let done=0;
 const t=new ReviewTimeline([{kind:'played',text:'texte',minMs:1000},{kind:'outro',text:'fin',minMs:1000}],{
 show:s=>shown.push(s.kind),speak:async()=>{},wait:(_,signal)=>new Promise(resolve=>{waiters.push(resolve);signal.addEventListener('abort',resolve,{once:true});}),onDone:()=>done++});
 const first=t.play();t.pause();await first;assert.equal(t.index,0);
 const second=t.play();assert.deepEqual(shown,['played','played']);waiters.at(-1)();await new Promise(resolve=>setImmediate(resolve));assert.equal(t.index,1);waiters.at(-1)();await second;assert.equal(done,1);
});
