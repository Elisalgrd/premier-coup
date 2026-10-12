import {observationCases,methodIntro,songPrinciples} from './song-method.js?v=18';
import {findPuzzle,gameAt,boardHtml,tryMove} from './academy.js?v=18';
import {renderCorrection} from './correction.js?v=18';
import {narratorFor,narratorPicker} from './narrator.js?v=18';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const newObservation=(caseId=observationCases[0].id,completed={})=>({caseId,phase:'lesson',answer:null,stage:'solo',moveIndex:0,assisted:false,solved:false,completed});
export function validateObservation(raw){
 const c=observationCases.find(c=>c.id===raw?.caseId);if(!c)return newObservation();
 const completed={};for(const item of observationCases)if(typeof raw.completed?.[item.id]?.clean==='boolean')completed[item.id]={clean:raw.completed[item.id].clean};
 const r=newObservation(c.id,completed),p=findPuzzle(c.puzzle),len=(p.line||p.solution).length;
 r.phase=['lesson','observe','play','done','finished'].includes(raw.phase)?raw.phase:'lesson';
 r.answer=Number.isInteger(raw.answer)&&c.options[raw.answer]?raw.answer:null;r.assisted=!!raw.assisted;
 if(r.answer!==c.correct&&['play','done'].includes(r.phase))r.phase='observe';
 if(['play','done'].includes(r.phase)){
  r.moveIndex=Number.isInteger(raw.moveIndex)&&raw.moveIndex>=0&&raw.moveIndex<=len&&(raw.moveIndex%2===0||raw.moveIndex===len)?raw.moveIndex:0;
  if(p.accepted?.includes(raw.choice))r.choice=raw.choice;
  r.solved=r.moveIndex===len;r.phase=r.solved?'done':'play';
 }
 if(r.phase==='finished'&&Object.keys(completed).length!==observationCases.length)r.phase='lesson';
 return r;
}
export function observationAudio(phase,id,voice='male'){const clip=phase==='lesson'?'intro':phase==='observe'?id+'-question':phase==='done'?id+'-explain':null;return clip?'./observation-audio/'+(voice==='female'?'female':'male')+'/'+clip+'.mp3':null;}
export class ObservationPlayer{
 constructor(state,{save,onExit,onRecord,onMistake=()=>{}}){this.state=state;this.save=save;this.onExit=onExit;this.onRecord=onRecord;this.onMistake=onMistake;this.run=state.observation??=newObservation();this.selected=null;this.targets=[];this.feedback='';this.correction=null;this.voice=false;}
 get item(){return observationCases.find(c=>c.id===this.run.caseId);}
 get puzzle(){return findPuzzle(this.item.puzzle);}
 mount(root){this.root=root;this.draw();}
 stop(){this.audio?.pause();}
 persist(){this.state.observation=this.run;this.save();}
 redraw(){this.persist();this.draw();}
 play(){if(!this.audio)return;this.voice=true;this.audio.play()?.catch(()=>{const status=this.root.querySelector('#observation-audio-status');if(status)status.textContent='Touche Écouter pour lancer le son. Le texte reste disponible.';});}
 choose(value){const index=Number(value);if(this.run.phase!=='observe'||!Number.isInteger(index)||!this.item.options[index]||this.run.answer===this.item.correct)return false;this.run.answer=index;if(index!==this.item.correct){this.run.assisted=true;this.onMistake(this.puzzle);}this.redraw();return true;}
 draw(){
  if(!this.root)return;this.stop();this.audio=null;const r=this.run,c=this.item,p=this.puzzle,i=observationCases.indexOf(c),src=observationAudio(r.phase,c.id,narratorFor(this.state));
  const header=`<header class="focus-header"><button data-action="observe-exit">← Retour</button><span>${r.phase==='lesson'?'La leçon avant de jouer':r.phase==='finished'?'Ton bilan':'Situation '+(i+1)+' / '+observationCases.length}</span></header>`;
  if(this.correction){this.root.innerHTML=`<main class="course-screen focused-course observation-screen">${header}${renderCorrection(this.correction,(g,opts)=>boardHtml(g,{...opts,flipped:p.side==='b'}))}</main>`;return;}
  let content='';
  if(r.phase==='lesson')content=`<section class="observation-intro"><span class="eyebrow">APPRENDRE À CHOISIR UNE IDÉE</span><h1>Observe avant de jouer.</h1><p>${i?'Un rappel avant la nouvelle position.':'Voici la leçon qui prépare les quatre situations.'}</p><ol><li><strong>Sa menace</strong>Que peut-il faire si je l’ignore ?</li><li><strong>Mon idée</strong>Y a-t-il un gain à calculer, ou une pièce à améliorer ?</li><li><strong>Sa réponse</strong>Qu’est-ce qui pourrait faire échouer mon coup ?</li></ol><details class="coach-transcript"><summary>Lire toute la leçon</summary><p>${methodIntro}</p></details><button class="btn full" data-action="observe-begin">J’ai compris, j’observe la position →</button><p class="observation-note">Tu chercheras d’abord une priorité. L’explication complète viendra après ton essai.</p></section>`;
  else if(r.phase==='finished'){const clean=Object.values(r.completed).filter(v=>v.clean).length;content=`<section class="observation-intro"><div class="done-symbol">✓</div><h1>Tu as choisi, puis joué.</h1><p>${clean} / 4 situations réussies sans correction. Ce repère concerne ces exercices, pas ton niveau en partie.</p><div class="observation-results">${observationCases.map(item=>`<p><strong>${item.id==='protect'?'Repérer une menace':item.id==='spot'?'Détecter une occasion':item.id==='build'?'Construire un plan':'Vérifier les reprises'}</strong><span>${r.completed[item.id]?.clean?'✓ Réussi sans correction':'À consolider'}</span></p>`).join('')}</div><button class="btn full" data-action="observe-restart">Refaire les quatre situations →</button><button class="btn secondary full" data-action="observe-exit">Retour aux repères de Julien Song</button></section>`;}
  else{
   const correct=r.answer===c.correct,answered=r.answer!==null,g=gameAt(p,r.moveIndex,r.choice),playing=r.phase==='play',done=r.phase==='done';
   const board=boardHtml(g,{interactive:playing,flipped:p.side==='b',selected:this.selected,targets:this.targets,marks:!correct&&answered&&r.phase==='observe'?c.marks:[]});
   const title=r.phase==='observe'?c.question:done?'L’idée, puis le coup.':c.goal;
   content=`<section class="focus-lesson is-exercise observation-position"><div class="focus-heading"><span class="mode-chip">${r.phase==='observe'?'1 · CHOISIS UNE PRIORITÉ':done?'3 · COMPRENDS LE RÉSULTAT':'2 · JOUE TON IDÉE'}</span><h1>${title}</h1></div><div class="focus-board"><p class="board-instruction">${playing?(this.selected?'Pièce sélectionnée : touche une case marquée.':'Touche ta pièce, puis sa case d’arrivée.'):'Observe les deux camps avant de décider.'}</p>${board}<div class="board-caption">${p.side==='b'?'Tu joues les noirs':'Tu joues les blancs'}</div></div><div class="focus-explanation">${r.phase==='observe'?`<div class="coach-options">${c.options.map((text,n)=>`<button class="coach-option ${r.answer===n?(correct?'correct':'incorrect'):''}" data-action="observe-answer" data-value="${n}" ${correct?'disabled':''}><span>${n+1}</span>${text}</button>`).join('')}</div>${answered?`<p class="coach-response ${correct?'correct':'incorrect'}" role="status">${correct?'Bonne priorité. Maintenant, trouve un coup qui réalise cette idée.':c.wrong}</p>`:''}`:done?`<p>${c.why}</p><p class="feedback">${p.why}</p><details class="song-reference"><summary>Le conseil public qui inspire cet exercice</summary><a href="${songPrinciples.find(s=>s.id===c.source).url}" target="_blank" rel="noopener">${songPrinciples.find(s=>s.id===c.source).source} ↗</a></details>`:`<p role="status">${this.feedback||'Prends le temps de prévoir une réponse adverse avant de jouer.'}</p>`}</div><div class="focus-actions">${r.phase==='observe'?`<button class="btn full" data-action="observe-practice" ${!correct?'disabled':''}>Jouer mon idée →</button>`:done?`<button class="btn full" data-action="observe-next">${i===observationCases.length-1?'Voir mon bilan':'Leçon et situation suivante'} →</button>`:'<button class="btn secondary" data-action="observe-hint">Un indice</button>'}</div></section>`;
  }
  this.root.innerHTML=`<main class="course-screen focused-course observation-screen">${header}${src?`<div class="observation-audio">${narratorPicker(this.state,'observe-narrator')}<audio preload="metadata" src="${src}"></audio><button class="textlink" data-action="observe-audio">▶ Écouter ${r.phase==='lesson'?'la leçon':r.phase==='done'?'l’explication':'la question'}</button><span id="observation-audio-status" role="status"></span></div>`:''}${content}</main>`;
  this.root.querySelector?.('#observe-narrator')?.addEventListener('change',e=>{const playing=this.audio&&!this.audio.paused;this.state.narrator=e.target.value==='female'?'female':'male';this.redraw();if(playing)this.play();});
  const audio=this.root.querySelector?.('audio');this.audio=audio;
  if(audio){audio.addEventListener('play',()=>{if(this.audio!==audio)return;const b=this.root.querySelector('[data-action="observe-audio"]');if(b)b.textContent='Ⅱ Pause';});audio.addEventListener('pause',()=>{if(this.audio!==audio)return;const b=this.root.querySelector('[data-action="observe-audio"]');if(b)b.textContent='▶ Réécouter';});audio.addEventListener('error',()=>{if(this.audio!==audio)return;const status=this.root.querySelector('#observation-audio-status');if(status)status.textContent='Le son ne se charge pas. Tu peux lire le texte et continuer.';});}
 }
 handle(action,value){
  const r=this.run,c=this.item,p=this.puzzle;
  if(action==='observe-exit'){this.stop();this.persist();this.onExit();return;}
  if(this.correction){if(action==='review-next')this.correction.index=Math.min(this.correction.frames.length-1,this.correction.index+1);if(action==='review-prev')this.correction.index=Math.max(0,this.correction.index-1);if(action==='review-retry')this.correction=null;this.draw();return;}
  if(action==='observe-audio'){if(this.audio?.paused)this.play();else this.stop();return;}
  if(action==='observe-begin'&&r.phase==='lesson'){r.phase='observe';this.redraw();this.root?.scrollIntoView?.({block:'start'});return;}
  if(action==='observe-answer'){this.choose(value);return;}
  if(action==='observe-practice'&&r.phase==='observe'&&r.answer===c.correct){r.phase='play';this.redraw();this.root?.scrollIntoView?.({block:'start'});return;}
  if(action==='observe-next'&&r.phase==='done'){const next=observationCases[observationCases.indexOf(c)+1];this.run=next?newObservation(next.id,r.completed):{...r,phase:'finished'};this.feedback='';this.selected=null;this.targets=[];this.redraw();this.root?.scrollIntoView?.({block:'start'});return;}
  if(action==='observe-restart'&&r.phase==='finished'){this.run=newObservation();this.redraw();return;}
  if(action==='observe-hint'&&r.phase==='play'){r.assisted=true;this.onMistake(p);this.feedback=p.hints?.[Math.floor(r.moveIndex/2)]||p.hint;this.redraw();return;}
  if(action!=='aca-square'||r.phase!=='play'||r.solved)return;
  const g=gameAt(p,r.moveIndex,r.choice),piece=g.get(value);
  if(piece?.color===g.turn()){this.selected=value;this.targets=g.moves({square:value,verbose:true}).map(m=>m.to);this.draw();return;}
  if(!this.selected||!this.targets.includes(value))return;
  const result=tryMove(r,{guided:p.id,solo:p.id},{from:this.selected,to:value});this.selected=null;this.targets=[];
  if(!result.ok){this.onMistake(p);this.correction=result.review;this.feedback=result.text;}
  else if(result.finished){r.phase='done';r.completed[c.id]={clean:!r.assisted};this.onRecord(p,r.assisted);}
  else this.feedback=result.text;
  this.redraw();if(r.phase==='done'&&this.voice)this.play();
 }
}
