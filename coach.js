import {renderSongReference} from './song-method.js?v=20';
import {courses,frameGame,boardHtml,findPuzzle} from './academy.js?v=20';
import {puzzles} from './content.js?v=20';
import {lessonForPuzzle} from './puzzle-lessons.js?v=20';
import {narratorFor,narrationFor,mediaBase,narratorPicker} from './narrator.js?v=20';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const coachCourses=[...courses];
for(const p of puzzles){const c=lessonForPuzzle(p,courses);if(!coachCourses.some(x=>x.id===c.id))coachCourses.push(c);}
const miniChecks={
 'mini-promotion':['Quand ton pion arrive au bout, que peux-tu choisir ?',['Une dame, une tour, un fou ou un cavalier','Uniquement une dame'],0,'La promotion offre quatre choix. La dame est souvent forte, mais vérifie notamment si elle provoque un pat.'],
 'mini-ep':['Quand la prise en passant est-elle possible ?',['À n’importe quel moment','Juste après le double pas du pion adverse, si les autres conditions sont réunies'],1,'Cette capture spéciale doit être jouée immédiatement après le double pas. Si tu joues autre chose, cette occasion disparaît.'],
 'mini-castle':['Que déplace-t-on pendant le roque ?',['Le roi et une tour','Le roi et un fou'],0,'Le roque est le seul coup qui déplace ton roi et une tour ensemble. Le roi doit rester en sécurité pendant tout son trajet.'],
 'mini-ladder':['Pourquoi utiliser les deux tours ?',['Une attaque le roi, l’autre coupe ses sorties','Les deux tours doivent être côte à côte'],0,'Les tours se partagent le travail : l’une donne échec et l’autre empêche le roi de descendre. C’est leur coopération qui rend le mat possible.'],
 'mini-skewer':['Dans cette enfilade, pourquoi la dame devient-elle prenable ?',['Le roi devant elle doit quitter la ligne attaquée','Une tour peut sauter par-dessus le roi'],0,'La tour donne échec au roi placé devant la dame. Le roi doit s’écarter ; la tour peut alors atteindre la dame. Les tours ne sautent jamais par-dessus une pièce.'],
 'mini-open-file':['Pourquoi placer une tour sur une colonne ouverte ?',['Elle peut agir le long d’une ligne sans pion','Elle devient impossible à capturer'],0,'Une colonne ouverte ne contient aucun pion. La tour peut y agir plus librement, mais tu dois toujours vérifier les attaques adverses.']
};
export function coachPlan(c){
 const steps=[];c.frames.forEach((frame,index)=>{steps.push({kind:'watch',frame:index});if(frame.check)steps.push({kind:'check',frame:index,check:frame.check});});
 if(!steps.some(s=>s.kind==='check')){
  const q=miniChecks[c.id],question=q?.[0]||c.question,answers=q?.[1]||c.answers,correct=q?.[2]??c.correct,why=q?.[3]||c.why;
  steps.push({kind:'check',frame:c.frames.length-1,check:{question,correct,observe:'Repense à ce que le coach vient de montrer.',before:c.frames.at(-1),options:answers.map(label=>({label,text:why}))}});
 }
 return steps;
}
export function coachState(state){return state.coach??={lessons:{}};}
export function validateCoach(value){const out={lessons:{}};if(coachCourses.some(c=>c.id===value?.active))out.active=value.active;for(const c of coachCourses){const r=value?.lessons?.[c.id];if(!r)continue;const steps=coachPlan(c),answers={};steps.forEach((s,i)=>{if(s.kind==='check'&&r.answers?.[i]===s.check.correct)answers[i]=s.check.correct;});const done=!!r.done&&steps.every((s,i)=>s.kind!=='check'||answers[i]===s.check.correct);let step=Number.isInteger(r.step)?Math.max(0,Math.min(steps.length-1,r.step)):0;const missed=steps.findIndex((s,i)=>i<step&&s.kind==='check'&&answers[i]!==s.check.correct);if(missed>=0)step=missed;out.lessons[c.id]={step,answers,done};}return out;}
export function feedbackAudio(c,step,choice,voice='male'){return (voice==='female'?'./coach-audio/':'./coach-audio-male-neural/')+c.id+'-'+step+'-'+choice+'.mp3';}
export function coachCaption(chapter,time){
 const cues=chapter.captions||[];
 if(!cues.length||time<cues[0].start)return 'Écoute le coach et suis les pièces.';
 if(time>=cues.at(-1).end+.35)return 'Prends le temps d’observer, puis continue.';
 return cues.find((cue,i)=>cue.start<=time&&time<(cues[i+1]?.start??chapter.end))?.text||'';
}
export class CoachPlayer{
 constructor(course,state,{save,onExit,onPractice,onLibrary,practiceLabel='À moi de jouer',recap=false}){
  this.course=course;this.state=state;this.save=save;this.onExit=onExit;this.onPractice=onPractice;this.onLibrary=onLibrary;this.practiceLabel=practiceLabel;this.media=narrationFor(course.id,narratorFor(state));this.steps=coachPlan(course);this.voice=false;this.rate=1;this.choice=null;this.status='';this.mediaElement=null;
  const saved=coachState(state).lessons[course.id];this.review=!!saved?.done;
  this.run=this.review?{step:0,answers:{},done:true}:(saved||{step:0,answers:{},done:false});
  if(!this.review)coachState(state).lessons[course.id]=this.run;
  if(recap&&this.review)this.steps=[{kind:'watch',frame:course.frames.length-1}];coachState(state).active=course.id;this.save();
 }
 mount(root){this.root=root;this.draw();}
 setNarrator(value){const playing=this.mediaElement&&!this.mediaElement.paused;this.stop();this.state.narrator=value==='female'?'female':'male';this.save();this.draw();if(playing)this.play();}
 stop(){this.mediaElement?.pause();}
 active(){return this.steps[this.run.step];}
 allowed(){const s=this.active();return s.kind==='watch'||this.run.answers[this.run.step]===s.check.correct;}
 choose(value){const s=this.active(),i=Number(value);if(s.kind!=='check'||!Number.isInteger(i)||!s.check.options[i]||this.run.answers[this.run.step]===s.check.correct)return false;this.choice=i;if(i===s.check.correct)this.run.answers[this.run.step]=i;this.save();return true;}
 next(){if(!this.allowed())return false;this.stop();if(this.run.step===this.steps.length-1){this.run.done=true;this.save();this.onPractice();return true;}this.run.step++;this.choice=null;this.save();this.draw();this.root?.scrollIntoView?.({block:'start'});if(this.voice)this.play();return true;}
 play(restart=false){
  const m=this.mediaElement;if(!m)return;this.voice=true;const s=this.active(),chapter=this.media.chapters[s.frame];
  if(restart||s.kind==='watch'&&(m.currentTime<chapter.start||m.currentTime>=chapter.end-.2)){try{m.currentTime=s.kind==='watch'?chapter.start:0;}catch{}}
  m.playbackRate=this.rate;const result=m.play();result?.catch(()=>{if(this.mediaElement!==m)return;const status=this.root.querySelector('#coach-status');if(status)status.textContent='Touche « Écouter le coach » pour lancer le son. Tu peux aussi lire son explication.';});
 }
 draw(){
  if(!this.root)return;this.stop();this.mediaElement=null;this.media=narrationFor(this.course.id,narratorFor(this.state));const base=mediaBase(this.course.id,narratorFor(this.state)),c=this.course,s=this.active(),f=c.frames[s.frame],q=s.check,chapter=this.media.chapters[s.frame];
  const answered=s.kind==='check'&&this.run.answers[this.run.step]===q.correct,choice=this.choice??(answered?q.correct:null),answer=choice===null?null:q?.options[choice];
  const shown=answer?(answer.board||f):q?.before||f;
  const visual=s.kind==='watch'?`<div class="coach-video-frame"><video id="coach-video" playsinline preload="metadata" poster="./media/${c.id}.jpg" aria-label="Le coach montre : ${esc(f.title)}"><source src="${base}.mp4#t=${chapter.start},${chapter.end}" type="video/mp4"><track kind="subtitles" src="${base}.vtt" srclang="fr" label="Français"></video></div>`:boardHtml(frameGame({...c,frames:[shown]},0),{arrows:shown.arrows||[],marks:shown.marks||[],flipped:findPuzzle(c.demo).side==='b'});
  const audio=s.kind==='check'?`<audio id="coach-answer-audio" preload="metadata" src="${feedbackAudio(c,this.run.step,answer?choice:'prompt',narratorFor(this.state))}"></audio>`:'';
  this.root.innerHTML=`<main class="coach-screen"><header class="focus-header"><button data-action="coach-exit">← Quitter</button><span>${this.review?'Révision':'Leçon avec le coach'} · ${this.run.step+1} / ${this.steps.length}</span></header><div class="coach-progress" role="progressbar" aria-label="Avancement de la leçon" aria-valuemin="0" aria-valuemax="${this.steps.length}" aria-valuenow="${this.run.step+1}"><span style="width:${100*(this.run.step+1)/this.steps.length}%"></span></div><div class="coach-lesson-bar"><p class="coach-course-name">${esc(c.title)}</p>${narratorPicker(this.state,'coach-narrator')}</div><div class="coach-grid"><section class="coach-visual"><div class="coach-mode">${s.kind==='watch'?'▶ LE COACH TE MONTRE':'À TOI DE RÉFLÉCHIR'}</div>${visual}${audio}${s.kind==='watch'&&chapter.captions?.length?`<p class="coach-caption" id="coach-caption" aria-label="Paroles du coach">${esc(coachCaption(chapter,chapter.start))}</p>`:''}</section><section class="coach-conversation"><h1>${esc(s.kind==='watch'?f.title:q.question)}</h1>${s.kind==='watch'?`<div class="coach-playback"><button class="btn secondary" data-action="coach-play">▶ Écouter le coach</button><button class="coach-replay" data-action="coach-replay" aria-label="Réécouter cette étape">↻</button><select id="coach-rate" aria-label="Vitesse du coach">${[.75,1,1.25].map(n=>`<option value="${n}" ${n===this.rate?'selected':''}>${n}×</option>`).join('')}</select></div><p id="coach-status" class="coach-status" role="status"></p><details class="coach-transcript"><summary>Lire l’explication</summary><p>${esc(chapter.text)}</p></details>${renderSongReference(c.id)}`:`<p class="coach-intro">${esc(q.observe)}</p>${!answer?'<button class="textlink coach-question-audio" data-action="coach-play">▶ Écouter la question</button>':''}<div class="coach-options">${q.options.map((a,i)=>`<button data-action="coach-answer" data-value="${i}" class="coach-option ${choice===i?(answered?'correct':'incorrect'):''}" ${answered?'disabled':''}><span>${i+1}</span>${esc(a.label)}</button>`).join('')}</div>${answer?`<div class="coach-response ${answered?'correct':'incorrect'}" role="status"><strong>${answered?'Oui, voici pourquoi.':'Regarde ce que ce choix change.'}</strong><p>${esc(answer.text)}</p><button class="textlink" data-action="coach-play">▶ Écouter l’explication</button>${!answered?'<small>Compare à nouveau les deux idées, puis réessaie.</small>':''}</div>`:'<p class="coach-status">Choisis une réponse. Le coach te montrera pourquoi.</p>'}`}</section><footer class="coach-actions"><button class="btn secondary" data-action="coach-prev" aria-label="Étape précédente" ${this.run.step===0?'disabled':''}>←</button><button class="btn full" data-action="coach-next" ${!this.allowed()?'disabled':''}>${this.run.step===this.steps.length-1?this.practiceLabel:s.kind==='check'?'Continuer':'J’ai compris, continuer'} →</button><button class="textlink coach-library" data-action="coach-library">Vidéo complète, audio et fiche</button></footer></div></main>`;
  this.root.querySelector?.('#coach-narrator')?.addEventListener('change',e=>this.setNarrator(e.target.value));
  const m=this.root.querySelector?.('video,audio');this.mediaElement=m;if(!m)return;
  const current=()=>this.mediaElement===m;
  if(s.kind==='watch'){
   const seek=()=>{if(current()){m.currentTime=chapter.start;m.playbackRate=this.rate;}};m.addEventListener('loadedmetadata',seek,{once:true});if(m.readyState>=1)seek();
   m.addEventListener('timeupdate',()=>{if(!current())return;const caption=this.root.querySelector('#coach-caption');if(caption){const words=coachCaption(chapter,m.currentTime);if(caption.textContent!==words)caption.textContent=words;}if(m.currentTime>=chapter.end-.12){m.pause();const status=this.root.querySelector('#coach-status');if(status)status.textContent='Cette explication est terminée. Continue ou réécoute-la.';}});
  }
  m.addEventListener('play',()=>{if(!current())return;const b=this.root.querySelector('[data-action="coach-play"]');if(b)b.textContent='Ⅱ Pause';});
  m.addEventListener('pause',()=>{if(!current())return;const b=this.root.querySelector('[data-action="coach-play"]');if(b)b.textContent=s.kind==='watch'?'▶ Écouter le coach':'▶ Écouter l’explication';});
  m.addEventListener('error',()=>{if(!current())return;const status=this.root.querySelector('#coach-status');if(status)status.textContent='Le son ou la vidéo ne se charge pas. Tu peux lire l’explication, puis continuer.';});
  this.root.querySelector('#coach-rate')?.addEventListener('change',e=>{this.rate=Number(e.target.value);m.playbackRate=this.rate;});
 }
 handle(action,value){
  if(action==='coach-play'){if(this.mediaElement?.paused)this.play();else this.stop();}
  if(action==='coach-replay'){this.play(true);}
  if(action==='coach-answer'&&this.choose(value)){this.draw();if(this.voice)this.play();}
  if(action==='coach-next')this.next();
  if(action==='coach-prev'&&this.run.step>0){this.stop();this.run.step--;this.choice=null;this.save();this.draw();this.root?.scrollIntoView?.({block:'start'});if(this.voice)this.play();}
  if(action==='coach-exit'){this.stop();this.save();this.onExit();}
  if(action==='coach-library'){this.stop();this.save();this.onLibrary();}
 }
}
