import fs from "node:fs";
import { Chess } from "../src/chess/chess.js";
import { moveUci } from "../src/chess/notation.js";
const pit = {
  "tac-fork": {
    fen: "4k3/4p3/8/1q6/4N3/8/8/4K3 w - - 0 1",
    line: ["e4d6", "e7d6"],
    text: "Cd6+ attaque le roi et la dame. Mais le pion en e7 prend le cavalier : la fourchette échoue.",
  },
  "mat-back-rank": {
    fen: "6k1/5pp1/7p/8/8/8/8/R5K1 w - - 0 1",
    line: ["a1a8", "g8h7"],
    text: "Ta8+ donne échec. Mais le roi noir peut sortir en h7 : ce n’est pas mat.",
  },
  "tac-pin": {
    fen: "4k3/8/8/8/4n3/8/5P2/4RK2 w - - 0 1",
    line: ["e1d1", "e4f6"],
    text: "Si ta tour quitte la colonne e, elle ne vise plus le roi. Le cavalier peut à nouveau bouger.",
  },
};
const all = [];
for (const file of fs.readdirSync("curriculum/entries")) {
  const path = "curriculum/entries/" + file,
    e = JSON.parse(fs.readFileSync(path));
  if (pit[e.id]) e.pitfall = pit[e.id];
  const pat = e.examples.find((x) => x.outcome === "stalemate");
  if (pat)
    e.pitfall = {
      text: "Le roi n’est pas en échec et son camp ne peut jouer aucun coup légal. C’est pat : partie nulle.",
      fen: pat.fen,
      line: [],
    };
  if (
    ["ouv-black-e5", "ouv-black-d5"].includes(e.id) &&
    e.entryChallenge.fen === new Chess().fen()
  ) {
    const g = new Chess(e.entryChallenge.fen);
    moveUci(g, e.entryChallenge.solution.shift());
    e.entryChallenge.fen = g.fen();
    e.entryChallenge.prompt =
      "Trait aux noirs. Développe tes pièces et prépare la sécurité du roi.";
    e.guided = e.entryChallenge.solution.map((move) => {
      const fen = g.fen();
      moveUci(g, move);
      return {
        fen,
        move,
        text: "",
        arrows: [[move.slice(0, 2), move.slice(2, 4)]],
        marks: [],
      };
    });
  }
  const full = e.screens.map((s) => s.text).join(" ");
  all.push({
    id: e.id,
    title: e.title,
    tier: e.tier,
    priority: e.priority,
    domain: e.domain,
    prerequisites: e.prerequisites,
    principle: e.principle,
    drill: e.drill,
    searchText: full,
  });
  fs.writeFileSync(path, JSON.stringify(e, null, 2) + "\n");
}
const order = [
  ...fs.readFileSync("CURRICULUM.md", "utf8").matchAll(/^### `([^`]+)`/gm),
].map((m) => m[1]);
all.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
fs.writeFileSync("curriculum/index.json", JSON.stringify(all, null, 2) + "\n");
