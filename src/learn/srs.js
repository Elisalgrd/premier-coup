import { Chess } from "../chess/chess.js";
import { moveUci } from "../chess/notation.js";
import { addDays, dateKey } from "../ui/helpers.js";
export const intervals = [1, 3, 7, 14, 30, 90];
export function addCard(state, card, today = dateKey()) {
  const old = state.cards[card.id];
  if (old) return old;
  return (state.cards[card.id] = {
    ...card,
    box: 0,
    due: addDays(today, 1),
    created: today,
    attempts: 0,
  });
}
export function gradeCard(state, id, clean, today = dateKey()) {
  const c = state.cards[id];
  if (!c) throw Error("Carte introuvable");
  c.box = clean ? Math.min(5, c.box + 1) : 0;
  c.due = addDays(today, intervals[c.box]);
  c.last = today;
  c.attempts++;
  c.correct = (c.correct || 0) + (clean ? 1 : 0);
  return c;
}
export function dueCards(state, today = dateKey()) {
  const priority = { mistake: 0, puzzle: 1, principle: 2, opening: 3 };
  return Object.values(state.cards)
    .filter((c) => c.due <= today)
    .sort(
      (a, b) =>
        (priority[a.type] ?? 9) - (priority[b.type] ?? 9) ||
        a.due.localeCompare(b.due) ||
        a.id.localeCompare(b.id),
    );
}
export function rememberPuzzle(state, row, theme) {
  return addCard(state, {
    id: "puzzle:" + row[0],
    type: "puzzle",
    row,
    entryId: theme,
  });
}
export function rememberMistake(state, gameId, m) {
  const data = {
    id: "mistake:" + gameId + ":" + m.ply,
    type: "mistake",
    entryId: m.entryId,
    gameId, ply: m.ply, question: m.question,
    challenge: {
      fen: m.fen, solution: m.line, mode: "move",
      prompt: "Trouve une meilleure réponse dans ta partie.",
    },
    principle: m.label,
  };
  const card = addCard(state, data);
  // The same ply can be replayed after a takeback; retain learning history but refresh its position.
  return Object.assign(card, data);
}
export function rememberPrinciple(state, e) {
  addCard(state, {
    id: "principle:" + e.id,
    type: "principle",
    entryId: e.id,
    challenge: e.entryChallenge,
    principle: e.retenir || e.principle,
  });
  const existing = state.cards["principle:" + e.id];
  existing.principle = e.retenir || e.principle;
  existing.challenge = e.entryChallenge;
  if (e.id.startsWith("ouv-")) {
    const screen = e.screens?.find((s) => s.line?.length >= 5);
    if (!screen) return;
    const game = new Chess(screen.fen),
      side = e.id.includes("black") ? "b" : "w";
    screen.line.forEach((frame, i) => {
      if (game.turn() === side)
        addCard(state, {
          id: "opening:" + e.id + ":" + (i + 1),
          type: "opening",
          entryId: e.id,
          challenge: {
            fen: game.fen(),
            solution: [frame.uci],
            accept: [frame.uci],
            mode: "move",
            prompt:
              "Retrouve le prochain coup de l’ouverture que tu as étudiée.",
          },
          principle: frame.text,
        });
      moveUci(game, frame.uci);
    });
  }
}
