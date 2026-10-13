import { dominantMistake } from "../play/mistake-recap.js";
import { pickPuzzles } from "./rating.js";
import { tagsFor } from "./puzzles.js";
export const mistakeThemes = {
  "Pièce laissée en prise": ["hangingPiece"], "Capture gratuite ratée": ["hangingPiece"],
  "Menace adverse ignorée": ["defensiveMove", "hangingPiece"], "Fourchette subie": ["fork"],
  "Clouage subi": ["pin"], "Mat du couloir": ["backRankMate"], "Mat raté": ["mateIn1", "mateIn2"],
  "Autre décision à revoir": ["short", "advantage"],
};
export function mostFrequentMistake(state) {
  return dominantMistake(state.games.slice(-10).flatMap(g => g.analysis?.allMoments || g.analysis?.moments || (g.alerts || []).filter(m => !m.retracted)));
}
export function targetedPlan(state, label, rows, manifest, { count = 10, seed = Date.now() } = {}) {
  const themes = mistakeThemes[label] || mistakeThemes["Autre décision à revoir"];
  const own = Object.values(state.cards).filter(c => c.type === "mistake" && c.principle === label && c.challenge?.solution?.length).sort((a,b) => a.box - b.box || a.due.localeCompare(b.due)).slice(0, Math.floor(count / 2));
  const unique = [...new Map(rows.filter(r => tagsFor(r, manifest).some(t => themes.includes(t))).map(r => [r[0],r])).values()];
  const selected = pickPuzzles(unique, state, "mixed", { count: count - own.length, allowRecent: true, seed });
  const result = [];
  while (own.length || selected.length) {
    if (own.length) result.push({ kind: "mistake", id: own.shift().id });
    if (selected.length) result.push({ kind: "puzzle", row: selected.shift() });
  }
  return result.slice(0,count);
}
