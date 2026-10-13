import { mostFrequentMistake } from "../learn/targeted.js";
import { Engine } from "../chess/engine.js";
import { Board } from "../chess/board.js";
import { Chess } from "../chess/chess.js";
import { moveUci, describeMove } from "../chess/notation.js";
import { mistakeMessage } from "../chess/mistake-text.js";
import { mistakeQuestion } from "../chess/mistake-questions.js";
import { CorrectionSession, checkCorrection } from "./correction.js";
import { esc, $ } from "../ui/helpers.js";

export function startCorrection(ctx, root, id, { record: providedRecord = null, onDone = null } = {}) {
  const record = providedRecord || ctx.state.games.find(g => g.id === id);
  if (!record?.analysis?.allMoments) {
    root.innerHTML = `<p>Prépare d’abord l’analyse complète de cette partie.</p><a class="button primary" href="#train/review-video/${esc(id)}">Préparer ma revue →</a>`; return;
  }
  const session = new CorrectionSession(ctx.state, record);
  let board, disposed = false, engine = new Engine(), generation = 0;
  const finish = () => {
    board?.destroy(); engine.close();
    if (onDone) { onDone(); return; }
    const priority = mostFrequentMistake(ctx.state);
    root.innerHTML = `<section class="completion"><span class="complete-icon">✓</span><h1>${session.cleanCount} / ${session.moments.length} retrouvées du premier coup.</h1><p>${session.moments.length - session.cleanCount ? "Les positions faites avec une erreur ou une aide reviendront demain, en priorité." : "Les positions reviendront plus tard pour vérifier que le réflexe reste."}</p>${priority ? `<a class="button primary" href="#train/targeted/${encodeURIComponent(priority.label)}">Série ciblée (10 positions) →</a>` : ""}<a href="#train/game" class="button secondary">Jouer avec mon nouveau réflexe →</a><a href="#train/import/${esc(id)}" class="button secondary">Revoir mon bilan</a></section>`;
  };
  const show = () => {
    if (disposed) return;
    board?.destroy(); const ticket = ++generation;
    if (session.run.index >= session.moments.length) return finish();
    const m = session.moments[session.run.index], question = m.question || mistakeQuestion(m.label);
    let busy = false, done = Object.hasOwn(session.run.results, m.ply), bestResult = null;
    root.innerHTML = `<a class="back-link" href="#train/import/${esc(id)}">← Mon bilan</a><header class="activity-header"><div><span class="eyebrow">CORRIGER MA PARTIE · ${session.run.index + 1} / ${session.moments.length}</span><h1>À toi de trouver mieux.</h1></div></header><div class="play-layout"><section><div id="correction-board"></div></section><section class="play-coach"><p>Trouve un meilleur coup que celui que tu as joué.</p><details open><summary>La question à te poser</summary><p>${esc(question)}</p></details><div id="correction-feedback" role="status"></div><button id="correction-retry" class="button secondary" hidden>Réessayer →</button><button id="correction-solution" class="text-link" ${(session.run.attempts[m.ply] || 0) >= 2 ? "" : "hidden"}>Voir la solution</button><button id="correction-next" class="button primary" hidden>Position suivante →</button></section></div>`;
    const save = () => ctx.save();
    const complete = clean => {
      done = true; busy = false; session.complete(m, clean); save();
      board.options.interactive = false; board.render();
      $("#correction-next", root).hidden = false;
      $("#correction-retry", root).hidden = true;
      $("#correction-solution", root).hidden = true;
    };
    const solution = (unavailable = false) => {
      if (disposed || ticket !== generation) return;
      session.help(m); const g = new Chess(m.fen), made = moveUci(g, m.best);
      complete(false);
      board.set(m.fen, { interactive: false });
      board.animate(g.fen(), m.best, 500, { arrows: [[made.from, made.to, "good"]] });
      $("#correction-feedback", root).textContent = `${unavailable ? "Le moteur ne peut pas vérifier ton coup pour le moment. Voici la suite de l’analyse enregistrée. " : "Voici une bonne réponse. "}${describeMove(made)} ${question}`;
    };
    const reset = () => {
      const hinted = (session.run.attempts[m.ply] || 0) >= 2;
      if (hinted) session.help(m);
      board.set(m.fen, { interactive: true, marks: hinted ? [m.best.slice(0,2)] : [], arrows: [], last: [] });
      $("#correction-retry", root).hidden = true;
      $("#correction-feedback", root).textContent = hinted ? "Regarde la pièce sur la case colorée. Où pourrait-elle aller ?" : "Repars de cette position. Cherche une autre réponse.";
      $("#correction-solution", root).hidden = !hinted; save();
    };
    board = new Board($("#correction-board", root), { fen: m.fen, flipped: record.color === "b", interactive: !done, onMove: async move => {
      if (busy || done || disposed) return;
      busy = true; board.options.interactive = false; board.render();
      $("#correction-feedback", root).textContent = "Je vérifie aussi les autres bonnes réponses…";
      const result = await checkCorrection(engine, m.fen, move, bestResult);
      if (disposed || ticket !== generation) return;
      if (result.unavailable) return solution(true);
      bestResult = result.before || bestResult; busy = false;
      if (result.ok) {
        const g = new Chess(m.fen), made = moveUci(g, move);
        complete(!(session.run.attempts[m.ply] || session.run.helped[m.ply]));
        board.animate(g.fen(), move, 500, { arrows: [[made.from, made.to, "good"]] });
        $("#correction-feedback", root).textContent = `Oui, c’est une bonne réponse. ${describeMove(made)} ${move !== m.best ? "Tu as trouvé une autre bonne idée. " : ""}${question}`;
      } else {
        session.fail(m); save();
        if (session.run.attempts[m.ply] >= 3) return solution();
        const message = mistakeMessage(m.fen, move, result.before, result.after, { includeInaccuracies: true });
        const after = new Chess(result.fen), reply = result.after.line?.[0] || result.after.best;
        board.set(after.fen(), { interactive: false, arrows: [], marks: [], last: [] });
        let explanation = "Cette réponse laisse davantage de possibilités à l’adversaire.";
        if (reply) try {
          const made = moveUci(after, reply);
          board.animate(after.fen(), reply, 500, { arrows: [[made.from, made.to, "danger"]] });
          explanation = `L’adversaire peut répondre : ${describeMove(made)}`;
        } catch {}
        $("#correction-feedback", root).textContent = `${message?.risk || explanation} ${session.run.attempts[m.ply] >= 2 ? "Au prochain essai, la pièce à déplacer sera indiquée." : "Essaie une autre idée."}`;
        $("#correction-retry", root).hidden = false;
        $("#correction-solution", root).hidden = session.run.attempts[m.ply] < 2;
      }
    }});
    $("#correction-retry", root).onclick = reset;
    $("#correction-solution", root).onclick = () => solution();
    $("#correction-next", root).onclick = () => { if (!done) return; session.run.index++; save(); show(); };
    if (done) {
      $("#correction-feedback", root).textContent = "Cette réponse est déjà enregistrée ✓";
      $("#correction-next", root).hidden = false;
    }
  };
  show();
  return () => { disposed = true; generation++; board?.destroy(); engine.close(); };
}
