import { dominantMistake } from "./mistake-recap.js";
import { gameAt } from "../ui/player-strip.js";
import { moveUci, describeMove } from "../chess/notation.js";
import { mistakeQuestion } from "../chess/mistake-questions.js";

export function buildReviewScript(record, onlyPly = null) {
  const moments = (record.analysis?.allMoments || []).filter(m => !onlyPly || m.ply === onlyPly);
  const scenes = [], initial = gameAt(record, 0).fen();
  const add = (kind, basePly, path, move, text, minMs = 1000, ply = null, color = null) => {
    const g = gameAt(record, basePly);
    for (const m of path) moveUci(g, m);
    scenes.push({ kind, fen: g.fen(), basePly, path: [...path], move, arrows: move && color ? [[move.slice(0, 2), move.slice(2, 4), color]] : [], text, minMs, ply });
  };
  if (!moments.length) return [{ kind: "intro", fen: initial, basePly: 0, path: [], move: null, arrows: [], text: "Aucune erreur importante détectée, bravo. Continue à vérifier les menaces avant chaque coup.", minMs: 3000 }];
  const repeated = dominantMistake(moments);
  add("intro", 0, [], null, `Dans cette partie, ${moments.length} erreur${moments.length > 1 ? "s" : ""} mérite${moments.length > 1 ? "nt" : ""} ton attention.${repeated.count > 1 ? ` ${repeated.count} fois la même : ${repeated.title}.` : ""} On les revoit une par une.`, 2000);
  let cursor = 0;
  for (const m of moments) {
    if (!onlyPly) for (let i = cursor; i < m.ply - 1; i++) add("fast", i, [], record.moves[i], "", 600);
    const played = moveUci(gameAt(record, m.ply - 1), m.played);
    add("before", m.ply - 1, [], null, `Coup ${Math.ceil(m.ply / 2)}. ${m.severity === "gaffe" ? "Gaffe" : "Erreur"}. Regarde ta position avant de jouer.`, 1500, m.ply);
    add("played", m.ply - 1, [], m.played, `Voici ton coup. ${describeMove(played)}`, 1000, m.ply);
    if (m.reply) add("reply", m.ply - 1, [m.played], m.reply, m.risk, 1500, m.ply, "danger");
    else add("reply", m.ply - 1, [m.played], null, m.risk, 1500, m.ply);
    add("best", m.ply - 1, [], m.best, `Revenons en arrière. ${m.better}`, 1500, m.ply, "good");
    const line = m.line?.[0] === m.best ? m.line.slice(0, 5) : [m.best];
    for (let i = 1; i < line.length; i++) {
      const g = gameAt(record, m.ply - 1); for (const move of line.slice(0, i)) moveUci(g, move);
      const made = moveUci(g, line[i]);
      add("line", m.ply - 1, line.slice(0, i), line[i], describeMove(made), 800, m.ply, "good");
    }
    add("takeaway", m.ply - 1, [], null, m.question || mistakeQuestion(m.label), 3000, m.ply);
    cursor = m.ply - 1;
  }
  add("outro", record.moves.length, [], null, `Ta règle pour la prochaine partie : ${repeated.question || mistakeQuestion(repeated.label)} Maintenant, retrouve toi-même les meilleurs coups.`, 2500);
  return scenes;
}

export function reviewSceneGame(record, scene) {
  const game = gameAt(record, scene.basePly);
  for (const m of scene.path) moveUci(game, m);
  return game;
}
