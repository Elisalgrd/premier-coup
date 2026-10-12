import { material, value } from "./notation.js";

export function capturedPieces(game) {
  const taken = { w: [], b: [], diff: material(game, "w") - material(game, "b") };
  for (const move of game.history({ verbose: true }))
    if (move.captured) taken[move.color].push(move.captured);
  for (const color of ["w", "b"]) taken[color].sort((a, b) => value[b] - value[a] || a.localeCompare(b));
  return taken;
}
