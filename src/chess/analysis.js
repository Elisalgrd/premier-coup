import { Chess } from "./chess.js";
import { moveUci, uci, sanFr, value } from "./notation.js";
import { endangeredPieces } from "./vision.js";
import { addCard } from "../learn/srs.js";
export function centipawns(result) {
  return result.type === "mate"
    ? result.score > 0
      ? 1000
      : -1000
    : Math.max(-1000, Math.min(1000, result.score));
}
export function classify(before, after) {
  const lost = Math.max(0, centipawns(before) + centipawns(after));
  const missedMate =
      before.type === "mate" &&
      before.score > 0 &&
      !(after.type === "mate" && after.score < 0),
    sufferedMate =
      after.type === "mate" &&
      after.score > 0 &&
      !(before.type === "mate" && before.score < 0);
  return {
    loss: lost,
    severity:
      missedMate || sufferedMate || lost >= 200
        ? "gaffe"
        : lost >= 100
          ? "erreur"
          : lost >= 50
            ? "imprécision"
            : null,
    missedMate,
    sufferedMate,
  };
}
export function labelMistake(fen, played, best, beforeScore, afterScore) {
  const g = new Chess(fen),
    side = g.turn(),
    enemy = side === "w" ? "b" : "w",
    after = new Chess(fen);
  moveUci(after, played);
  const bestGame = new Chess(fen);
  let bestMove;
  try {
    bestMove = moveUci(bestGame, best);
  } catch {}
  const cls = classify(beforeScore, afterScore);
  if (cls.missedMate || bestGame.isCheckmate())
    return { label: "Mat raté", entryId: "proc-forcing-moves" };
  if (cls.sufferedMate) {
    const king = after
      .board()
      .flat()
      .find((p) => p?.type === "k" && p.color === side);
    if (king && ["1", "8"].includes(king.square[1]))
      return { label: "Mat du couloir", entryId: "mat-back-rank" };
  }
  const hanging = endangeredPieces(after, side),
    old = endangeredPieces(g, side);
  if (hanging.some((s) => !old.includes(s)))
    return { label: "Pièce laissée en prise", entryId: "proc-blunder-check" };
  if (afterScore.line?.[0]) {
    const reply = new Chess(after.fen());
    try {
      const m = moveUci(reply, afterScore.line[0]);
      const targets = reply
        .board()
        .flat()
        .filter(
          (p) =>
            p &&
            p.color === side &&
            (value[p.type] >= 3 || p.type === "k") &&
            reply.attackers(p.square, enemy).includes(m.to),
        );
      if (targets.length >= 2)
        return { label: "Fourchette subie", entryId: "tac-fork" };
    } catch {}
  }
  const king = after
    .board()
    .flat()
    .find((p) => p?.type === "k" && p.color === side);
  if (king && !after.isAttacked(king.square, enemy)) {
    for (const p of after
      .board()
      .flat()
      .filter((p) => p && p.color === side && p.type !== "k")) {
      const removed = new Chess(after.fen());
      removed.remove(p.square);
      if (removed.isAttacked(king.square, enemy))
        return { label: "Clouage subi", entryId: "tac-pin" };
    }
  }
  if (bestMove?.captured && !bestGame.isAttacked(bestMove.to, enemy))
    return { label: "Capture gratuite ratée", entryId: "proc-free-material" };
  if (old.length && hanging.some((s) => old.includes(s)))
    return { label: "Menace adverse ignorée", entryId: "proc-opponent-threat" };
  return { label: "Autre décision à revoir", entryId: "proc-candidates-calc" };
}
export async function analyzeGame(
  record,
  engine,
  { depth = 12, onProgress = () => {}, state = null, signal = null } = {},
) {
  const g = new Chess(record.initialFen),
    moments = [],
    total = record.moves.filter(
      (m, i) =>
        (i % 2 === 0 ? g.turn() : g.turn() === "w" ? "b" : "w") ===
        record.color,
    ).length;
  let n = 0;
  for (let i = 0; i < record.moves.length; i++) {
    if (signal?.aborted) throw Error("Analyse annulée.");
    const move = record.moves[i],
      fen = g.fen(),
      side = g.turn(),
      made = moveUci(g, move);
    if (side !== record.color) continue;
    onProgress(n, total);
    const before = await engine.search(fen, { depth });
    let after;
    if (g.isCheckmate()) after = { type: "mate", score: 0, line: [] };
    else if (g.isDraw()) after = { type: "cp", score: 0, line: [] };
    else after = await engine.search(g.fen(), { depth });
    const cls = classify(before, after);
    if (
      cls.severity &&
      cls.severity !== "imprécision" &&
      before.best !== move
    ) {
      const tag = labelMistake(fen, move, before.best, before, after),
        pv = [];
      const valid = new Chess(fen);
      for (const m of before.line.slice(0, 5)) {
        try {
          moveUci(valid, m);
          pv.push(m);
        } catch {
          break;
        }
      }
      if (pv.length)
        moments.push({
          ply: i + 1,
          fen,
          played: move,
          playedSan: sanFr(made.san),
          best: before.best,
          line: pv,
          reply: after.line?.[0] || null,
          ...cls,
          ...tag,
        });
    }
    n++;
    onProgress(n, total);
  }
  moments.sort((a, b) => b.loss - a.loss);
  const result = {
    depth,
    at: Date.now(),
    moments: moments.slice(0, 5),
    analyzedMoves: n,
  };
  record.analysis = result;
  if (state) {
    for (const m of result.moments)
      addCard(state, {
        id: "mistake:" + record.id + ":" + m.ply,
        type: "mistake",
        entryId: m.entryId,
        gameId: record.id,
        challenge: {
          fen: m.fen,
          solution: m.line,
          mode: "move",
          prompt: "Trouve une meilleure réponse dans ta partie.",
        },
        principle: m.label,
      });
  }
  return result;
}
