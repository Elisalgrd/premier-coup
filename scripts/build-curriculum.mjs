import fs from "node:fs";
import { Chess } from "../src/chess/chess.js";
const source = fs.readFileSync("CURRICULUM.md", "utf8");
const sections = [
  ...source.matchAll(
    /^### `([^`]+)` · (.+)\n([\s\S]*?)(?=^### |^## |$(?![\s\S]))/gm,
  ),
];
const clean = (s) =>
  s
    .replace(/\*\*|`/g, "")
    .replace(/[—–]/g, ":")
    .replace(/^\d+\.\s*/gm, "")
    .trim();
const split = (s) =>
  clean(s)
    .split(/\n|;\s+/)
    .map((s) => s.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
const chunks = (s, max = 60) => {
  const out = [];
  for (const paragraph of clean(s).split(/\n+/).filter(Boolean)) {
    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    let current = "";
    for (const sentence of sentences) {
      if (
        (current + " " + sentence).trim().split(/\s+/).length > max &&
        current
      ) {
        out.push(current);
        current = "";
      }
      current += (current ? " " : "") + sentence;
    }
    if (current) out.push(current);
  }
  return out;
};
const fields = (body) =>
  Object.fromEntries(
    [
      ...body.matchAll(
        /^\*\*([^*]+)\*\*\s*:\s*([\s\S]*?)(?=^\*\*|$(?![\s\S]))/gm,
      ),
    ].map((m) => [m[1], m[2].trim()]),
  );
const byPrefix = (f, p) =>
  Object.entries(f).find(([k]) => k.startsWith(p))?.[1] || "";
const aliases = Object.fromEntries(
  [
    ...source
      .split("## ANNEXE C")[1]
      .split("## ANNEXE D")[0]
      .matchAll(/^\| (.+) \| (.+) \|/gm),
  ]
    .filter((m) => !m[1].startsWith("vidéos") && !m[1].startsWith("principes"))
    .flatMap((m) =>
      [...m[1].matchAll(/`([^`]+)`/g)].map((x) => [
        x[1],
        [...m[2].matchAll(/`([^`]+)`/g)].map((x) => x[1]),
      ]),
    ),
);
const videoMap = {
  captures: "proc-exchange-count",
  italian: "ouv-principles",
  "king-safety": "ouv-principles",
  forks: "tac-fork",
  pins: "tac-pin",
  mates: "mat-back-rank",
  "active-piece": "str-worst-piece",
};
const knownExamples = {
  "proc-exchange-count": {
    fen: "7k/8/4p3/3r4/q7/8/2B5/3Q2K1 w - - 0 1",
    solution: ["c2a4"],
    pitfall: {
      fen: "7k/8/4p3/3r4/q7/8/2B5/3Q2K1 w - - 0 1",
      line: ["d1d5", "e6d5"],
    },
  },
  "tac-fork": {
    fen: "4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1",
    solution: ["e4d6", "e8d7", "d6b5"],
  },
  "tac-pin": { fen: "4k3/8/8/8/4n3/8/5P2/4RK2 w - - 0 1", solution: ["f2f3"] },
  "tac-skewer": {
    fen: "8/8/8/3k3q/8/8/8/R5K1 w - - 0 1",
    solution: ["a1a5", "d5c4", "a5h5"],
  },
  "tac-discovered": {
    fen: "4k3/8/8/7q/8/8/4B3/4R1K1 w - - 0 1",
    solution: ["e2h5"],
  },
  "mat-back-rank": {
    fen: "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
    solution: ["a1a8"],
    outcome: "mate",
  },
  "mat-two-rooks": {
    fen: "6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1",
    solution: ["a2a7", "g8f8", "b1b8"],
    outcome: "mate",
  },
  "mat-anastasia": {
    fen: "8/4N1pk/8/8/8/R7/8/6K1 w - - 0 1",
    solution: ["a3h3"],
    outcome: "mate",
  },
  "mat-boden": {
    fen: "2kr4/3p4/8/8/5B2/8/4B3/6K1 w - - 0 1",
    solution: ["e2a6"],
    outcome: "mate",
  },
  "fin-square": {
    fen: "7k/8/8/p7/8/8/8/5K2 w - - 0 1",
    solution: ["f1e2", "a5a4", "e2d2", "a4a3", "d2c2", "a3a2", "c2b2"],
  },
  "fin-opposition": {
    fen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
    solution: ["e6d6", "e8d8", "e5e6", "d8e8", "e6e7", "e8f7", "d6d7"],
  },
  "fin-lucena": {
    fen: "1K6/1P2k3/8/8/8/8/2r5/3R4 w - - 0 1",
    solution: [
      "d1d4",
      "c2c1",
      "b8a7",
      "c1a1",
      "a7b6",
      "a1b1",
      "b6c6",
      "b1c1",
      "c6b5",
      "c1b1",
      "d4b4",
    ],
  },
  "fin-philidor": {
    fen: "4k3/7R/1r6/3KP3/8/8/8/8 b - - 0 1",
    solution: ["b6a6", "e5e6", "a6a1"],
  },
};
const openings = {
  "ouv-white-italian": [
    "e4",
    "e5",
    "Nf3",
    "Nc6",
    "Bc4",
    "Bc5",
    "c3",
    "Nf6",
    "d3",
    "d6",
    "O-O",
    "O-O",
    "Re1",
    "a6",
    "Bb3",
    "Ba7",
    "h3",
  ],
  "ouv-black-e5": [
    "e4",
    "e5",
    "Nf3",
    "Nc6",
    "Bc4",
    "Bc5",
    "d3",
    "Nf6",
    "O-O",
    "d6",
    "Nc3",
    "O-O",
  ],
  "ouv-black-d5": [
    "d4",
    "d5",
    "c4",
    "e6",
    "Nc3",
    "Nf6",
    "Bg5",
    "Be7",
    "e3",
    "O-O",
    "Nf3",
    "h6",
    "Bh4",
    "b6",
  ],
  "ouv-early-traps": ["e4", "e5", "Qh5", "Nc6", "Bc4", "Nf6", "Qxf7#"],
  "ouv-principles": [
    "e4",
    "e5",
    "Nf3",
    "Nc6",
    "Bc4",
    "Bc5",
    "d3",
    "Nf6",
    "O-O",
  ],
};
for (const [id, line] of Object.entries(openings)) {
  const g = new Chess();
  const uci = line.map((s) => {
    const m = g.move(s);
    return m.from + m.to + (m.promotion || "");
  });
  knownExamples[id] = {
    fen: new Chess().fen(),
    solution: uci,
    mode: "opening",
    outcome: id === "ouv-early-traps" ? "mate" : undefined,
  };
}
const domain = {
  vis: "vision",
  proc: "réflexes",
  tac: "tactique",
  mat: "mats",
  fin: "finales",
  ouv: "ouvertures",
  str: "stratégie",
  meta: "méthode",
};
const catalogue = [];
for (const [, id, title, body] of sections) {
  const f = fields(body),
    meta = f["Méta"] || "",
    prereqPart = meta.split("·")[2] || "";
  const entry = {
    id,
    title,
    tier: Number(/palier (\d)/.exec(meta)?.[1] || 0),
    priority: /· ([SABC]) ·/.exec(meta)?.[1] || "B",
    domain: domain[id.split("-")[0]],
    prerequisites: [...prereqPart.matchAll(/`([^`]+)`/g)].map((m) => m[1]),
    principle: clean(f["Principe"] || ""),
    why: split(f["Pourquoi"] || ""),
    signals: split(f["Signaux"] || ""),
    method: split(byPrefix(f, "Méthode")),
    pitfall: { text: clean(byPrefix(f, "Piège")), fen: null, line: [] },
    entryChallenge: null,
    guided: [],
    lichessThemes: [],
    ratingBand: [400, 2200],
    mastery: {
      attempts: 15,
      accuracy: 0.8,
      distinctDays: 2,
      description: clean(
        f["Maîtrise"] ||
          "80 % sur 15 problèmes inédits, sur deux jours différents.",
      ),
    },
    sources: [],
    videoId: Object.keys(videoMap).find((k) => videoMap[k] === id)
      ? "course-" + Object.keys(videoMap).find((k) => videoMap[k] === id)
      : null,
    glossary: [],
    audio: null,
    screens: [],
    examples: [],
  };
  const tagsPart = meta.split(/tags |tag Lichess /)[1] || "";
  entry.lichessThemes = [...tagsPart.matchAll(/`([^`]+)`/g)]
    .map((m) => m[1])
    .filter((t) => !t.includes("-") && !["mix", "opening"].includes(t));
  if (tagsPart.includes("`opening`")) entry.lichessThemes.push("opening");
  if (!entry.lichessThemes.length)
    entry.drill = id.startsWith("str-")
      ? "plan-choice"
      : id.startsWith("fin-") || id.startsWith("mat-basic")
        ? "endgame"
        : id.startsWith("meta-")
          ? "game-review"
          : id === "vis-notation"
            ? "coordinates"
            : id === "vis-values"
              ? "material"
              : id === "vis-rules"
                ? "rules"
                : "board-observation";
  if (id === "proc-forcing-moves") entry.drill = "mixed";
  for (const [heading, text] of Object.entries(f)) {
    if (
      ["Méta", "Maîtrise"].includes(heading) ||
      heading.startsWith("Exemple") ||
      heading.startsWith("Ligne")
    )
      continue;
    for (const content of chunks(text))
      entry.screens.push({
        title: heading.replace(/\s*\(.*/, ""),
        text: content,
        audio: null,
      });
  }
  for (const m of body.matchAll(
    /`([prnbqkPRNBQK1-8/]+ [wb] [KQkq-]+ [a-h1-8-]+ \d+ \d+)`/g,
  )) {
    const fen = m[1],
      g = new Chess(fen);
    entry.examples.push({
      fen,
      outcome: g.isCheckmate() ? "mate" : g.isStalemate() ? "stalemate" : null,
      source: "CURRICULUM.md",
    });
  }
  if (knownExamples[id]) {
    const ex = knownExamples[id];
    entry.entryChallenge = {
      fen: ex.fen,
      solution: ex.solution,
      prompt:
        (ex.fen.split(" ")[1] === "w"
          ? "Trait aux blancs. "
          : "Trait aux noirs. ") +
        (ex.mode === "opening"
          ? "Développe tes pièces en contrôlant le centre."
          : "Trouve le coup qui applique ce principe."),
      outcome: ex.outcome || null,
      mode: ex.mode || "move",
      source: "CURRICULUM.md",
    };
    entry.guided = ex.solution.map((move, i) => ({
      move,
      text: "",
      arrows: [[move.slice(0, 2), move.slice(2, 4)]],
      marks: [],
    }));
    if (ex.pitfall) Object.assign(entry.pitfall, ex.pitfall);
  }
  catalogue.push(entry);
}
const ids = new Set(catalogue.map((e) => e.id));
for (const e of catalogue) {
  if (e.id === "str-plan-making")
    e.prerequisites = catalogue
      .filter(
        (x) => x.id !== e.id && x.id.startsWith("str-") && x.priority === "A",
      )
      .map((x) => x.id);
  e.prerequisites = e.prerequisites.filter((x) => ids.has(x));
}
fs.mkdirSync("curriculum/entries", { recursive: true });
for (const e of catalogue)
  fs.writeFileSync(
    `curriculum/entries/${e.id}.json`,
    JSON.stringify(e, null, 2) + "\n",
  );
fs.writeFileSync(
  "curriculum/index.json",
  JSON.stringify(
    catalogue.map(
      ({
        id,
        title,
        tier,
        priority,
        domain,
        prerequisites,
        principle,
        drill,
      }) => ({
        id,
        title,
        tier,
        priority,
        domain,
        prerequisites,
        principle,
        drill,
      }),
    ),
    null,
    2,
  ) + "\n",
);
fs.writeFileSync(
  "curriculum/legacy-map.json",
  JSON.stringify(aliases, null, 2) + "\n",
);
console.log(
  `${catalogue.length} fiches extraites sans ajout de texte pédagogique.`,
);
