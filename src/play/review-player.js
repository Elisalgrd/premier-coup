import { Engine } from "../chess/engine.js";
import { moveUci } from "../chess/notation.js";
import { PlayerBoard, gameAt } from "../ui/player-strip.js";
import { analyzePendingGame } from "./analysis-task.js";
import { hasPersonalAnalysis } from "../chess/game-profile.js";
import { buildReviewScript, reviewSceneGame } from "./review-script.js";
import { mountGameReport } from "./game-report.js";
import { RecordedCoach } from "./recorded-coach.js";
import { $, esc } from "../ui/helpers.js";

export function startReviewVideo(ctx, root, {id, ply} = {}) {
  const record = ctx.state.games.find(g => g.id === id);
  if (!record) {root.innerHTML='<p>Cette partie est introuvable.</p><a href="#train/import">Mes parties</a>';return;}
  let disposed=false, engine, board, audio, reportCleanup, scenes=[], index=0, branchIndex=0, timer, listening=false, voiceController;
  const controller=new AbortController();
  const stop=()=>{clearTimeout(timer);voiceController?.abort();audio?.stop();listening=false;};
  const clear=()=>{stop();board?.destroy();board=null;audio?.destroy();audio=null;reportCleanup?.();reportCleanup=null;};
  const overview=()=>{clear();reportCleanup=mountGameReport(ctx,root,record,openMoment);window.scrollTo(0,0);};
  const draw=()=>{
    clearTimeout(timer);
    const s=scenes[index], g=reviewSceneGame(record,s);
    const steps=s.branch || [];
    if (steps.length && branchIndex) for (let i=0;i<branchIndex;i++) moveUci(g,steps[i].move);
    const move=steps[branchIndex]?.move || s.move;
    const arrows=move ? [[move.slice(0,2),move.slice(2,4),s.kind==='reply'?'danger':'good']] : [];
    board.set(g,{arrows,marks:move?[move.slice(0,2)]:[],last:[]});
    if (move) timer=setTimeout(()=>{if(disposed)return;moveUci(g,move);board.animate(g,move,600,branchIndex === 0 ? {arrows:s.afterArrows || arrows,marks:s.afterMarks?.length ? s.afterMarks : [move.slice(2,4)]} : {arrows,marks:[move.slice(2,4)]});},350);
  };
  const update=()=>{
    const s=scenes[index], phase=index%4, branch=s.branch || [];
    $("#review-title",root).textContent=s.title;
    $("#review-position",root).textContent=s.context;
    $("#review-summary",root).textContent=branch[branchIndex]?.text || s.summary;
    $("#review-explanation",root).textContent=s.text;
    $("#review-choose",root).value=String(Math.floor(index/4));
    $("#review-next",root).textContent=["Voir sa réponse →","Comparer avec un autre coup →","Retenir le réflexe →",index+1<scenes.length?"Comprendre l’erreur suivante →":"Revenir à mon bilan →"][phase];
    $("#review-prev",root).disabled=index===0;
    $("#review-move",root).hidden=!s.move;
    $("#review-branch",root).hidden=branch.length<=1;
    $("#branch-prev",root).disabled=branchIndex===0;
    $("#branch-next",root).disabled=branchIndex+1>=branch.length;
    $("#branch-count",root).textContent=`Coup ${branchIndex+1} / ${branch.length} de cette suite`;
    $("#branch-outcome",root).textContent=branch.length>1 && branchIndex===branch.length-1 ? s.outcome+" Ce bilan porte uniquement sur la suite affichée." : "";
    $("#review-audio",root).hidden=phase!==3;
    $("#review-listen",root).textContent=listening?"■ Arrêter":"▶ Écouter le principe";
    for(const b of root.querySelectorAll('[data-phase]')) b.setAttribute('aria-current',String(Number(b.dataset.phase)===phase));
  };
  const show=()=>{update();draw();};
  const seek=n=>{stop();index=Math.max(0,Math.min(scenes.length-1,n));branchIndex=0;show();window.scrollTo(0,0);};
  const openMoment=selected=>{
    clear();index=Math.max(0,scenes.findIndex(s=>s.kind==='played'&&s.ply===Number(selected)));branchIndex=0;
    if(!scenes.length){overview();return;}
    root.innerHTML=`<section class="guided-review"><header class="guided-heading"><button id="review-report" class="text-link">← Mon bilan</button><label class="sr-only" for="review-choose">Choisir l’erreur à comprendre</label><select id="review-choose">${scenes.filter(s=>s.kind==='played').map((s,i)=>`<option value="${i}">Coup ${Math.ceil(s.ply/2)} · ${i+1} / ${scenes.length/4}</option>`).join('')}</select></header><h1 id="review-title"></h1><nav class="review-steps" aria-label="Étapes de l’explication">${['Ton choix','Sa réponse','Autre choix','À retenir'].map((t,i)=>`<button data-phase="${i}"><span>${i+1}</span>${t}</button>`).join('')}</nav><div class="guided-layout"><section class="guided-board"><p id="review-position"></p><div id="review-board"></div><button id="review-move" class="text-link" aria-label="Revoir le mouvement">↺</button><div id="review-branch" class="branch-controls"><button id="branch-prev" class="button secondary" aria-label="Coup précédent dans cette suite">←</button><span id="branch-count"></span><button id="branch-next" class="button secondary" aria-label="Coup suivant dans cette suite">→</button></div></section><section class="guided-explanation"><span class="eyebrow">CE QUI CHANGE DANS TA POSITION</span><h2 id="review-summary"></h2><p id="review-explanation" aria-live="polite"></p><p id="branch-outcome" class="branch-outcome"></p><div id="review-audio"><button id="review-listen" class="button secondary">▶ Écouter le principe</button><p id="review-audio-status" role="status"></p><small>Le principe général en audio ; les détails de ta position sont expliqués au-dessus.</small></div></section></div><div class="guided-actions"><button id="review-prev" class="button secondary" aria-label="Étape précédente">←</button><button id="review-next" class="button primary"></button></div><footer class="guided-footer"><a href="#train/correct/${esc(record.id)}">Essayer sans les flèches →</a></footer></section>`;
    board=new PlayerBoard($("#review-board",root),gameAt(record,scenes[index].basePly),{side:record.color,names:{[record.color]:"Toi",[record.color==='w'?'b':'w']:"Adversaire"}});
    audio=new RecordedCoach({onStatus:status=>{const el=$("#review-audio-status",root);if(el)el.textContent=status==='loading'?'Préparation de la voix…':status==='playing'?'Le coach explique le principe.':'';}});
    $("#review-report",root).onclick=overview;
    $("#review-prev",root).onclick=()=>seek(index-1);
    $("#review-next",root).onclick=()=>index+1===scenes.length?overview():seek(index+1);
    $("#review-choose",root).onchange=e=>seek(Number(e.target.value)*4);
    for(const b of root.querySelectorAll('[data-phase]')) b.onclick=()=>seek(Math.floor(index/4)*4+Number(b.dataset.phase));
    $("#review-move",root).onclick=draw;
    $("#branch-prev",root).onclick=()=>{branchIndex--;show();};
    $("#branch-next",root).onclick=()=>{branchIndex++;show();};
    $("#review-listen",root).onclick=async()=>{
      if(listening){stop();update();return;}
      listening=true;voiceController=new AbortController();const signal=voiceController.signal;update();
      const ok=await audio.play(scenes[index].voice,{signal});
      if(disposed||signal.aborted)return;listening=false;update();
      if(!ok)$("#review-audio-status",root).textContent="L’audio est indisponible. L’explication reste lisible.";
    };
    show();window.scrollTo(0,0);
  };
  const start=async()=>{
    if(!hasPersonalAnalysis(record)){
      root.innerHTML='<a class="back-link" href="#train/import">← Mes parties</a><h1>Je regarde ta partie entière.</h1><p>Je vérifie tes décisions, les réponses possibles et les occasions réussies. Ton ancien rapport reste enregistré pendant la préparation.</p><p id="review-analysis" role="status"></p><progress id="review-progress" max="1" value="0"></progress>';
      engine=new Engine();
      await analyzePendingGame(record,engine,{depth:12,state:ctx.state,save:ctx.save,signal:controller.signal,onProgress:(n,total)=>{
        if(disposed)return;$("#review-progress",root).max=total||1;$("#review-progress",root).value=n;$("#review-analysis",root).textContent=`${n} / ${total} de tes coups vérifiés.`;
      }});
      engine.close();engine=null;
    }
    if(disposed)return;scenes=buildReviewScript(record);if(Number(ply)&&scenes.length)openMoment(Number(ply));else overview();
  };
  start().catch(()=>{if(!disposed)root.innerHTML='<h1>La préparation a été interrompue.</h1><p>Ta partie et ton ancien rapport restent enregistrés.</p><a class="button primary" href="#train/import">Reprendre depuis Mes parties</a>';});
  const onHide=()=>{if(document.hidden){stop();if($("#review-next",root))update();}};
  document.addEventListener('visibilitychange',onHide);
  return()=>{disposed=true;controller.abort();engine?.close();clear();document.removeEventListener('visibilitychange',onHide);};
}
