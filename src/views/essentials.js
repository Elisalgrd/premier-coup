import { essentials, routine } from "../learn/essentials.js";
import { Chess } from "../chess/chess.js";
import { Board } from "../chess/board.js";
import { moveUci } from "../chess/notation.js";
import { RecordedCoach } from "../play/recorded-coach.js";
import { esc, $ } from "../ui/helpers.js";

export const essentialsLink = () => '<a class="essentials-invite" href="#train/essentials"><span class="essentials-number">20/80</span><span><strong>Les réflexes qui changent tes parties</strong><small>Quoi regarder, dans quel ordre, et pourquoi.</small></span><span aria-hidden="true">→</span></a>';

export function startEssentials(ctx, root) {
  let board, audio, active = null, step = 0, timer, controller;
  root.innerHTML = `<section class="essentials-page"><a class="back-link" href="#today">← Aujourd’hui</a><header class="page-intro"><span class="eyebrow">TA FICHE À GARDER SOUS LA MAIN</span><h1>Les essentiels<br><em>20/80.</em></h1><p>Les habitudes à travailler en priorité pour mieux jouer. Commence par ne plus donner de pièces, puis apprends à saisir celles qu’on te laisse.</p></header><section class="thinking-routine"><span class="eyebrow">AVANT CHAQUE COUP · DANS CET ORDRE</span><h2>Danger → occasion → idée → vérification</h2><ol>${routine.map((r,i) => `<li><span>${i+1}</span><div><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></div></li>`).join("")}</ol><p class="routine-reminder">Si ton roi est attaqué, le sauver est obligatoire. Sinon, garde cet ordre : ne te précipite pas sur ta propre attaque.</p></section><div class="section-title"><h2>7 principes, avec le pourquoi</h2></div><p>Ouvre un principe pour voir un exemple, coup par coup, avec le coach.</p><div class="essential-principles">${essentials.map((e,i) => `<details data-essential="${e.id}"><summary><span class="principle-number">0${i+1}</span><strong>${esc(e.title)}</strong><span class="principle-open" aria-hidden="true">+</span></summary><div class="principle-body"><p>${esc(e.why)}</p><blockquote>${esc(e.rule)}</blockquote><p class="principle-nuance">${esc(e.nuance)}</p><section class="essential-example" data-example="${e.id}"></section><a class="text-link" href="#lesson/${esc(e.lesson)}">Approfondir dans le cours →</a></div></details>`).join("")}</div><section class="essential-practice"><h2>Ton entraînement de 20 minutes</h2><p><strong>5 minutes</strong> pour comprendre une idée avec l’échiquier.<br><strong>10 minutes</strong> pour la retrouver dans des problèmes.<br><strong>5 minutes</strong> pour refaire une erreur, sans la solution.</p><p>Quand tu joues une partie, choisis plutôt 15 minutes avec 10 secondes ajoutées à chaque coup. Tu as besoin de temps pour appliquer ta routine.</p><a href="#session" class="button primary">Faire ma séance du jour →</a></section><div class="essentials-tools"><a href="#train/puzzles" class="text-link">Résoudre des problèmes →</a></div></section>`;
  const stop = () => { clearTimeout(timer); controller?.abort(); audio?.stop(); };
  const draw = (animate = true) => {
    clearTimeout(timer);
    const e = active, s = e.steps[step], g = new Chess(e.fen);
    for (const prior of e.steps.slice(0, step)) if (prior.move) moveUci(g, prior.move);
    const moveArrow = s.move ? [[s.move.slice(0,2),s.move.slice(2,4),s.color || "good"]] : [];
    board.set(g.fen(), { marks: s.marks || [], arrows: s.move ? moveArrow : s.arrows || [], last: [] });
    if (s.move && animate) timer = setTimeout(() => { moveUci(g,s.move); board.animate(g.fen(),s.move,600,{ marks:s.marks || [], arrows:s.arrows || moveArrow }); },350);
  };
  const show = () => {
    $("#essential-explanation",root).textContent = active.steps[step].text;
    $("#essential-counter",root).textContent = `Exemple · étape ${step+1} / ${active.steps.length}`;
    $("#essential-prev",root).disabled = step === 0;
    $("#essential-next",root).textContent = step === active.steps.length - 1 ? "Revoir depuis le début ↺" : "Voir la suite →";
    $("#essential-listen",root).textContent = "▶ Écouter et voir";
    $("#essential-audio-status",root).textContent = "";
    draw();
  };
  audio = new RecordedCoach();
  for (const detail of root.querySelectorAll("[data-essential]")) detail.ontoggle = () => {
    if (!detail.open) { if (active?.id === detail.dataset.essential) { stop(); board?.destroy(); active = null; } return; }
    stop(); board?.destroy();
    active = essentials.find(e => e.id === detail.dataset.essential); step = 0;
    for (const other of root.querySelectorAll("[data-essential]")) if (other !== detail) { other.open = false; other.querySelector("[data-example]").innerHTML = ""; }
    const host = detail.querySelector("[data-example]");
    host.innerHTML = '<span id="essential-counter" class="eyebrow"></span><div class="essential-demo"><div id="essential-board"></div><div><p id="essential-explanation" aria-live="polite"></p><button id="essential-listen" class="button secondary">▶ Écouter et voir</button><p id="essential-audio-status" role="status"></p></div></div><div class="essential-demo-actions"><button id="essential-prev" class="button secondary" aria-label="Étape précédente">←</button><button id="essential-next" class="button primary">Voir la suite →</button></div>';
    board = new Board($("#essential-board",root),{fen:active.fen,interactive:false});
    $("#essential-next",root).onclick = () => { stop(); step = (step + 1) % active.steps.length; show(); host.scrollIntoView({block:"start"}); };
    $("#essential-prev",root).onclick = () => { stop(); step = Math.max(0,step-1); show(); host.scrollIntoView({block:"start"}); };
    $("#essential-listen",root).onclick = async () => {
      if (controller && !controller.signal.aborted) { stop(); controller = null; $("#essential-listen",root).textContent = "▶ Écouter et voir"; return; }
      controller = new AbortController(); const signal = controller.signal;
      $("#essential-listen",root).textContent = "■ Arrêter la voix"; draw(false); host.scrollIntoView({block:"start"});
      const ok = await audio.play(`essential-${active.id}-${step}`,{signal,onStart:()=>draw()});
      if (signal.aborted || !active) return;
      controller = null; $("#essential-listen",root).textContent = "▶ Écouter et voir";
      if (!ok) { draw(); $("#essential-audio-status",root).textContent = "Audio indisponible. L’exemple reste lisible ; tu peux réessayer avec une connexion."; }
    };
    show();
  };
  const onHide = () => { if (document.hidden) { stop(); if (active) $("#essential-listen",root).textContent = "▶ Écouter et voir"; } };
  document.addEventListener("visibilitychange", onHide);
  return () => { stop(); board?.destroy(); audio.destroy(); document.removeEventListener("visibilitychange",onHide); };
}
