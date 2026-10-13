import { mistakeRecapHtml, bindMistakeRecap } from "./mistake-recap.js";
import { Engine } from "../chess/engine.js";
import { moveUci } from "../chess/notation.js";
import { PlayerBoard, gameAt } from "../ui/player-strip.js";
import { analyzePendingGame } from "./analysis-task.js";
import { hasCompleteAnalysis } from "../chess/analysis.js";
import { buildReviewScript, reviewSceneGame } from "./review-script.js";
import { ReviewTimeline } from "./review-timeline.js";
import { primeReviewSpeech } from "./review-speech.js";
import { esc, $ } from "../ui/helpers.js";

export function startReviewVideo(ctx, root, { id, ply } = {}) {
  const record = ctx.state.games.find(g => g.id === id);
  if (!record) { root.innerHTML = '<p>Cette partie est introuvable.</p><a href="#train/import">Mes parties</a>'; return; }
  let disposed = false, engine, board, timeline;
  const controller = new AbortController();
  const finish = () => {
    board?.destroy();
    root.innerHTML = `<a href="#train/import" class="back-link">← Mes parties</a><h1>Comprendre, puis retrouver.</h1>${mistakeRecapHtml(record)}`;
    bindMistakeRecap(root, record);
  };
  const start = async () => {
    if (!hasCompleteAnalysis(record)) {
      root.innerHTML = '<a class="back-link" href="#train/import">← Mes parties</a><h1>Préparation de ta revue.</h1><p role="status" id="video-analysis">Le moteur recherche tes erreurs sur cet appareil…</p><progress id="video-progress" max="1" value="0"></progress>';
      engine = new Engine();
      await analyzePendingGame(record, engine, { depth: 12, state: ctx.state, save: ctx.save, signal: controller.signal, onProgress: (n, total) => {
        if (disposed) return; $("#video-progress", root).max = total || 1; $("#video-progress", root).value = n; $("#video-analysis", root).textContent = `${n} / ${total} coups analysés. La revue commence ensuite.`;
      }});
      engine.close(); engine = null;
    }
    if (disposed) return;
    const scenes = buildReviewScript(record, Number(ply) || null), chapters = scenes.map((s, i) => ({ ...s, index: i })).filter(s => s.kind === "before");
    root.innerHTML = `<section class="review-video"><header><a class="back-link" href="#train/import">← Mes parties</a><span id="review-chapter">Ta revue commentée</span></header><div class="review-stage"><div id="video-board"></div><div class="review-caption"><span class="eyebrow" id="video-kind"></span><p id="video-subtitle" aria-live="off"></p></div></div><div class="review-controls"><div class="review-chapters" aria-label="Chapitres de la revue">${chapters.map((s,i) => `<button data-chapter="${s.index}" aria-label="Erreur ${i+1}, coup ${Math.ceil(s.ply/2)}">${i+1}</button>`).join("")}</div><div class="review-transport"><button id="video-prev" aria-label="Erreur précédente">⏮</button><button id="video-play" class="button primary">Pause</button><button id="video-next" aria-label="Erreur suivante">⏭</button><button id="video-replay" aria-label="Rejouer cette scène">↺</button><label>Vitesse<select id="video-speed"><option value="1">1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option></select></label></div><button id="video-skip" class="text-link">Passer l’avance rapide</button></div></section>`;
    board = new PlayerBoard($("#video-board", root), gameAt(record, 0), { side: record.color, names: { w: record.headers.White, b: record.headers.Black } });
    const labels = { intro: "Ta partie, expliquée", fast: "Avance rapide", before: "Avant ton coup", played: "Ton coup", reply: "Le danger", best: "Une meilleure idée", line: "La suite", takeaway: "À retenir", outro: "Ta prochaine partie" };
    timeline = new ReviewTimeline(scenes, {
      preferences: ctx.state.preferences,
      onPause: () => board?.root.getAnimations?.({ subtree: true }).forEach(a => a.pause()),
      show: (scene, speed) => {
        const g = reviewSceneGame(record, scene);
        board.set(g, { arrows: [], last: [], marks: [] });
        if (scene.move) { moveUci(g, scene.move); board.animate(g, scene.move, 500 / speed, { arrows: scene.arrows }); }
        $("#video-subtitle", root).textContent = scene.text || "La partie avance jusqu’à ta prochaine erreur…";
        $("#video-kind", root).textContent = labels[scene.kind];
        $("#review-chapter", root).textContent = scene.ply ? `Coup ${Math.ceil(scene.ply / 2)}` : "Ta revue commentée";
      },
      onChange: t => {
        if (!$("#video-play", root)) return;
        $("#video-play", root).textContent = t.running ? "Pause" : "▶ Lecture";
        for (const b of root.querySelectorAll("[data-chapter]")) b.setAttribute("aria-current", String(scenes[t.index]?.ply === scenes[Number(b.dataset.chapter)].ply));
      }, onDone: finish,
    });
    $("#video-play", root).onclick = () => { if (timeline.running) timeline.pause(); else { primeReviewSpeech(ctx.state.preferences); timeline.play(); } };
    $("#video-prev", root).onclick = () => timeline.seek([...chapters].reverse().find(s => s.index < timeline.index && s.ply !== scenes[timeline.index]?.ply)?.index ?? chapters[0]?.index ?? 0);
    const next = () => { const chapter = chapters.find(s => s.index > timeline.index && s.ply !== scenes[timeline.index]?.ply); timeline.seek(chapter?.index ?? scenes.length - 1); };
    $("#video-next", root).onclick = next; $("#video-skip", root).onclick = next;
    $("#video-replay", root).onclick = () => timeline.seek(timeline.index);
    $("#video-speed", root).onchange = e => timeline.changeSpeed(Number(e.target.value));
    for (const b of root.querySelectorAll("[data-chapter]")) b.onclick = () => timeline.seek(Number(b.dataset.chapter));
    timeline.play();
  };
  start().catch(() => { if (!disposed) root.innerHTML = `<h1>La préparation a été interrompue.</h1><p>Ta partie reste enregistrée.</p><a class="button primary" href="#train/import">Reprendre depuis Mes parties</a>`; });
  return () => { disposed = true; controller.abort(); engine?.close(); timeline?.destroy(); board?.destroy(); };
}
