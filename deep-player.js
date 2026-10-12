import {Chess} from './chess.js';
import {deepLessons,deepLessonFor,sceneFrames} from './deep-lessons.js?v=19';
import {deepAudio} from './deep-audio.js?v=19';
import {findPuzzle,gameAt,tryMove} from './academy.js?v=19';
import {createDrill} from './drills.js?v=19';
import {naturalBoard,naturalReview,place,practiceGoal,practiceExplanation,practiceTopic,practiceGame} from './deep-practice.js?v=19';
import {puzzles} from './content.js?v=19';
import {adaptation,difficulty} from './adaptive.js?v=19';
import {renderSongReference} from './song-method.js?v=19';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
const initialPuzzle=()=>({stage:'solo',moveIndex:0,assisted:false,solved:false});
export const newDeepRun=()=>({phase:'lesson',scene:0,beat:0,time:0,seen:[],answers:{},quiz:0,queue:[],index:0,results:[],puzzleRun:initialPuzzle(),completed:false,note:''});
export const deepState=state=>state.deep??={lessons:{}};
export function applyVideoProgress(state,id,seen){const c=deepLessons.find(c=>c.id===id);if(!c||!seen.length)return;const r=deepState(state).lessons[id]??=newDeepRun();r.seen=[...new Set([...r.seen,...seen.filter(i=>Number.isInteger(i)&&i>=0&&i<c.scenes.length)])].sort((a,b)=>a-b);if(r.seen.length===c.scenes.length&&r.phase==='lesson'&&!r.returnPhase)r.phase='summary';}
export function deepPracticeQueue(state,c){if(c.theme)return createDrill(state,c.theme,undefined,{exclude:[c.guided]}).ids;const pool=puzzles.filter(p=>c.practice.includes(p.id)||c.practice.includes(p.variantOf)),level=adaptation(state).level,rank=p=>state.attempts[p.id]?.review?0:!state.attempts[p.id]?1:2;return pool.sort((a,b)=>rank(a)-rank(b)||Math.max(0,difficulty(a)-level)-Math.max(0,difficulty(b)-level)||(state.attempts[a.id]?.solves||0)-(state.attempts[b.id]?.solves||0)).slice(0,5).map(p=>p.id);}
export function validateDeep(raw){
 const out={lessons:{}};if(deepLessons.some(c=>c.id===raw?.active))out.active=raw.active;
 for(const c of deepLessons){const value=raw?.lessons?.[c.id];if(!value)continue;const r=newDeepRun();
  r.seen=[...new Set((Array.isArray(value.seen)?value.seen:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<c.scenes.length))];
  r.scene=Number.isInteger(value.scene)?Math.min(c.scenes.length-1,Math.max(0,value.scene)):0;
  r.beat=value.beat===1?1:0;const duration=deepAudio[c.id]?.scenes[r.scene]?.duration||120;
  r.time=Number.isFinite(value.time)?Math.max(0,Math.min(duration,value.time)):0;
  r.phase=['lesson','summary','quiz','guided','recap','problem','done'].includes(value.phase)?value.phase:'lesson';
  c.quiz.forEach((q,i)=>{if(value.answers?.[i]===q.correct)r.answers[i]=q.correct;});
  r.quiz=Number.isInteger(value.quiz)?Math.max(0,Math.min(c.quiz.length-1,value.quiz)):0;
  const missing=c.quiz.findIndex((q,i)=>r.answers[i]!==q.correct);if(missing>=0)r.quiz=Math.min(missing,r.quiz);
  if(r.seen.length<c.scenes.length&&r.phase!=='lesson')r.phase='lesson';
  if(missing>=0&&['guided','recap','problem','done'].includes(r.phase))r.phase='quiz';
  if(Array.isArray(value.queue)&&value.queue.length===5&&new Set(value.queue).size===5&&value.queue.every(id=>findPuzzle(id)))r.queue=[...value.queue];
  if(r.queue.length&&Array.isArray(value.results)){for(const [i,res] of value.results.entries()){if(i>=5||res?.id!==r.queue[i])break;r.results.push({id:res.id,assisted:!!res.assisted});}}
  r.index=r.results.length;
  if(!r.queue.length&&['recap','problem','done'].includes(r.phase))r.phase='guided';
  if(r.phase==='done'&&r.index!==5)r.phase='recap';
  if(r.index===5&&['problem','recap'].includes(r.phase))r.phase='done';
  if(r.seen.length===c.scenes.length&&(value.returnPhase==='quiz'||missing<0&&['guided','recap','problem','done'].includes(value.returnPhase)))r.returnPhase=value.returnPhase;
  const p=findPuzzle((r.returnPhase||r.phase)==='guided'?c.guided:r.queue[r.index]);
  if(p){const len=(p.line||p.solution).length,n=value.puzzleRun?.moveIndex;
   r.puzzleRun.moveIndex=Number.isInteger(n)&&n>=0&&n<=len&&(n%2===0||n===len)?n:0;
   r.puzzleRun.solved=r.puzzleRun.moveIndex===len;r.puzzleRun.assisted=!!value.puzzleRun?.assisted;
   if(p.accepted?.includes(value.puzzleRun?.choice))r.puzzleRun.choice=value.puzzleRun.choice;
   if(p.mate&&r.puzzleRun.solved&&typeof value.puzzleRun?.mateChoice==='string'&&practiceGame(p,value.puzzleRun))r.puzzleRun.mateChoice=value.puzzleRun.mateChoice;
  }
  r.completed=!!value.completed||r.phase==='done';r.note=typeof value.note==='string'?value.note.slice(0,2000):'';out.lessons[c.id]=r;
 }return out;
}
export function visualAt(scene,timing,at,manualBeat){
 const frames=sceneFrames(scene);const beat=manualBeat??Math.max(0,(timing?.beats||[]).findLastIndex(b=>at>=b.start));
 const g=new Chess(scene.fen);let last=null;
 for(let i=0;i<frames.length;i++){const f=frames[i];if(f.move&&(manualBeat!==undefined?i<=beat:at>=(timing?.beats[i]?.moveAt??Infinity))){g.move({from:f.move.slice(0,2),to:f.move.slice(2,4),promotion:f.move[4]});last=f.move;}}
 const f=frames[beat],moved=f.move&&last===f.move;
 return {g,beat,text:f.text,marks:moved?[...new Set([...f.marks.filter(x=>x!==f.move.slice(0,2)),f.move.slice(2,4)])]:f.marks,arrows:moved?[[f.move.slice(0,2),f.move.slice(2,4)]]:f.arrows,last};
}
export class DeepPlayer{
 constructor(lesson,state,{save,onExit,onRecord=()=>{},onMistake=()=>{},onPractice=null,recap=false}={}){
  this.lesson=lesson;this.state=state;this.save=save;this.onExit=onExit;this.onRecord=onRecord;this.onMistake=onMistake;this.onPractice=onPractice;
  const shelf=deepState(state);this.run=shelf.lessons[lesson.id]??=newDeepRun();shelf.active=lesson.id;
  this.rate=1;this.autoplay=true;this.audioToken=0;this.audio=null;this.playing=false;this.selected=null;this.targets=[];this.feedback='';this.tip=false;this.choice=null;this.sheet=false;this.correction=null;this.promotion=null;this.manual=false;
  // An already understood course can precede a new puzzle with its actual summary.
  this.recap=recap&&this.run.seen.length===lesson.scenes.length&&lesson.quiz.every((q,i)=>this.run.answers[i]===q.correct);
  this.save?.();
 }
 persist(){this.save?.();}
 stop(){this.audio?.pause();this.persist();}
 mount(root){this.root=root;this.draw();}
 lessonReady(){return this.run.seen.length===this.lesson.scenes.length;}
 quizReady(){return this.lesson.quiz.every((q,i)=>this.run.answers[i]===q.correct);}
 currentPuzzle(){return findPuzzle(this.run.phase==='guided'?this.lesson.guided:this.run.queue[this.run.index]);}
 change(scroll=true){this.persist();this.draw();if(scroll)this.root?.scrollIntoView?.({block:'start'});}
 markScene(){if(!this.run.seen.includes(this.run.scene))this.run.seen.push(this.run.scene);}
 nextChapter(play=false){this.markScene();this.stop();if(this.run.scene===this.lesson.scenes.length-1){this.run.phase=this.run.returnPhase||'summary';delete this.run.returnPhase;}else{this.run.scene++;this.run.beat=0;this.run.time=0;}this.manual=false;this.change(false);if(play&&this.run.phase==='lesson')this.play();}
 nextBeat(){const r=this.run,s=this.lesson.scenes[r.scene];if(r.beat<s.beats.length-1){this.stop();r.beat++;r.time=deepAudio[this.lesson.id]?.scenes[r.scene]?.beats[r.beat].start||0;this.manual=true;this.change(false);}else this.nextChapter();}
 choose(value){const r=this.run,q=this.lesson.quiz[r.quiz],i=Number(value);if(r.phase!=='quiz'||!Number.isInteger(i)||!q.options[i]||r.answers[r.quiz]===q.correct)return false;this.choice=i;if(i===q.correct)r.answers[r.quiz]=i;this.change(false);return true;}
 beginPractice(){if(!this.lessonReady()||!this.quizReady())return false;if(this.onPractice){this.stop();this.onPractice();return true;}this.run.phase='guided';this.run.puzzleRun=initialPuzzle();this.change();return true;}
 prepareProblems(){const c=this.lesson,r=this.run;r.queue=deepPracticeQueue(this.state,c);r.index=0;r.results=[];r.phase='recap';r.puzzleRun=initialPuzzle();this.resetInteraction();this.change();}
 resetInteraction(){this.selected=null;this.targets=[];this.tip=false;this.feedback='';this.promotion=null;this.correction=null;}
 play(){const a=this.audio;if(!a)return;this.manual=false;this.playing=true;a.playbackRate=this.rate;a.play()?.catch(()=>{if(this.audio!==a)return;this.setStatus('Touche Écouter pour lancer le son. Tu peux aussi lire et avancer avec les boutons.');});}
 setStatus(text){const node=this.root?.querySelector('#deep-status');if(node)node.textContent=text;}
 bindAudio(src,lessonAudio=false){
  const placeholder=this.root?.querySelector('#deep-audio');if(!placeholder)return;
  // Keep the user-activated media element when changing chapters (Safari).
  const a=this.audioElement||placeholder;this.audioElement=a;if(a!==placeholder)placeholder.replaceWith(a);this.audio=a;
  const token=++this.audioToken,same=()=>this.audio===a&&this.audioToken===token,r=this.run;
  for(const event of ['loadedmetadata','timeupdate','ended','play','pause','error'])a['on'+event]=null;
  if(lessonAudio){a.onloadedmetadata=()=>{if(same()){a.currentTime=Math.min(r.time,a.duration||r.time);this.updateVisual(a.currentTime);}};
   a.ontimeupdate=()=>{if(!same()||this.sheet||r.phase!=='lesson')return;r.time=a.currentTime;this.updateVisual(a.currentTime);if(Math.abs((this.lastSave||0)-r.time)>3){this.lastSave=r.time;this.persist();}};
   a.onended=()=>{if(same()){r.time=0;this.nextChapter(this.autoplay);}};
  }
  a.onplay=()=>{if(same()){const b=this.root.querySelector('[data-action="deep-audio"]');if(b)b.textContent='Ⅱ Pause';this.setStatus('');}};
  a.onpause=()=>{if(same()){const b=this.root.querySelector('[data-action="deep-audio"]');if(b)b.textContent='▶ Écouter';this.persist();}};
  a.onerror=()=>{if(same())this.setStatus('Le son ne se charge pas. Vérifie ta connexion, ou lis l’explication et utilise « Suite ».');};
  a.src=src;a.playbackRate=this.rate;a.load();
 }
 updateVisual(at){if(this.run.phase!=='lesson'||!this.root||this.sheet)return;const c=this.lesson,r=this.run,s=c.scenes[r.scene],v=visualAt(s,deepAudio[c.id]?.scenes[r.scene],at,this.manual?r.beat:undefined);
  r.beat=v.beat;const key=r.scene+':'+v.beat+':'+v.g.fen();if(this.visualKey!==key){this.visualKey=key;
   const board=this.root.querySelector('#deep-board');if(board){board.innerHTML=naturalBoard(v.g,{marks:v.marks,arrows:v.arrows,flipped:s.flipped});if(this.lastVisual&&v.last!==this.lastVisual.last&&v.last&&this.lastVisual.scene===r.scene&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches){const from=board.querySelector(`[data-value="${v.last.slice(0,2)}"]`),to=board.querySelector(`[data-value="${v.last.slice(2,4)}"]`),piece=to?.querySelector('.piece');if(piece&&from){const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();piece.animate?.([{transform:`translate(${a.x-b.x}px,${a.y-b.y}px)`},{transform:'translate(0,0)'}],{duration:650,easing:'ease-out'});}}}
   const text=this.root.querySelector('#deep-spoken');if(text){text.textContent=v.text;if(this.lastVisual?.beat!==v.beat)text.scrollTop=0;}this.lastVisual={scene:r.scene,last:v.last,beat:v.beat};
  }
  const next=this.root.querySelector('[data-action="deep-next"]');if(next)next.textContent=r.beat<s.beats.length-1?'Suite de l’explication →':r.scene<c.scenes.length-1?'Chapitre suivant →':'Terminer la leçon →';
  const meter=this.root.querySelector('#deep-seek');if(meter)meter.value=at;const stamp=this.root.querySelector('#deep-time');if(stamp)stamp.textContent=time(at)+' / '+time(deepAudio[c.id]?.scenes[r.scene]?.duration||0);
 }
 header(){const r=this.run,stage=this.sheet?'Le classeur':this.recap?'Rappel avant de jouer':r.phase==='lesson'?'1 · La leçon':r.phase==='summary'?'La leçon est terminée':r.phase==='quiz'?'2 · Le quiz':r.phase==='guided'?'3 · Avec le coach':r.phase==='done'?'Séance terminée':'4 · Les problèmes';return `<header class="deep-header"><button data-action="deep-exit">← Quitter</button><span>${stage}</span><button data-action="deep-sheet" aria-label="Ouvrir la fiche du cours">▤ Fiche</button></header>`;}
 renderSheet(){const c=this.lesson;return `<article class="deep-sheet"><span class="eyebrow">MON CLASSEUR · COURS COMPLET</span><h1>${esc(c.title)}</h1><p class="deep-rule">${esc(c.takeaway)}</p><button class="btn secondary full" data-action="video-open" data-value="course-${c.id}">▶ Regarder le cours en vidéo</button>${c.scenes.map((s,i)=>`<details ${i===this.run.scene?'open':''}><summary>${i+1}. ${esc(s.title)}</summary>${s.beats.map(b=>`<p>${esc(b.text)}</p>`).join('')}<button class="textlink" data-action="deep-chapter" data-value="${i}">Voir et écouter ce passage →</button></details>`).join('')}<label for="deep-note">Mon déclic à retenir</label><textarea id="deep-note" rows="3" maxlength="2000" placeholder="Ce que je veux penser à vérifier dans ma prochaine partie…">${esc(this.run.note)}</textarea><p class="small muted">Note enregistrée sur cet appareil.</p>${renderSongReference(c.id)}<p class="small muted">Cours et exemples originaux de Premier coup. Voix masculine de synthèse. Ce coach est indépendant de Julien Song.</p><button class="btn full" data-action="deep-sheet-close">Reprendre ma séance →</button></article>`;}
 draw(){
  if(!this.root)return;this.audio?.pause();this.audio=null;this.visualKey=null;const c=this.lesson,r=this.run;let html='',src=null,lessonAudio=false;
  if(this.sheet)html=this.renderSheet();
  else if(this.recap)html=`<section class="deep-summary"><span class="eyebrow">AVANT TON NOUVEL EXERCICE</span><h1>${esc(c.title)}</h1><p class="deep-rule">${esc(c.takeaway)}</p><p>Tu as déjà étudié ce cours et répondu à son quiz. Relis ce repère, puis regarde les deux camps avant de toucher une pièce.</p><button class="btn full" data-action="deep-resume-practice">J’ai relu, je passe à l’exercice →</button><button class="btn secondary full" data-action="deep-relearn">Réécouter le cours complet</button></section>`;
  else if(this.correction){const f=this.correction.frames[this.correction.index],p=this.currentPuzzle();html=`<section class="deep-correction"><span class="eyebrow">COMPRENDRE TON ESSAI · ${this.correction.index+1}/${this.correction.frames.length}</span><h1>${esc(f.title)}</h1>${naturalBoard(new Chess(f.fen),{marks:f.marks,arrows:f.arrows,flipped:p.side==='b'})}<p class="deep-rule" role="status">${esc(f.text)}</p><div class="deep-buttons">${this.correction.index?'<button class="btn secondary" data-action="deep-correction-prev">← Ton coup</button>':''}${this.correction.index<this.correction.frames.length-1?'<button class="btn full" data-action="deep-correction-next">Voir sa réponse →</button>':'<button class="btn full" data-action="deep-correction-retry">Revenir et réessayer →</button>'}</div></section>`;}
  else if(r.phase==='lesson'){
   const s=c.scenes[r.scene],meta=deepAudio[c.id]?.scenes[r.scene],v=visualAt(s,meta,r.time,this.manual?r.beat:undefined);r.beat=v.beat;
   src='./deep-audio/'+c.id+'-'+r.scene+'.mp3';lessonAudio=true;
   html=`<div class="deep-course-title"><span>${esc(c.title)}</span><details><summary>Sommaire · ${r.scene+1}/${c.scenes.length}</summary><ol>${c.scenes.map((s,i)=>`<li><button data-action="deep-chapter" data-value="${i}">${esc(s.title)} ${r.seen.includes(i)?'✓':''}</button></li>`).join('')}</ol></details></div><div class="deep-lesson-layout"><section class="deep-visual"><div class="deep-board-label"><span>REGARDE · LE COACH TE MONTRE</span><span>${s.flipped?'Noirs en bas':'Blancs en bas'}</span></div><div id="deep-board">${naturalBoard(v.g,{marks:v.marks,arrows:v.arrows,flipped:s.flipped})}</div><div class="deep-playback"><button class="btn" data-action="deep-audio">▶ Écouter le coach</button><button class="deep-icon-button" data-action="deep-replay" aria-label="Réécouter le chapitre">↻</button><select id="deep-rate" aria-label="Vitesse de la voix"><option value="0.85" ${this.rate===.85?'selected':''}>0,85×</option><option value="1" ${this.rate===1?'selected':''}>1×</option><option value="1.15" ${this.rate===1.15?'selected':''}>1,15×</option></select></div><div class="deep-timeline"><input type="range" id="deep-seek" aria-label="Position dans le chapitre" min="0" max="${meta?.duration||120}" step="0.1" value="${r.time}"><span id="deep-time">${time(r.time)} / ${time(meta?.duration||0)}</span></div><button class="vl-course-video" data-action="video-open" data-value="course-${c.id}">▶ Regarder ce cours en vidéo</button><label class="deep-auto"><input type="checkbox" id="deep-auto" ${this.autoplay?'checked':''}> Enchaîner les chapitres à l’oral</label></section><section class="deep-conversation"><span class="eyebrow">CHAPITRE ${r.scene+1} SUR ${c.scenes.length}</span><h1>${esc(s.title)}</h1><p id="deep-spoken">${esc(v.text)}</p><p id="deep-status" role="status"></p><div class="deep-buttons"><button class="btn secondary" data-action="deep-prev" aria-label="Explication précédente" ${r.scene===0&&r.beat===0?'disabled':''}>←</button><button class="btn full" data-action="deep-next">${r.beat<s.beats.length-1?'Suite de l’explication':r.scene<c.scenes.length-1?'Chapitre suivant':'Terminer la leçon'} →</button></div>${r.returnPhase?'<button class="textlink" data-action="deep-return">Reprendre mon exercice →</button>':''}<p class="deep-quiet">Écoute, ou lis à ton rythme. Le quiz vient après toute la leçon.</p></section></div>`;
  }
  else if(r.phase==='summary')html=`<section class="deep-summary"><span class="eyebrow">TU AS VU LES EXEMPLES</span><h1>Voilà l’idée à garder.</h1><p class="deep-rule">${esc(c.takeaway)}</p><h2>Tu sais maintenant expliquer…</h2><ul>${c.scenes.map(s=>`<li>${esc(s.title)}</li>`).join('')}</ul>${this.lessonReady()?'<button class="btn full" data-action="deep-quiz-start">Maintenant, le quiz · 3 questions →</button>':`<p>Il reste des passages à voir avant le quiz.</p><button class="btn full" data-action="deep-missing">Reprendre le premier passage manquant →</button>`}<button class="btn secondary full" data-action="deep-relearn">Revoir la leçon</button></section>`;
  else if(r.phase==='quiz'){
   const q=c.quiz[r.quiz],correct=r.answers[r.quiz]===q.correct,chosen=this.choice??(correct?q.correct:null);src=`./deep-audio/${c.id}-quiz-${r.quiz}-${chosen===null?'question':'why'}.mp3`;
   html=`<section class="deep-quiz"><span class="eyebrow">QUESTION ${r.quiz+1} / ${c.quiz.length}</span><h1>${esc(q.question)}</h1><button class="textlink" data-action="deep-audio">▶ Écouter ${chosen===null?'la question':'l’explication'}</button><div class="coach-options">${q.options.map((o,i)=>`<button class="coach-option ${chosen===i?(correct?'correct':'incorrect'):''}" data-action="deep-answer" data-value="${i}" ${correct?'disabled':''}><span>${i+1}</span>${esc(o)}</button>`).join('')}</div>${chosen!==null?`<div class="coach-response ${correct?'correct':'incorrect'}" role="status"><strong>${correct?'Oui, tu as compris l’idée.':'Reprenons le raisonnement.'}</strong><p>${esc(q.why)}</p>${correct?'':'<small>Tu peux choisir à nouveau, sans pénalité.</small>'}</div>`:''}<p id="deep-status" role="status"></p><button class="btn full" data-action="deep-quiz-next" ${!correct?'disabled':''}>${r.quiz===c.quiz.length-1?(this.onPractice?'Passer à mon problème':'Passer à l’exercice avec aide'):'Question suivante'} →</button><button class="textlink" data-action="deep-sheet">Relire la fiche</button></section>`;
  }
  else if(r.phase==='recap'){
   const p=this.currentPuzzle(),topic=practiceTopic(p);html=`<section class="deep-summary"><span class="eyebrow">AVANT LE PROBLÈME ${r.index+1} / 5</span><h1>Le rappel du coach</h1><p class="deep-rule">${esc(topic.takeaway)}</p><p>${esc(practiceGoal(p))}</p><p>La disposition peut changer. Cherche la même idée, puis imagine une réponse adverse.</p><button class="btn full" data-action="deep-problem-start">J’ai relu, à moi de jouer →</button><button class="textlink" data-action="deep-sheet">Revoir la fiche de cette séance</button></section>`;
  }
  else if(r.phase==='guided'||r.phase==='problem')html=this.renderPractice();
  else if(r.phase==='done')html=`<section class="deep-summary"><span class="deep-complete">✓</span><h1>Tu as appris, puis joué.</h1><p>La leçon, les trois questions et l’exercice avec aide sont terminés.</p><p class="deep-rule">${r.results.filter(x=>!x.assisted).length} / 5 problèmes réussis sans aide.<br><small>Un repère sur ces positions, pas un classement.</small></p><p>${esc(c.takeaway)}</p><button class="btn full" data-action="deep-again">5 autres problèmes sur ces idées →</button><button class="btn secondary full" data-action="deep-relearn">Revoir toute la leçon</button><button class="btn secondary full" data-action="deep-exit">Retour au parcours</button><button class="textlink" data-action="deep-sheet">Garder une note dans mon classeur</button></section>`;
  this.root.innerHTML=`<main class="deep-screen">${this.header()}${html}${src?'<audio id="deep-audio" preload="metadata"></audio>':''}</main>`;
  if(src)this.bindAudio(src,lessonAudio);
  this.root.querySelector('#deep-rate')?.addEventListener('change',e=>{this.rate=Number(e.target.value);if(this.audio)this.audio.playbackRate=this.rate;});
  this.root.querySelector('#deep-auto')?.addEventListener('change',e=>{this.autoplay=e.target.checked;});
  this.root.querySelector('#deep-seek')?.addEventListener('input',e=>{r.time=Number(e.target.value);this.manual=false;if(this.audio)this.audio.currentTime=r.time;this.updateVisual(r.time);this.persist();});
  this.root.querySelector('#deep-note')?.addEventListener('input',e=>{r.note=e.target.value.slice(0,2000);this.persist();});
 }
 renderPractice(){const c=this.lesson,r=this.run,p=this.currentPuzzle(),pr=r.puzzleRun,g=practiceGame(p,pr)||gameAt(p,pr.moveIndex,pr.choice),guided=r.phase==='guided',expected=(p.line||p.solution)[pr.moveIndex],show=(guided||this.tip)&&!pr.solved&&expected;
  const previous=pr.mateChoice||(pr.moveIndex===1&&pr.choice)||((p.line||p.solution)[pr.moveIndex-1]),piece=show?g.get(expected.slice(0,2)):null,names={p:'pion',n:'cavalier',b:'fou',r:'tour',q:'dame',k:'roi'};
  const instruction=pr.solved?'Regarde le résultat, puis continue.':this.selected?'Ta pièce est sélectionnée. Touche une case avec un point.':show?`Touche ${['q','r'].includes(piece?.type)?'la':'le'} ${names[piece?.type]||'pièce'} entouré${['q','r'].includes(piece?.type)?'e':''}, ${place(expected.slice(0,2),p.side==='b')}, puis la case au bout de la flèche.`:'Touche une de tes pièces, puis sa case d’arrivée.';
  return `<section class="deep-practice"><span class="eyebrow">${guided?'ENSEMBLE, SANS CHRONOMÈTRE':'PROBLÈME '+(r.index+1)+' / 5'}</span><h1>${pr.solved?'Oui, regarde pourquoi.':guided?'On essaie ensemble.':'À toi de retrouver l’idée.'}</h1><p>${esc(practiceGoal(p))}</p><div class="deep-board-label"><span>${p.side==='b'?'Tu joues les noirs':'Tu joues les blancs'}</span><span>${guided?'Flèche = le coup à essayer':'Prends ton temps'}</span></div>${naturalBoard(g,{interactive:!pr.solved,flipped:p.side==='b',selected:this.selected,targets:this.targets,marks:show?[expected.slice(0,2),expected.slice(2,4)]:previous?[previous.slice(0,2),previous.slice(2,4)]:[],arrows:show?[[expected.slice(0,2),expected.slice(2,4)]]:previous?[[previous.slice(0,2),previous.slice(2,4)]]:[]})}<p class="deep-touch" aria-live="polite">${esc(instruction)}</p>${this.promotion?`<div class="promotion-picker" role="group" aria-label="Choisir la promotion">${['q','r','b','n'].map(t=>`<button class="btn secondary" data-action="deep-promote" data-value="${t}">${names[t]}</button>`).join('')}</div>`:''}${pr.solved?`<p class="deep-rule">${esc(practiceExplanation(p,pr))}</p><button class="btn full" data-action="deep-practice-next">${guided?'Maintenant, 5 problèmes sans aide':r.index===4?'Voir mon bilan':'Rappel et problème suivant'} →</button>`:`<p role="status" class="deep-practice-status">${esc(this.feedback)}</p>${!guided?'<button class="btn secondary" data-action="deep-hint">Montre-moi un indice</button>':''}<button class="textlink" data-action="deep-sheet">Revoir le principe</button>`}</section>`;
 }
 handle(action,value){const r=this.run,c=this.lesson;
  if(action==='deep-exit'){this.stop();this.onExit?.();return;}
  if(action==='deep-sheet'){this.stop();this.sheet=true;this.change();return;}
  if(action==='deep-sheet-close'){this.sheet=false;this.change();return;}
  if(action==='deep-audio'){if(this.audio?.paused)this.play();else this.stop();return;}
  if(action==='deep-chapter'){const i=Number(value);if(!Number.isInteger(i)||!c.scenes[i])return;this.stop();this.sheet=false;this.recap=false;r.returnPhase??=r.phase!=='lesson'?r.phase:undefined;r.phase='lesson';r.scene=i;r.beat=0;r.time=0;this.manual=false;this.change();return;}
  if(action==='deep-relearn'){this.stop();this.recap=false;r.phase='lesson';r.scene=0;r.beat=0;r.time=0;this.manual=false;this.change();return;}
  if(this.recap){if(action==='deep-resume-practice')this.beginPractice();return;}
  if(action==='deep-return'&&r.returnPhase){this.stop();r.phase=r.returnPhase;delete r.returnPhase;this.change();return;}
  if(this.sheet)return;
  if(this.correction){if(action==='deep-correction-next')this.correction.index=Math.min(this.correction.frames.length-1,this.correction.index+1);if(action==='deep-correction-prev')this.correction.index=Math.max(0,this.correction.index-1);if(action==='deep-correction-retry')this.correction=null;this.change(false);return;}
  if(r.phase==='lesson'){
   if(action==='deep-next')this.nextBeat();
   if(action==='deep-replay'){r.time=0;r.beat=0;this.manual=false;this.change(false);this.play();}
   if(action==='deep-prev'){this.stop();if(r.beat){r.beat=0;r.time=0;}else if(r.scene){r.scene--;r.beat=c.scenes[r.scene].beats.length-1;r.time=deepAudio[c.id]?.scenes[r.scene]?.beats[r.beat].start||0;}this.manual=true;this.change(false);}
   return;
  }
  if(action==='deep-missing'){r.scene=c.scenes.findIndex((s,i)=>!r.seen.includes(i));r.phase='lesson';r.beat=0;r.time=0;this.manual=false;this.change();return;}
  if(action==='deep-quiz-start'&&r.phase==='summary'&&this.lessonReady()){r.phase='quiz';r.quiz=0;this.choice=null;this.change();return;}
  if(action==='deep-answer'){this.choose(value);return;}
  if(action==='deep-quiz-next'&&r.phase==='quiz'&&r.answers[r.quiz]===c.quiz[r.quiz].correct){this.stop();if(r.quiz===c.quiz.length-1)this.beginPractice();else{r.quiz++;this.choice=null;this.change();}return;}
  if(action==='deep-problem-start'&&r.phase==='recap'){r.phase='problem';this.change();return;}
  if(action==='deep-again'&&r.phase==='done'){this.prepareProblems();return;}
  if(!['guided','problem'].includes(r.phase))return;
  const p=this.currentPuzzle(),pr=r.puzzleRun;
  if(action==='deep-practice-next'&&pr.solved){if(r.phase==='guided')this.prepareProblems();else{r.results.push({id:p.id,assisted:pr.assisted});r.index++;r.puzzleRun=initialPuzzle();r.phase=r.index===5?'done':'recap';if(r.phase==='done')r.completed=true;this.resetInteraction();this.change();}return;}
  if(pr.solved)return;
  if(action==='deep-hint'){pr.assisted=true;this.tip=true;this.onMistake(p);this.change(false);return;}
  if(action==='deep-promote'&&this.promotion&&['q','r','b','n'].includes(value)){const move={...this.promotion,promotion:value};this.promotion=null;this.move(move);return;}
  if(action!=='aca-square')return;const g=gameAt(p,pr.moveIndex,pr.choice),piece=g.get(value);
  if(piece?.color===g.turn()){this.selected=value;this.targets=g.moves({square:value,verbose:true}).map(m=>m.to);this.change(false);return;}
  if(!this.selected||!this.targets.includes(value))return;
  const moves=g.moves({square:this.selected,verbose:true}).filter(m=>m.to===value);
  if(moves.some(m=>m.promotion)){this.promotion={from:this.selected,to:value};this.change(false);return;}
  this.move({from:this.selected,to:value});
 }
 move(move){const r=this.run,p=this.currentPuzzle(),pr=r.puzzleRun;if(!['guided','problem'].includes(r.phase)||pr.solved)return;
  const after=gameAt(p,pr.moveIndex,pr.choice);let made;try{made=after.move(move);}catch{return;}
  const result=tryMove(pr,{guided:p.id,solo:p.id},move);this.selected=null;this.targets=[];this.tip=false;
  if(!result.ok){this.correction=naturalReview(p,after,made);if(r.phase!=='guided')this.onMistake(p);}
  else if(result.finished){if(p.mate&&after.isCheckmate())pr.mateChoice=made.from+made.to+(made.promotion||'');this.feedback='';if(r.phase!=='guided')this.onRecord(p,pr.assisted);}
  else this.feedback='L’adversaire vient de répondre. Observe sa pièce déplacée, puis cherche le deuxième coup de ton idée.';
  this.change(false);
 }
}

export function deepMinutes(c){return Math.ceil((deepAudio[c.id]?.duration||c.scenes.reduce((n,s)=>n+s.beats.map(b=>b.text).join(' ').split(/\s+/).length,0)/2.4)/60);}
export function renderDeepCards(state){return `<div class="deep-cards">${deepLessons.map((c,i)=>{const r=state.deep?.lessons?.[c.id];return `<button data-action="deep-open" data-value="${c.id}" class="deep-card"><span class="deep-card-icon">${c.icon}</span><span><small>COURS ${i+1} · ${deepMinutes(c)} MIN À ÉCOUTER</small><strong>${esc(c.title)}</strong><em>${esc(c.subtitle)}</em><small>${r?.completed?'✓ Séance terminée · à revoir librement':r?'Reprendre ma séance':'Leçon → quiz → exercice → problèmes'}</small></span><b aria-hidden="true">→</b></button>`;}).join('')}</div>`;}
export function renderDeepHome(state){const active=deepLessonFor(state.deep?.active),next=(active&&!state.deep?.lessons?.[active.id]?.completed?active:null)||deepLessons.find(c=>!state.deep?.lessons?.[c.id]?.completed)||deepLessons[0],r=state.deep?.lessons?.[next.id];return `<section class="deep-home"><div class="deep-home-intro"><span class="eyebrow">TON COACH PARTICULIER D’ÉCHECS</span><h1>Comprendre d’abord.<br>Bien jouer ensuite.</h1><p>Des mots simples, les pièces montrées au bon moment, et une vraie leçon avant de te demander de jouer.</p></div><section class="deep-next"><span class="eyebrow">${r?'TA SÉANCE EN COURS':'COMMENCE ICI · COURS 1'}</span><h2>${esc(next.title)}</h2><p>${esc(next.subtitle)}</p><ol class="deep-agenda"><li><b>1</b><span>La leçon complète<small>${deepMinutes(next)} min · voix et échiquier animé</small></span></li><li><b>2</b><span>Le quiz<small>3 questions, après les explications</small></span></li><li><b>3</b><span>Un exercice ensemble<small>Le coach montre où regarder</small></span></li><li><b>4</b><span>5 problèmes à ton niveau<small>Un rappel avant chaque position</small></span></li></ol><button class="btn full" data-action="deep-open" data-value="${next.id}">${r?'Reprendre ma séance':'Commencer la leçon'} →</button><small>Environ 20 minutes avec la pratique. Tu peux faire une pause ou continuer autant que tu veux.</small></section><button class="vl-home-link" data-action="video-library"><span aria-hidden="true">▶</span><div><strong>La vidéothèque de ton coach</strong><small>Ouvertures, stratégies et grands cours en vidéo</small></div><b aria-hidden="true">→</b></button><div class="path-section-heading"><h2>Les 7 grands cours</h2><span>${deepLessons.filter(c=>state.deep?.lessons?.[c.id]?.completed).length} / 7 pratiqués</span></div>${renderDeepCards(state)}<details class="deep-method"><summary>Les conseils publics de Julien Song qui ont guidé les priorités</summary><p>Observer les menaces, comprendre les idées d’ouverture et chercher avant de regarder une solution. Les explications, exemples et voix de cette app sont originaux et indépendants.</p><button class="textlink" data-action="nav" data-value="method">Voir les conseils et leurs sources →</button></details></section>`;}
