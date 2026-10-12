import { Chess } from "./chess.js";
import { value, uci } from "./notation.js";
export const squares = Array.from(
  { length: 64 },
  (_, i) => "abcdefgh"[i % 8] + (8 - Math.floor(i / 8)),
);
export function withTurn(game, color) {
  const p = game.fen().split(" ");
  p[1] = color;
  p[3] = "-";
  return new Chess(p.join(" "));
}
export function checks(game, color = game.turn()) {
  const g = withTurn(game, color);
  const enemy = color === "w" ? "b" : "w",
    king = g
      .board()
      .flat()
      .find((p) => p?.type === "k" && p.color === enemy);
  if (king && g.isAttacked(king.square, color)) return [];
  return g.moves({ verbose: true }).filter((m) => /[+#]/.test(m.san));
}
function exchange(game, target, depth) {
  if (!depth) return 0;
  let best = 0;
  for (const m of game
    .moves({ verbose: true })
    .filter((m) => m.to === target && m.captured)) {
    const g = new Chess(game.fen());
    g.move(m);
    best = Math.max(best, value[m.captured] - exchange(g, target, depth - 1));
  }
  return best;
}
export function endangeredPieces(game, color = null) {
  const result = [];
  for (const p of game
    .board()
    .flat()
    .filter((p) => p && p.type !== "k" && (!color || p.color === color))) {
    const enemy = p.color === "w" ? "b" : "w";
    if (!game.isAttacked(p.square, enemy)) continue;
    const g = withTurn(game, enemy);
    for (const m of g
      .moves({ verbose: true })
      .filter((m) => m.to === p.square && m.captured)) {
      const after = new Chess(g.fen());
      after.move(m);
      if (value[p.type] - exchange(after, p.square, 3) > 0) {
        result.push(p.square);
        break;
      }
    }
  }
  return result;
}
export function knightPath(from, to, blocked = []) {
  const ban = new Set(blocked),
    queue = [[from]],
    seen = new Set([from]);
  while (queue.length) {
    const path = queue.shift(),
      sq = path.at(-1);
    if (sq === to) return path;
    const x = "abcdefgh".indexOf(sq[0]),
      y = Number(sq[1]);
    for (const [dx, dy] of [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, -2],
      [-2, -1],
      [-2, 1],
      [-1, 2],
    ]) {
      const nx = x + dx,
        ny = y + dy;
      if (nx < 0 || nx > 7 || ny < 1 || ny > 8) continue;
      const n = "abcdefgh"[nx] + ny;
      if (!ban.has(n) && !seen.has(n)) {
        seen.add(n);
        queue.push([...path, n]);
      }
    }
  }
  return [];
}
