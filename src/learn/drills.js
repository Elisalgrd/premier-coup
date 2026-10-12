import { Chess } from "../chess/chess.js";
import { moveUci, uci, value } from "../chess/notation.js";
import { squares } from "../chess/vision.js";
const shiftFen = (fen, flipFile, swap) => {
  const g = new Chess(fen),
    pieces = g.board().flat().filter(Boolean),
    out = new Chess();
  out.clear();
  for (const p of pieces) {
    const file = flipFile
        ? "hgfedcba"["abcdefgh".indexOf(p.square[0])]
        : p.square[0],
      rank = swap ? 9 - Number(p.square[1]) : p.square[1];
    out.put(
      { type: p.type, color: swap ? (p.color === "w" ? "b" : "w") : p.color },
      file + rank,
    );
  }
  const f = out.fen().split(" ");
  f[1] = swap ? (g.turn() === "w" ? "b" : "w") : g.turn();
  return f.join(" ");
};
const shiftSquare = (s, flip, swap) =>
  (flip ? "hgfedcba"["abcdefgh".indexOf(s[0])] : s[0]) +
  (swap ? 9 - Number(s[1]) : s[1]);
export function drillChallenges(entry) {
  const c = entry.entryChallenge,
    out = [];
  if (entry.id === "vis-notation")
    return squares.map((s) => ({
      id: "case-" + s,
      fen: c.fen,
      mode: "square",
      solution: [s],
      prompt: "Touche la case " + s + ".",
    }));
  if (entry.id === "vis-values") {
    for (const piece of ["p", "n", "b", "r", "q"])
      for (const square of squares.filter(
        (s) =>
          !["a1", "h8"].includes(s) &&
          (!["p"].includes(piece) || !["1", "8"].includes(s[1])),
      )) {
        const g = new Chess("7k/8/8/8/8/8/8/K7 w - - 0 1");
        g.put({ type: piece, color: "w" }, square);
        if (g.isCheck() || g.isAttacked("h8", "w")) continue;
        out.push({
          id: piece + square,
          fen: g.fen(),
          mode: "square",
          solution: [square],
          prompt:
            "Touche la pièce qui vaut " +
            value[piece] +
            " point" +
            (value[piece] > 1 ? "s" : "") +
            ".",
        });
      }
    return out;
  }
  if (entry.id === "vis-rules") {
    const cases = [
      ["4k3/8/8/8/8/8/8/4K2R w K - 0 1", "e1g1", "Fais le petit roque."],
      ["4k3/8/8/8/8/8/8/R3K3 w Q - 0 1", "e1c1", "Fais le grand roque."],
      [
        "4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2",
        "e5d6",
        "Capture le pion qui vient d’avancer de deux cases, en passant.",
      ],
      [
        "7k/P7/8/8/8/8/8/7K w - - 0 1",
        "a7a8q",
        "Avance ton pion et choisis la promotion en dame.",
      ],
      [
        "4k2r/8/8/8/8/8/8/4K3 b k - 0 1",
        "e8g8",
        "Tu joues les noirs : fais le petit roque.",
      ],
      [
        "r3k3/8/8/8/8/8/8/4K3 b q - 0 1",
        "e8c8",
        "Tu joues les noirs : fais le grand roque.",
      ],
      [
        "4k3/8/8/8/3Pp3/8/8/4K3 b - d3 0 2",
        "e4d3",
        "Capture en passant avec les noirs.",
      ],
      [
        "7k/8/8/8/8/8/p7/7K b - - 0 1",
        "a2a1q",
        "Les noirs : avance et transforme le pion en dame.",
      ],
    ];
    return cases.map(([fen, move, prompt], i) => ({
      id: "rule-" + i,
      fen,
      solution: [move],
      prompt,
      mode: "move",
    }));
  }
  if (["mat-basic-queen", "mat-basic-rook"].includes(entry.id)) {
    const type = entry.id.endsWith("queen") ? "q" : "r";
    for (const file of "abcdefgh") {
      for (const rank of [1, 2, 3, 4, 5, 6]) {
        const g = new Chess("7k/8/6K1/8/8/8/8/8 w - - 0 1");
        const square = file + rank;
        if (g.get(square)) continue;
        g.put({ type, color: "w" }, square);
        if (g.isAttacked("h8", "w")) continue;
        const mates = g
          .moves({ verbose: true })
          .filter((m) => m.san.endsWith("#"));
        if (mates.length)
          out.push({
            id: "mate-" + square,
            fen: g.fen(),
            mode: "move",
            solution: [uci(mates[0])],
            acceptMate: true,
            prompt: "Fais mat en un coup. Le roi blanc soutient ton attaque.",
          });
      }
    }
    return out;
  }
  for (const flip of [false, true])
    for (const swap of [false, true]) {
      if (c.mode === "opening" || c.fen.split(" ")[2] !== "-") {
        out.push({ ...c, id: "model" });
        return out;
      }
      const fen = shiftFen(c.fen, flip, swap),
        solution =
          c.mode === "square"
            ? c.solution.map((s) => shiftSquare(s, flip, swap))
            : c.solution.map(
                (m) =>
                  shiftSquare(m.slice(0, 2), flip, swap) +
                  shiftSquare(m.slice(2, 4), flip, swap) +
                  (m[4] || ""),
              );
      const g = new Chess(fen);
      try {
        if (c.mode !== "square") for (const m of solution) moveUci(g, m);
        out.push({
          ...c,
          fen,
          solution,
          id: "model-" + Number(flip) + Number(swap),
          prompt:
            "Retrouve le principe dans cette position. " +
            (c.mode === "square"
              ? "Touche la case ou la pièce concernée."
              : "Joue le premier coup de la méthode."),
        });
      } catch {}
    }
  return out;
}

let drillManifest;
export async function loadDrillChallenges(entry) {
  drillManifest ??= fetch("./data/drills/manifest.json")
    .then((r) => {
      if (!r.ok) throw Error("Reconnecte-toi pour télécharger ces exercices.");
      return r.json();
    })
    .catch((e) => {
      drillManifest = null;
      throw e;
    });
  const meta = (await drillManifest).entries[entry.id];
  if (!meta?.count) return drillChallenges(entry);
  const response = await fetch("./data/drills/" + meta.file);
  if (!response.ok)
    throw Error("Ces exercices ne sont pas encore disponibles hors ligne.");
  return response.json();
}
