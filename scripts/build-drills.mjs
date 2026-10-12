import fs from "node:fs";
import { Chess } from "../src/chess/chess.js";
import { moveUci } from "../src/chess/notation.js";
import { squares } from "../src/chess/vision.js";
const out = Object.fromEntries(
  [
    "str-outposts",
    "str-weak-squares",
    "str-pawn-structure",
    "str-worst-piece",
    "str-good-bad-bishop",
    "str-plan-making",
    "str-initiative",
    "str-bishop-pair-space",
  ].map((id) => [id, []]),
);
const limit = 180,
  seen = new Set();
const pawnCanReach = (p, s) =>
  Math.abs(p.square.charCodeAt(0) - s.charCodeAt(0)) === 1 &&
  (p.color === "b"
    ? Number(p.square[1]) > Number(s[1])
    : Number(p.square[1]) < Number(s[1]));
function add(id, row, g, targets, prompt) {
  if (out[id].length >= limit || !targets.length) return;
  out[id].push({
    id: "lichess-" + row[0],
    fen: g.fen(),
    solution: targets,
    mode: "square",
    prompt,
    source: "https://lichess.org/training/" + row[0],
  });
}
for (const file of fs
  .readdirSync("data/puzzles")
  .filter((x) => x.endsWith(".json") && x !== "manifest.json")) {
  for (const row of JSON.parse(fs.readFileSync("data/puzzles/" + file))) {
    if (seen.has(row[0])) continue;
    seen.add(row[0]);
    const g = new Chess(row[1]);
    moveUci(g, row[2].split(" ")[0]);
    if (g.isCheck()) continue;
    const side = g.turn(),
      enemy = side === "w" ? "b" : "w",
      pieces = g.board().flat().filter(Boolean),
      mine = pieces.filter((p) => p.color === side),
      theirPawns = pieces.filter((p) => p.color === enemy && p.type === "p"),
      myPawns = mine.filter((p) => p.type === "p"),
      name = side === "w" ? "blancs" : "noirs";
    const weak = squares.filter(
        (s) =>
          !g.get(s) &&
          "cdef".includes(s[0]) &&
          (side === "w"
            ? Number(s[1]) >= 4 && Number(s[1]) <= 6
            : Number(s[1]) >= 3 && Number(s[1]) <= 5) &&
          !theirPawns.some((p) => pawnCanReach(p, s)),
      ),
      outposts = weak.filter((s) =>
        g.attackers(s, side).some((a) => g.get(a)?.type === "p"),
      );
    add(
      "str-outposts",
      row,
      g,
      outposts,
      "Touche une case avancée soutenue par un de tes pions. Aucun pion adverse ne doit pouvoir l’attaquer.",
    );
    add(
      "str-weak-squares",
      row,
      g,
      weak,
      "Au centre du camp adverse, touche une case vide qu’aucun de ses pions ne peut plus défendre.",
    );
    const isolated = myPawns
      .filter(
        (p) =>
          !myPawns.some(
            (q) =>
              Math.abs(q.square.charCodeAt(0) - p.square.charCodeAt(0)) === 1,
          ),
      )
      .map((p) => p.square);
    add(
      "str-pawn-structure",
      row,
      g,
      isolated,
      "Touche un pion isolé parmi les " +
        name +
        ". Il n’a aucun pion ami sur les colonnes voisines.",
    );
    const enemyPawns = pieces.filter(
        (p) => p.color === enemy && p.type === "p",
      ),
      targets = enemyPawns
        .filter(
          (p) =>
            !enemyPawns.some(
              (q) =>
                Math.abs(q.square.charCodeAt(0) - p.square.charCodeAt(0)) === 1,
            ),
        )
        .map((p) => p.square);
    add(
      "str-plan-making",
      row,
      g,
      targets,
      "Construis ton plan autour d’une cible : touche un pion adverse isolé. Vérifie ensuite les pièces qui peuvent l’attaquer.",
    );
    const edgeKnights = mine
      .filter(
        (p) =>
          p.type === "n" &&
          ("ah".includes(p.square[0]) || "18".includes(p.square[1])),
      )
      .map((p) => p.square);
    add(
      "str-worst-piece",
      row,
      g,
      edgeKnights,
      "Repère un cavalier de ton camp situé au bord. Il possède moins de sauts qu’au centre.",
    );
    const bishops = mine.filter((p) => p.type === "b");
    const blocked = bishops
      .filter((b) => {
        const col = ("abcdefgh".indexOf(b.square[0]) + Number(b.square[1])) % 2;
        return (
          myPawns.filter(
            (p) =>
              ("abcdefgh".indexOf(p.square[0]) + Number(p.square[1])) % 2 ===
                col &&
              g.get(
                p.square[0] + (Number(p.square[1]) + (side === "w" ? 1 : -1)),
              ),
          ).length >= 3
        );
      })
      .map((b) => b.square);
    add(
      "str-good-bad-bishop",
      row,
      g,
      blocked,
      "Touche le fou dont la couleur correspond à plusieurs de tes pions bloqués. Compare ensuite ses diagonales disponibles.",
    );
    if (bishops.length === 2) {
      const scope = bishops.map((b) => ({
        square: b.square,
        space: squares.filter(
          (s) => !g.get(s) && g.attackers(s, side).includes(b.square),
        ).length,
      }));
      if (scope[0].space !== scope[1].space)
        add(
          "str-bishop-pair-space",
          row,
          g,
          [scope.sort((a, b) => b.space - a.space)[0].square],
          "Touche le fou qui contrôle le plus de cases vides. Les diagonales ouvertes augmentent son activité.",
        );
    }
    const central = myPawns
      .filter(
        (p) =>
          "de".includes(p.square[0]) &&
          g.moves({ square: p.square, verbose: true }).some((m) => m.captured),
      )
      .map((p) => p.square);
    add(
      "str-initiative",
      row,
      g,
      central,
      "Touche un de tes pions centraux qui peut capturer. Cet échange peut ouvrir une ligne : calcule avant de le jouer.",
    );
  }
  if (Object.values(out).every((a) => a.length >= limit)) break;
}
const manifest = {
  source:
    "Positions de la banque Lichess CC0, après le coup adverse. Exercices de repérage stratégique, pas une certification du meilleur coup.",
  entries: {},
};
for (const [id, rows] of Object.entries(out)) {
  fs.writeFileSync("data/drills/" + id + ".json", JSON.stringify(rows));
  manifest.entries[id] = { count: rows.length, file: id + ".json" };
}
fs.writeFileSync(
  "data/drills/manifest.json",
  JSON.stringify(manifest, null, 2),
);
console.log(
  Object.fromEntries(
    Object.entries(out).map(([id, rows]) => [id, rows.length]),
  ),
);
