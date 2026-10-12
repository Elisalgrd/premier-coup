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

export function describeMove(m) {
  const camp = m.color === "w" ? "Les blancs" : "Les noirs";
  if (m.flags?.includes("k") || m.flags?.includes("q"))
    return `${camp} mettent leur roi à l’abri : le roi va de ${m.from} à ${m.to} et la tour passe à côté de lui. C’est le roque.`;
  const article = (p) => (["r", "q"].includes(p) ? "la " : "le ");
  return `${camp} déplacent ${article(m.piece)}${pieceName[m.piece]} de ${m.from} à ${m.to}${m.captured ? ` et prennent ${article(m.captured)}${pieceName[m.captured]}` : ""}${m.promotion ? `. Le pion devient ${m.promotion === "q" ? "une dame" : m.promotion === "r" ? "une tour" : "un " + pieceName[m.promotion]}` : ""}${m.san.endsWith("#") ? " : échec et mat, le roi ne peut plus être sauvé." : m.san.endsWith("+") ? " : le roi adverse est attaqué." : "."}`;
}
