import {lessons,puzzles} from './content.js';
import {strategies} from './advanced.js';
export const trainingLessons=['scan','candidates','fork','pin','opening','italian-plan','black-plan','mate','convert','improve','endgame','review-game'].map(id=>lessons.find(l=>l.id===id));
const tacticIds=['fork','backrank','remove','fork-finish','pawn-fork','skewer','queen-mate','exchange-chain','ladder','scholar','ladder-two'];
function nextLesson(state,today){return (trainingLessons.find(l=>!state.lessons.includes(l.id))||trainingLessons[new Date(today+'T12:00:00').getDate()%trainingLessons.length]).id;}
function tacticPool(state){const learned=trainingLessons.filter(l=>state.lessons.includes(l.id)).length;return tacticIds.map(id=>puzzles.find(p=>p.id===id)).filter(p=>p.level<3||learned>=6).sort((a,b)=>{const aa=state.attempts[a.id],bb=state.attempts[b.id];const priority=x=>x?.review?0:!x?1:2;return priority(aa)-priority(bb)||(aa?.last||'').localeCompare(bb?.last||'')||tacticIds.indexOf(a.id)-tacticIds.indexOf(b.id);});}
export const fresh=()=>({version:1,lessons:[],attempts:{},days:{},goal:20,game:null});
export function dayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function offsetDay(key,n){const d=new Date(key+'T12:00:00');d.setDate(d.getDate()+n);return dayKey(d);}
export function streak(state,today=dayKey()){let key=state.days[today]?.complete?today:offsetDay(today,-1),n=0;while(state.days[key]?.complete){n++;key=offsetDay(key,-1);}return n;}
export function plan(state,today=dayKey()){
 if(!state.days[today])state.days[today]={lesson:nextLesson(state,today),puzzles:tacticPool(state).slice(0,5).map(p=>p.id),solved:[],learned:false,complete:false,format:2,strategy:strategies[Object.values(state.days).filter(d=>d.complete).length%strategies.length].id,studied:false,reflection:'',curriculum:'tactics-v1'};
 const d=state.days[today];
 if(!d.complete&&d.curriculum!=='tactics-v1'){
  if(!d.learned)d.lesson=nextLesson(state,today);
  const kept=d.puzzles.filter(id=>d.solved.includes(id));
  const remaining=tacticPool(state).map(p=>p.id).filter(id=>!kept.includes(id));
  d.puzzles=[...kept,...remaining].slice(0,5);
  d.format=2;d.strategy=d.strategy||strategies[0].id;d.studied=!!d.studied;d.reflection=d.reflection||'';d.curriculum='tactics-v1';
 }
 return state.days[today];
}
export function recordPuzzle(state,id,assisted=false,today=dayKey()){const before=state.attempts[id]||{solves:0,clean:0,review:false};state.attempts[id]={...before,solves:before.solves+1,clean:before.clean+(assisted?0:1),review:assisted,last:today};const d=plan(state,today);if(d.puzzles.includes(id)&&!d.solved.includes(id))d.solved.push(id);finish(d);}
export function recordLesson(state,id,today=dayKey()){if(!state.lessons.includes(id))state.lessons.push(id);const d=plan(state,today);if(d.lesson===id)d.learned=true;finish(d);}
export function recordStudy(state,id,today=dayKey()){const d=plan(state,today);if(d.strategy===id)d.studied=true;finish(d);}
export function recordReflection(state,text,today=dayKey()){const d=plan(state,today);d.reflection=String(text).trim().slice(0,600);finish(d);}
function finish(d){d.complete=d.learned&&d.puzzles.every(id=>d.solved.includes(id))&&(!d.format||(d.studied&&d.reflection.length>=10));}
export function validateSave(value){
 if(!value||value.version!==1||!Array.isArray(value.lessons)||!value.attempts||!value.days||typeof value.attempts!=='object'||typeof value.days!=='object')throw Error('Format de sauvegarde non reconnu.');
 const s=fresh();s.lessons=[...new Set(value.lessons.filter(id=>lessons.some(l=>l.id===id)))];
 for(const p of puzzles){const a=value.attempts[p.id];if(a&&Number.isSafeInteger(a.solves)&&a.solves>=0&&a.solves<=1e7&&Number.isSafeInteger(a.clean)&&a.clean>=0&&a.clean<=a.solves&&/^\d{4}-\d{2}-\d{2}$/.test(a.last))s.attempts[p.id]={solves:a.solves,clean:a.clean,review:!!a.review,last:a.last};}
 for(const [key,d] of Object.entries(value.days)){if(!/^\d{4}-\d{2}-\d{2}$/.test(key)||!d||!lessons.some(l=>l.id===d.lesson)||!Array.isArray(d.puzzles)||![3,5].includes(d.puzzles.length)||new Set(d.puzzles).size!==d.puzzles.length||!d.puzzles.every(id=>puzzles.some(p=>p.id===id))||!Array.isArray(d.solved))continue;const clean={lesson:d.lesson,puzzles:d.puzzles,solved:[...new Set(d.solved.filter(id=>d.puzzles.includes(id)))],learned:!!d.learned,complete:false};if(d.format===2){clean.format=2;clean.strategy=strategies.some(x=>x.id===d.strategy)?d.strategy:strategies[0].id;clean.studied=!!d.studied;clean.reflection=typeof d.reflection==='string'?d.reflection.trim().slice(0,600):'';}if(d.curriculum==='tactics-v1')clean.curriculum=d.curriculum;s.days[key]=clean;finish(clean);}
 if(value.game&&Array.isArray(value.game.moves)&&value.game.moves.length<2000&&value.game.moves.every(m=>typeof m==='string'&&m.length<16))s.game={moves:value.game.moves,level:value.game.level==='challenge'?'challenge':'gentle'};
 return s;
}
