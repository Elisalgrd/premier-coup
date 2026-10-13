import { mistakeRecapHtml, bindMistakeRecap } from "./mistake-recap.js";
import { Engine } from "../chess/engine.js";
import { moveUci } from "../chess/notation.js";
import { PlayerBoard, gameAt } from "../ui/player-strip.js";
import { analyzePendingGame } from "./analysis-task.js";
import { hasCompleteAnalysis } from "../chess/analysis.js";
import { buildReviewScript, reviewSceneGame } from "./review-script.js";
import { RecordedCoach } from "./recorded-coach.js";
import { waitReview } from "./review-speech.js";
import { $ } from "../ui/helpers.js";

export function startReviewVideo(ctx, root, { id, ply } = {}) {
  const record = ctx.state.games.find(g => g.id === id);
  if (!record) { root.innerHTML = '<p>Cette partie est introuvable.</p><a href="#train/import">Mes parties</a>'; return; }
  let disposed = false, engine, board, audio, scenes = [], index = 0, voiceController, animationTimer, autoplay = false, listening = false;
  const controller = new AbortController();
  const stop = () => { autoplay = listening = false; voiceController?.abort(); audio?.stop(); clearTimeout(animationTimer); };
  const finish = () => {
    stop(); board?.destroy();
    root.innerHTML = `<a href="#train/import" class="back-link">← Mes parties</a><h1>Tu as vu. Maintenant, essaie.</h1><p>Retrouver le bon coup sans la flèche, c’est ce qui permet de le reconnaître dans une prochaine partie.</p>${mistakeRecapHtml(record)}<a href="#train/essentials" class="button secondary">Ma fiche des essentiels 20/80</a>`;
    bindMistakeRecap(root, record);
  };
  const draw = (animate = true) => {
    clearTimeout(animationTimer);
    const scene = scenes[index], game = reviewSceneGame(record, scene);
    board.set(game, { arrows: scene.arrows, marks: scene.marks, last: [] });
    if (scene.move && animate) animationTimer = setTimeout(() => {
      if (disposed) return;
      moveUci(game, scene.move);
      board.animate(game, scene.move, 600, { arrows: scene.afterArrows, marks: scene.afterMarks });
    }, 350);
  };
  const update = () => {
    const scene = scenes[index], phase = index % 4;
    $("#review-title", root).textContent = scene.title;
    $("#review-position", root).textContent = scene.context;
    $("#review-summary", root).textContent = scene.summary;
    $("#review-explanation", root).textContent = scene.text;
    $("#review-choose", root).value = String(Math.floor(index / 4));
    $("#review-next", root).textContent = ["Voir la conséquence →", "Voir une meilleure idée →", "Garder le réflexe →", index + 1 < scenes.length ? "Comprendre l’erreur suivante →" : "À moi de retrouver les coups →"][phase];
    $("#review-prev", root).disabled = index === 0;
    $("#review-move", root).hidden = !scene.move;
    $("#review-listen", root).textContent = listening ? "■ Stop" : "▶ Écouter";
    $("#review-listen", root).setAttribute("aria-label", listening ? "Arrêter la voix" : "Écouter et voir cette explication");
    $("#review-auto", root).textContent = autoplay ? "Arrêter la lecture continue" : "Tout écouter en continu";
    for (const b of root.querySelectorAll("[data-phase]")) b.setAttribute("aria-current", String(Number(b.dataset.phase) === phase));
  };
  const show = () => { update(); draw(); };
  const seek = n => { stop(); index = Math.max(0, Math.min(scenes.length - 1, n)); $("#review-audio-status", root).textContent = ""; show(); window.scrollTo(0, 0); };
  const listen = async (continuous = false) => {
    stop(); autoplay = continuous; listening = true;
    voiceController = new AbortController(); const signal = voiceController.signal;
    do {
      update(); draw(false);
      const ok = await audio.play(scenes[index].voice, { signal, onStart: () => draw(true) });
      if (signal.aborted || disposed) return;
      if (!ok) {
        draw(); autoplay = listening = false; update();
        $("#review-audio-status", root).textContent = "L’audio n’a pas pu démarrer. Réessaie avec une connexion ; l’explication reste lisible ici.";
        return;
      }
      if (!autoplay) break;
      await waitReview(2200, signal);
      if (signal.aborted || disposed) return;
      if (index + 1 === scenes.length) { finish(); return; }
      index++; update();
    } while (autoplay);
    listening = false; update();
  };
  const start = async () => {
    if (!hasCompleteAnalysis(record)) {
      root.innerHTML = '<a class="back-link" href="#train/import">← Mes parties</a><h1>Je prépare tes explications.</h1><p role="status" id="review-analysis">Recherche des moments à comprendre sur cet appareil…</p><progress id="review-progress" max="1" value="0"></progress>';
      engine = new Engine();
      await analyzePendingGame(record, engine, { depth: 12, state: ctx.state, save: ctx.save, signal: controller.signal, onProgress: (n, total) => {
        if (disposed) return; $("#review-progress", root).max = total || 1; $("#review-progress", root).value = n; $("#review-analysis", root).textContent = `${n} / ${total} coups vérifiés. Ta revue arrive ensuite.`;
      }});
      engine.close(); engine = null;
    }
    if (disposed) return;
    scenes = buildReviewScript(record, Number(ply) || null);
    if (!scenes.length) { finish(); return; }
    root.innerHTML = `<section class="guided-review"><header class="guided-heading"><a href="#train/import">← Mes parties</a><label class="sr-only" for="review-choose">Choisir l’erreur à comprendre</label><select id="review-choose">${scenes.filter(s => s.kind === "played").map((s,i) => `<option value="${i}">Erreur ${i+1} / ${scenes.length / 4} · coup ${Math.ceil(s.ply/2)}</option>`).join("")}</select></header><h1 id="review-title"></h1><nav class="review-steps" aria-label="Étapes de l’explication">${["Ton coup", "Conséquence", "À la place", "Réflexe"].map((label,i) => `<button data-phase="${i}"><span>${i+1}</span>${label}</button>`).join("")}</nav><div class="guided-layout"><section class="guided-board"><p id="review-position"></p><div id="review-board"></div><button id="review-move" class="text-link">↺ Revoir le mouvement</button></section><section class="guided-explanation"><span class="eyebrow">COMPRENDRE CE QUI CHANGE</span><h2 id="review-summary"></h2><p id="review-explanation" aria-live="polite"></p><button id="review-listen" class="button secondary">▶ Écouter et voir</button><p id="review-audio-status" role="status"></p><small>Voix masculine · tu passes à la suite quand tu es prête.</small></section></div><div class="guided-actions"><button id="review-prev" class="button secondary" aria-label="Étape précédente">←</button><button id="review-next" class="button primary"></button></div><footer class="guided-footer"><button id="review-auto" class="text-link">Tout écouter en continu</button><a href="#train/essentials">Fiche 20/80 ↗</a></footer></section>`;
    board = new PlayerBoard($("#review-board", root), gameAt(record, scenes[0].basePly), { side: record.color, names: { [record.color]: "Toi", [record.color === "w" ? "b" : "w"]: "Adversaire" } });
    audio = new RecordedCoach({ onStatus: status => {
      const el = $("#review-audio-status", root); if (!el) return;
      el.textContent = status === "loading" ? "Préparation de la voix…" : status === "playing" ? "Le coach explique cette étape." : "";
    }});
    $("#review-move", root).textContent = "↺";
    $("#review-move", root).setAttribute("aria-label", "Revoir le mouvement");
    $("#review-move", root).title = "Revoir le mouvement";
    $("#review-prev", root).onclick = () => seek(index - 1);
    $("#review-next", root).onclick = () => { if (index + 1 === scenes.length) finish(); else seek(index + 1); };
    $("#review-choose", root).onchange = e => seek(Number(e.target.value) * 4);
    for (const b of root.querySelectorAll("[data-phase]")) b.onclick = () => seek(Math.floor(index / 4) * 4 + Number(b.dataset.phase));
    $("#review-move", root).onclick = () => { stop(); update(); draw(); };
    $("#review-listen", root).onclick = () => { if (listening) { stop(); update(); } else listen(); };
    $("#review-auto", root).onclick = () => { if (autoplay) { stop(); update(); } else listen(true); };
    show();
  };
  start().catch(() => { if (!disposed) root.innerHTML = '<h1>La préparation a été interrompue.</h1><p>Ta partie reste enregistrée.</p><a class="button primary" href="#train/import">Reprendre depuis Mes parties</a>'; });
  const onHide = () => { if (document.hidden) { stop(); if ($("#review-next", root)) update(); } };
  document.addEventListener("visibilitychange", onHide);
  return () => { disposed = true; stop(); controller.abort(); engine?.close(); audio?.destroy(); board?.destroy(); document.removeEventListener("visibilitychange", onHide); };
}
