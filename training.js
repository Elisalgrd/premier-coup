import {lessons,puzzles} from './content.js';
import {strategies} from './advanced.js';
export const fresh=()=>({version:1,lessons:[],attempts:{},days:{},goal:20,game:null});
export function dayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function offsetDay(key,n){const d=new Date(key+'T12:00:00');d.setDate(d.getDate()+n);return dayKey(d);}
export function streak(state,today=dayKey()){let key=state.days[today]?.complete?today:offsetDay(today,-1),n=0;while(state.days[key]?.complete){n++;key=offsetDay(key,-1);}return n;}
export function plan(state,today=dayKey()){
 if(!state.days[today]){const level=state.lessons.length<3?1:state.lessons.length<8?2:3;
 const pool=puzzles.filter(p=>p.level<=level).sort((a,b)=>{const aa=state.attempts[a.id],bb=state.attempts[b.id];const score=x=>!x?1:x.review?0:2;return score(aa)-score(bb)||(aa?.last||'').localeCompare(bb?.last||'')||puzzles.indexOf(a)-puzzles.indexOf(b);});
 state.days[today]={lesson:(lessons.find(l=>!state.lessons.includes(l.id))||lessons[new Date(today+'T12:00:00').getDate()%lessons.length]).id,puzzles:pool.slice(0,5).map(p=>p.id),solved:[],learned:false,complete:false,format:2,strategy:strategies[Object.values(state.days).filter(d=>d.complete).length%strategies.length].id,studied:false,reflection:''};}
 const d=state.days[today];
 if(!d.format&&!d.complete){d.format=2;d.strategy=strategies[0].id;d.studied=false;d.reflection='';for(const p of puzzles.filter(p=>p.level===1))if(d.puzzles.length<5&&!d.puzzles.includes(p.id))d.puzzles.push(p.id);}
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
 for(const [key,d] of Object.entries(value.days)){if(!/^\d{4}-\d{2}-\d{2}$/.test(key)||!d||!lessons.some(l=>l.id===d.lesson)||!Array.isArray(d.puzzles)||![3,5].includes(d.puzzles.length)||new Set(d.puzzles).size!==d.puzzles.length||!d.puzzles.every(id=>puzzles.some(p=>p.id===id))||!Array.isArray(d.solved))continue;const clean={lesson:d.lesson,puzzles:d.puzzles,solved:[...new Set(d.solved.filter(id=>d.puzzles.includes(id)))],learned:!!d.learned,complete:false};if(d.format===2){clean.format=2;clean.strategy=strategies.some(x=>x.id===d.strategy)?d.strategy:strategies[0].id;clean.studied=!!d.studied;clean.reflection=typeof d.reflection==='string'?d.reflection.trim().slice(0,600):'';}s.days[key]=clean;finish(clean);}
 if(value.game&&Array.isArray(value.game.moves)&&value.game.moves.length<2000&&value.game.moves.every(m=>typeof m==='string'&&m.length<16))s.game={moves:value.game.moves,level:value.game.level==='challenge'?'challenge':'gentle'};
 return s;
}
