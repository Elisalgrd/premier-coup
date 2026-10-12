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
export function rememberPrinciple(state, e) {
  addCard(state, {
    id: "principle:" + e.id,
    type: "principle",
    entryId: e.id,
    challenge: e.entryChallenge,
    principle: e.principle,
  });
  if (e.entryChallenge.mode === "opening") {
    let i = 0;
    for (const frame of e.guided) {
      if (i++ % 2 === 0)
        addCard(state, {
          id: "opening:" + e.id + ":" + i,
          type: "opening",
          entryId: e.id,
          challenge: {
            fen: frame.fen,
            solution: [frame.move],
            mode: "move",
            prompt: "Retrouve le coup de ton répertoire.",
          },
          principle: e.principle,
        });
    }
  }
}
