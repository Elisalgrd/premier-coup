import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { Chess } from "../src/chess/chess.js";
import { moveUci, material } from "../src/chess/notation.js";
import { explainMistake, simpleMove } from "../src/chess/coach-explanation.js";
import { essentials, essentialsWords } from "../src/learn/essentials.js";
import { coachWords } from "../src/play/coach-words.js";
import { coachAudio } from "../src/play/coach-audio.js";
import { RecordedCoach } from "../src/play/recorded-coach.js";
import { buildReviewScript, reviewSceneGame } from "../src/play/review-script.js";

test("explains a proven capture, a recapture and a quiet move without inventing material loss", () => {
  const m = { fen:"r6k/8/8/8/8/1B6/P7/6K1 w - - 0 1",played:"b3a4",best:"a2a3",reply:"a8a4",ply:1 };
  const e=explainMistake(m);
  assert.equal(e.consequence,"taken");assert.equal(e.bestReason,"bestStay");
  const black=explainMistake({fen:"6k1/7p/1b6/8/8/8/8/R6K b - - 0 1",played:"b6a5",best:"h7h6",reply:"a1a5"});
  assert.equal(black.consequence,"taken");assert.match(black.reply,/ton fou/);
  const exchange=explainMistake({fen:"r6k/8/8/8/8/1BP5/8/R5K1 w - - 0 1",played:"b3a4",best:"c3c4",reply:"a8a4"});
  assert.equal(exchange.consequence,"capture");assert.doesNotMatch(exchange.risk,/ne peux pas reprendre/);
  const quiet=explainMistake({fen:new Chess().fen(),played:"a2a3",best:"e2e4",reply:"e7e5",loss:900});
  assert.equal(quiet.consequence,"quiet");assert.doesNotMatch(quiet.risk,/valeur|tour perdue|dame perdue/);
  const invalid={...m,reply:"a8h1"};
  const scenes=buildReviewScript({initialFen:m.fen,moves:[m.played],analysis:{allMoments:[invalid]}});
  for(const s of scenes) {const g=reviewSceneGame({initialFen:m.fen,moves:[m.played]},s);if(s.move)moveUci(g,s.move);}
});

test("free captures and mates are described only when the displayed board proves them",()=>{
  const free=explainMistake({fen:"6k1/8/8/3r4/8/8/8/3Q2K1 w - - 0 1",played:"g1f1",best:"d1d5",reply:"d5d1"});
  assert.equal(free.bestReason,"bestTake");
  const defended=explainMistake({fen:"6k1/8/4p3/3n4/2Q5/8/8/6K1 w - - 0 1",played:"g1f1",best:"c4d5",reply:null});
  assert.equal(defended.bestReason,"bestExchange");
  const mate=explainMistake({fen:"6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",played:"a1b1",best:"a1a8",reply:null});
  assert.equal(mate.bestReason,"bestMate");assert.equal(mate.remember,"rememberChance");
  const g=new Chess('8/P7/7k/8/8/8/8/7K w - - 0 1');
  assert.match(simpleMove(moveUci(g,'a7a8n')),/devient un cavalier/);
});

test("all essentials examples are legal, illustrated, linked, and prove their teaching point",()=>{
  const end={};
  for(const e of essentials){
    assert.ok(fs.existsSync(`curriculum/entries/${e.lesson}.json`),e.lesson);
    const g=new Chess(e.fen);
    for(const s of e.steps){
      if(s.move)moveUci(g,s.move);
      assert.ok(s.text.split(/\s+/).length<=70,e.id);
      for(const square of [...(s.marks||[]),...(s.arrows||[]).flatMap(a=>a.slice(0,2))])assert.match(square,/^[a-h][1-8]$/);
      const other=g.turn()==='w'?'b':'w',king=g.board().flat().find(p=>p?.color===other&&p.type==='k');
      assert.equal(g.isAttacked(king.square,g.turn()),false,e.id+': side that just played is safe');
    }
    end[e.id]=g;
  }
  assert.equal(end.safety.get('a4').type,'r');assert.equal(end.safety.board().flat().some(p=>p?.type==='b'),false);
  assert.equal(end.centre.get('e4').type,'p');assert.ok(end.centre.attackers('d5','w').includes('e4'));
  assert.equal(end.develop.get('f3').type,'n');assert.ok(end.develop.attackers('e5','w').includes('f3'));
  assert.equal(end.king.get('g1').type,'k');assert.equal(end.king.get('f1').type,'r');
  assert.equal(end.fork.get('d8').type,'n');assert.equal(end.fork.board().flat().some(p=>p?.type==='r'),false);
  const count=essentials.find(e=>e.id==='count'),before=new Chess(count.fen);
  assert.equal((material(before,'w')-material(before,'b'))-(material(end.count,'w')-material(end.count,'b')),6);
  assert.ok(end.finish.attackers('d3','w').includes('e3'));
});

test("every explanation has matching complete, versioned male audio",()=>{
  for(const [id,text] of Object.entries({...coachWords,...essentialsWords})){
    const clip=coachAudio[id];assert.ok(clip,id);assert.equal(clip.text,text,id);
    assert.equal(clip.voice,'fr-FR-HenriNeural');assert.ok(clip.duration>3);
    assert.ok(fs.statSync(clip.file).size>1000);
    const hash=crypto.createHash('sha256').update(clip.voice+'-3%'+text).digest('hex').slice(0,16);
    assert.equal(clip.hash,hash);assert.ok(clip.file.includes(hash));
    assert.doesNotMatch(text,/\b[a-h][1-8]\b|centipion/);
  }
});

test("recorded voice cancels on navigation, tolerates playback refusal, and reuses its player",async()=>{
  class FakeAudio {static instances=0;constructor(){FakeAudio.instances++;}setAttribute(){}pause(){this.paused=true;}play(){this.paused=false;this.onplaying?.();return Promise.resolve();}}
  const statuses=[],voice=new RecordedCoach({AudioClass:FakeAudio,onStatus:s=>statuses.push(s)});
  let started=0;const c=new AbortController(),p=voice.play('played',{signal:c.signal,onStart:()=>started++});
  c.abort();assert.equal(await p,false);assert.equal(voice.audio.paused,true);
  const q=voice.play('taken');voice.audio.onended();assert.equal(await q,true);assert.equal(FakeAudio.instances,1);assert.equal(started,1);
  voice.audio.play=()=>Promise.reject(Error('NotAllowedError'));
  assert.equal(await voice.play('played'),false);assert.equal(statuses.at(-1),'unavailable');voice.destroy();
});
