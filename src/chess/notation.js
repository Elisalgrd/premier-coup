export const sanFr = (san) =>
  String(san).replace(
    /[KQRBN]/g,
    (c) => ({ K: "R", Q: "D", R: "T", B: "F", N: "C" })[c],
  );
export const uci = (m) => m.from + m.to + (m.promotion || "");
export const moveUci = (game, move) =>
  game.move({
    from: move.slice(0, 2),
    to: move.slice(2, 4),
    promotion: move[4],
  });
export const pieceName = {
  p: "pion",
  n: "cavalier",
  b: "fou",
  r: "tour",
  q: "dame",
  k: "roi",
};
export const value = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
export function material(game, color) {
  return game
    .board()
    .flat()
    .filter((p) => p?.color === color)
    .reduce((n, p) => n + value[p.type], 0);
}
