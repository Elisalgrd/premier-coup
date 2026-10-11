import {validateObservation} from './observation.js?v=16';
import {validateCoach} from './coach.js?v=16';
import {validNarrator} from './narrator.js?v=16';
import {validateLibrary} from './lesson-library.js?v=16';
import {validateAdaptive} from './adaptive.js?v=16';
import {validateDrill} from './drills.js?v=16';
import {validateAcademy} from './academy.js?v=16';
import {lessons,puzzles} from './content.js?v=16';
import {strategies} from './advanced.js';
export const trainingLessons=['scan','candidates','fork','pin','opening','italian-plan','black-plan','mate','convert','improve','endgame','review-game'].map(id=>lessons.find(l=>l.id===id));
const tacticIds=['fork','backrank','remove','fork-finish','pawn-fork','skewer','queen-mate','exchange-chain','ladder','scholar','ladder-two','safe-capture','pinned-defender','fork-transfer','backrank-transfer','avoid-stalemate','italian-center','defend-f7','open-file'];
function nextLesson(state,today){return (trainingLessons.find(l=>!state.lessons.includes(l.id))||trainingLessons[new Date(today+'T12:00:00').getDate()%trainingLessons.length]).id;}
function tacticPool(state,today){const learned=trainingLessons.filter(l=>state.lessons.includes(l.id)).length;return tacticIds.map(id=>puzzles.find(p=>p.id===id)).filter(p=>p.level<3||learned>=6).sort((a,b)=>{const aa=state.attempts[a.id],bb=state.attempts[b.id];const priority=x=>isDue(x,today)?0:!x?1:2;return priority(aa)-priority(bb)||(aa?.last||'').localeCompare(bb?.last||'')||tacticIds.indexOf(a.id)-tacticIds.indexOf(b.id);});}
export const fresh=()=>({version:1,narrator:'male',lessons:[],attempts:{},days:{},goal:20,game:null});
export function dayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function offsetDay(key,n){const d=new Date(key+'T12:00:00');d.setDate(d.getDate()+n);return dayKey(d);}
export function streak(state,today=dayKey()){let key=state.days[today]?.complete?today:offsetDay(today,-1),n=0;while(state.days[key]?.complete){n++;key=offsetDay(key,-1);}return n;}
export function plan(state,today=dayKey()){
 if(!state.days[today])state.days[today]={lesson:nextLesson(state,today),puzzles:tacticPool(state,today).slice(0,5).map(p=>p.id),solved:[],learned:false,complete:false,format:2,strategy:strategies[Object.values(state.days).filter(d=>d.complete).length%strategies.length].id,studied:false,reflection:'',curriculum:'tactics-v1'};
 const d=state.days[today];
 if(!d.complete&&d.curriculum!=='tactics-v1'){
  if(!d.learned)d.lesson=nextLesson(state,today);
  const kept=d.puzzles.filter(id=>d.solved.includes(id));
  const remaining=tacticPool(state,today).map(p=>p.id).filter(id=>!kept.includes(id));
  d.puzzles=[...kept,...remaining].slice(0,5);
  d.format=2;d.strategy=d.strategy||strategies[0].id;d.studied=!!d.studied;d.reflection=d.reflection||'';d.curriculum='tactics-v1';
 }
 return state.days[today];
}
export function isDue(a,today=dayKey()){return !!a&&(a.review||!!a.due&&a.due<=today);}
export function recordDifficulty(state,id,today=dayKey()){
 const a=state.attempts[id]||{solves:0,clean:0};
 state.attempts[id]={...a,failures:(a.failures||0)+1,box:0,review:true,last:today,due:offsetDay(today,1),troubledOn:today};
}
export function recordPuzzle(state,id,assisted=false,today=dayKey()){
 const a=state.attempts[id]||{solves:0,clean:0,box:0,failures:0};
 let box=a.box||0,lastCleanDay=a.lastCleanDay||null,due=a.due;
 if(assisted){box=0;due=offsetDay(today,1);}
 else if(lastCleanDay!==today&&a.troubledOn!==today){box=Math.min(4,box+1);lastCleanDay=today;due=offsetDay(today,[1,1,3,7,14][box]);}
 else if(!due)due=offsetDay(today,1);
 state.attempts[id]={...a,solves:a.solves+1,clean:a.clean+(assisted?0:1),box,failures:a.failures||0,...(lastCleanDay?{lastCleanDay}:{}),due,review:assisted,last:today,...(assisted?{troubledOn:today}:{})};
 const d=plan(state,today);if(d.puzzles.includes(id)&&!d.solved.includes(id))d.solved.push(id);finish(d);
}
export function recordLesson(state,id,today=dayKey()){if(!state.lessons.includes(id))state.lessons.push(id);const d=plan(state,today);if(d.lesson===id)d.learned=true;finish(d);}
export function recordStudy(state,id,today=dayKey()){const d=plan(state,today);if(d.strategy===id)d.studied=true;finish(d);}
export function recordReflection(state,text,today=dayKey()){const d=plan(state,today);d.reflection=String(text).trim().slice(0,600);finish(d);}
function finish(d){d.complete=d.learned&&d.puzzles.every(id=>d.solved.includes(id))&&(!d.format||(d.studied&&d.reflection.length>=10));}
export function validateSave(value){
 if(!value||value.version!==1||!Array.isArray(value.lessons)||!value.attempts||!value.days||typeof value.attempts!=='object'||typeof value.days!=='object')throw Error('Format de sauvegarde non reconnu.');
 const s=fresh();if(value.observation)s.observation=validateObservation(value.observation);s.narrator=validNarrator(value.narrator);if(value.coach)s.coach=validateCoach(value.coach);if(value.library)s.library=validateLibrary(value.library);if(value.adaptive)s.adaptive=validateAdaptive(value.adaptive);if(value.drill){const drill=validateDrill(value.drill);if(drill)s.drill=drill;}if(value.academy)s.academy=validateAcademy(value.academy);s.lessons=[...new Set(value.lessons.filter(id=>lessons.some(l=>l.id===id)))];
 for(const p of puzzles){const a=value.attempts[p.id];if(a&&Number.isSafeInteger(a.solves)&&a.solves>=0&&a.solves<=1e7&&Number.isSafeInteger(a.clean)&&a.clean>=0&&a.clean<=a.solves&&/^\d{4}-\d{2}-\d{2}$/.test(a.last)){const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x);s.attempts[p.id]={solves:a.solves,clean:a.clean,review:!!a.review,last:a.last,box:Number.isInteger(a.box)&&a.box>=0&&a.box<=4?a.box:0,failures:Number.isSafeInteger(a.failures)&&a.failures>=0?a.failures:0};for(const key of ['due','lastCleanDay','troubledOn'])if(date(a[key]))s.attempts[p.id][key]=a[key];}}
 for(const [key,d] of Object.entries(value.days)){if(!/^\d{4}-\d{2}-\d{2}$/.test(key)||!d||!lessons.some(l=>l.id===d.lesson)||!Array.isArray(d.puzzles)||![3,5].includes(d.puzzles.length)||new Set(d.puzzles).size!==d.puzzles.length||!d.puzzles.every(id=>puzzles.some(p=>p.id===id))||!Array.isArray(d.solved))continue;const clean={lesson:d.lesson,puzzles:d.puzzles,solved:[...new Set(d.solved.filter(id=>d.puzzles.includes(id)))],learned:!!d.learned,complete:false};if(d.format===2){clean.format=2;clean.strategy=strategies.some(x=>x.id===d.strategy)?d.strategy:strategies[0].id;clean.studied=!!d.studied;clean.reflection=typeof d.reflection==='string'?d.reflection.trim().slice(0,600):'';}if(d.curriculum==='tactics-v1')clean.curriculum=d.curriculum;s.days[key]=clean;finish(clean);}
 if(value.game&&Array.isArray(value.game.moves)&&value.game.moves.length<2000&&value.game.moves.every(m=>typeof m==='string'&&m.length<16))s.game={moves:value.game.moves,level:value.game.level==='challenge'?'challenge':'gentle'};
 return s;
}
