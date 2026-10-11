import {adaptation,difficulty,levelNames} from './adaptive.js?v=16';
import {puzzles} from './content.js?v=16';
import {essentialSkills,skillTheme} from './essential-skills.js?v=16';
export const drillThemes={mix:{title:'Les essentiels',ids:['safe-capture','capture-new','fork-finish','fork-transfer','pinned-defender','pin-new','backrank','backrank-transfer','queen-mate','queen-mate-new','ladder','defense-guided','defense-new','pawn-fork','skewer','scholar','exchange-chain','ladder-two']},material:{title:'Gagner du matériel',ids:['safe-capture','capture-new','fork-finish','fork-transfer','pinned-defender','pin-new','pawn-fork','skewer','exchange-chain']},mate:{title:'Trouver le mat',ids:['backrank','backrank-transfer','queen-mate','queen-mate-new','ladder','scholar','ladder-two']},defense:{title:'Répondre aux menaces',ids:['defense-guided','defense-new','defend-f7','remove','escape','safe-capture']}};

for(const id of ['rook-queen','bishop-rook','knight-queen','pawn-capture','queen-rook','fork'])for(const theme of ['mix','material'])if(!drillThemes[theme].ids.includes(id))drillThemes[theme].ids.push(id);
for(const skill of essentialSkills)drillThemes[skillTheme(skill.id)]={title:skill.short,skill:skill.id,ids:[...skill.bases]};
for(const p of puzzles)if(p.id.startsWith('essential-')){drillThemes.mix.ids.push(p.id);drillThemes[p.mate?'mate':'material'].ids.push(p.id);}
for(const p of puzzles)if(p.variantOf)for(const t of Object.values(drillThemes))if(t.ids.includes(p.variantOf))t.ids.push(p.id);
export function focusLevel(state,theme){
 const pool=drillThemes[theme].ids.map(id=>puzzles.find(p=>p.id===id));
 let level=Math.min(...pool.map(difficulty));
 while(level<3&&pool.filter(p=>difficulty(p)===level&&state.attempts[p.id]?.clean>0&&!state.attempts[p.id]?.review).length>=4)level++;
 return level;
}
export function createDrill(state,theme='mix',today=new Date().toLocaleDateString('en-CA')){
 const selected=drillThemes[theme]||drillThemes.mix,level=selected.skill?focusLevel(state,theme):adaptation(state).level;
 const byId=id=>puzzles.find(p=>p.id===id),rank=z=>z?.review?0:z?.due&&z.due<=today?1:!z?2:3;
 const sorted=[...selected.ids].filter(id=>difficulty(byId(id))<=level||state.attempts[id]?.review).sort((a,b)=>{
  const x=state.attempts[a],y=state.attempts[b];return rank(x)-rank(y)||(x?.last||'').localeCompare(y?.last||'')||(x?.solves||0)-(y?.solves||0)||Math.abs(difficulty(byId(a))-level)-Math.abs(difficulty(byId(b))-level);
 });
 // Prefer distinct compositions within each priority bucket, then use their variants.
 const diverse=[];
 for(const priority of [0,1,2,3]){const bucket=sorted.filter(id=>rank(state.attempts[id])===priority),families=new Set(),rest=[];for(const id of bucket){const key=byId(id).variantOf||id;if(families.has(key))rest.push(id);else{families.add(key);diverse.push(id);}}diverse.push(...rest);}
 const ids=(selected.skill?diverse:sorted).slice(0,5);
 return {theme:drillThemes[theme]?theme:'mix',ids,index:0,results:[],date:today};
}
export function recordDrill(session,id,assisted){if(!session||session.ids[session.index]!==id)return false;session.results.push({id,assisted:!!assisted});session.index++;delete session.pendingAssisted;return true;}
export function validateDrill(d){if(!d||!drillThemes[d.theme]||!Array.isArray(d.ids)||d.ids.length!==5||new Set(d.ids).size!==5||!d.ids.every(id=>drillThemes[d.theme].ids.includes(id)&&puzzles.some(p=>p.id===id))||!Number.isInteger(d.index)||d.index<0||d.index>5||!Array.isArray(d.results)||d.results.length!==d.index||!d.results.every((r,i)=>r?.id===d.ids[i]))return null;return {...(/^\d{4}-\d{2}-\d{2}$/.test(d.date)?{date:d.date}:{}),theme:d.theme,ids:[...d.ids],index:d.index,results:d.results.map(r=>({id:r.id,assisted:!!r.assisted})),...(d.pendingAssisted?{pendingAssisted:true}:{})};}
export function renderDrills(state){const level=adaptation(state),d=state.drill,ongoing=d&&d.index<d.ids.length,done=d&&d.index===d.ids.length,skill=d&&drillThemes[d.theme]?.skill;return `<div class="home-intro compact-intro"><h1>Les problèmes</h1><p>Une explication, une position, un coup à trouver.</p></div><section class="today-focus"><span class="lesson-number">${ongoing?'SÉRIE EN COURS':'ENTRAÎNEMENT ADAPTÉ'}</span><h2>${ongoing?'Problème '+(d.index+1)+' sur 5':'5 problèmes à ton niveau'}</h2><p>${skill?`Série ciblée : ${drillThemes[d.theme].title}.`:'Tu joues quelques coups seulement.'} La difficulté s’adapte à tes résultats.</p><button class="btn full" data-action="${ongoing?'drill-resume':'drill-start'}" data-value="mix">${ongoing?'Reprendre ma série':'Commencer les 5 problèmes'} →</button><small class="quiet-note">La leçon vient toujours avant le problème.</small></section>${done?`<section class="habit-card series-result"><h3>Dernière série : ${d.results.filter(r=>!r.assisted).length} / 5 sans aide</h3>${d.results.some(r=>r.assisted)?'<button class="textlink" data-action="review">Revoir mes erreurs →</button>':'<p>Les cinq positions sont réussies sans aide.</p>'}</section>`:''}${skill?`<button class="textlink" data-action="essential-open" data-value="${skill}">Revoir cette idée et ses exemples →</button>`:''}${!ongoing?`<details class="reference"><summary>Choisir un thème précis</summary><div class="drill-grid">${Object.entries(drillThemes).filter(([id])=>id!=='mix').map(([id,t])=>`<button class="course-row" data-action="drill-start" data-value="${id}"><span><h3>${t.title}</h3><p>5 problèmes</p></span><span>→</span></button>`).join('')}</div></details>`:''}<details class="reference"><summary>Mon niveau : ${levelNames[level.level]}</summary><p>Palier ${level.level} / 3. Sur 8 positions différentes : 7 réussites sans aide font monter la difficulté ; 3 ou moins la font redescendre.</p><p>${level.block.length} / 8 positions évaluées. Ce n’est pas un classement Elo.</p>${level.notice?`<p>${level.notice}</p>`:''}</details>`;}
