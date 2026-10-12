import {mediaLessons} from './media-library.js?v=18';
import {maleMediaLessons} from './media-male-library.js?v=18';

export const validNarrator=value=>value==='female'?'female':'male';
export const narratorFor=state=>validNarrator(state.narrator);
export const narrationFor=(id,voice)=> (validNarrator(voice)==='male'?maleMediaLessons:mediaLessons).find(c=>c.id===id);
export const mediaBase=(id,voice)=>`./${validNarrator(voice)==='male'?'media-male-neural':'media'}/${id}`;
export function narratorPicker(state,id){
 return `<label class="narrator-choice" for="${id}"><span>Voix du coach</span><select id="${id}"><option value="male" ${narratorFor(state)==='male'?'selected':''}>Homme · français</option><option value="female" ${narratorFor(state)==='female'?'selected':''}>Femme · français</option></select></label>`;
}
// Saved positions keep the original timeline, so switching narrators also works
// with existing backups and does not jump to a different explanation.
export function narrationPosition(position,from,to){
 if(!Number.isFinite(position)||position<=0)return 0;
 if(position>=from.duration)return to.duration;
 const index=from.chapters.findIndex(ch=>position<ch.end);
 const a=from.chapters[Math.max(0,index)],b=to.chapters[Math.max(0,index)];
 const progress=Math.max(0,Math.min(1,(position-a.start)/(a.end-a.start)));
 return Math.min(to.duration,b.start+progress*(b.end-b.start));
}
