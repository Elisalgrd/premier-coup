import { gameAt } from "../ui/player-strip.js";
import { moveUci } from "../chess/notation.js";
import { explainMistake } from "../chess/coach-explanation.js";
import { personalExplanation } from "../chess/review-evidence.js";

export function buildReviewScript(record, onlyPly = null) {
  const moments = (record.analysis?.allMoments || []).filter(m => !onlyPly || m.ply === onlyPly);
  const scenes = [];
  for (const m of moments) {
    const explanation = explainMistake(m), personal = personalExplanation(record, m);
    const add = (kind, path, move, voice, summary, context, color = null) => {
      const g = gameAt(record, m.ply - 1);
      for (const step of path) moveUci(g, step);
      const arrows = move ? [[move.slice(0, 2), move.slice(2, 4), color || "good"]] : [];
      scenes.push({ kind, fen: g.fen(), basePly: m.ply - 1, path, move, arrows,
        title: kind === "best" ? (explanation.consequence === "mate" ? "Comment tu pouvais éviter ce mat" : "Pourquoi choisir cet autre coup") : kind === "takeaway" ? "Le réflexe à garder" : explanation.title, text: kind === "played" ? personal.cause : kind === "reply" ? personal.actualText : kind === "best" ? personal.why : personal.question, voice, summary, context,
        branch: kind === "reply" ? personal.punishment.steps.slice(1) : kind === "best" ? personal.alternative.steps : [],
        outcome: kind === "reply" ? personal.punishment.outcome : kind === "best" ? personal.alternative.outcome : "",
        minMs: 1500, ply: m.ply, marks: move ? [move.slice(0, 2)] : [],
        afterMarks: move ? [move.slice(2,4), ...(kind === "best" && explanation.savedSquare ? [explanation.savedSquare] : [])] : [],
        afterArrows: kind === "reply" && explanation.consequence === "fork" ? explanation.targets.map(to => [m.reply.slice(2,4), to, "danger"]) : arrows });
    };
    add("played", [], m.played, "played", personal.playedText, "Ta partie · ton coup");
    add("reply", [m.played], explanation.replyUci, explanation.consequence, explanation.reply || (explanation.consequence === "missed" ? "Une occasion est passée." : "Pas de réponse conservée dans ce rapport."), "Ce que l’adversaire pouvait répondre", "danger");
    add("best", [], m.best, explanation.bestReason, personal.bestText, "Retour avant ton coup · une autre possibilité", "good");
    add("takeaway", [], null, explanation.remember, "Avant de jouer ton prochain coup…", "Position de départ · à toi de retrouver ensuite");
  }
  return scenes;
}

export function reviewSceneGame(record, scene) {
  const game = gameAt(record, scene.basePly);
  for (const m of scene.path) moveUci(game, m);
  return game;
}
