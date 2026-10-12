import fs from "node:fs";
import { content, positions } from "./remaining-content.mjs";
import { Chess } from "../src/chess/chess.js";
import { moveUci } from "../src/chess/notation.js";
const json = (p) =>
    JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "")),
  write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
const metadata = json("curriculum-metadata.json"),
  supplied = json("curriculum-v2.json").fiches,
  original = [
    ...fs.readFileSync("CURRICULUM.md", "utf8").matchAll(/^### `([^`]+)`/gm),
  ].map((m) => m[1]),
  ids = ["vis-start", ...original.filter((id) => id !== "vis-start")];
const normalized = (s) => String(s).replaceAll("'", "’");
const clean = (v) =>
  typeof v === "string"
    ? normalized(v)
    : Array.isArray(v)
      ? v.map(clean)
      : v && typeof v === "object"
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]))
        : v;
const remaining = Object.values(content).map((c) => {
  const base = positions[c.id],
    g = new Chess(base.fen);
  let line = [];
  if (base.kind !== "square") {
    if (c.comments.length !== base.solution.length)
      throw Error(c.id + " commentaires manquants");
    line = base.solution.map((uci, i) => {
      moveUci(g, uci);
      return { uci, text: c.comments[i] };
    });
  }
  const challenge = {
    ...base,
    prompt: c.prompt || "",
    accept: [...base.solution.slice(0, base.kind === "square" ? undefined : 1)],
    alsoGood: [],
    hint:
      base.kind === "square"
        ? "Regarde la case " + base.solution[0] + "."
        : c.method,
    success: c.why,
  };
  const screens = [
    {
      step: "principe",
      title: c.title,
      text: c.definition,
      fen: base.fen,
      marks: base.kind === "square" ? base.solution : [],
    },
    {
      step: "methode",
      title: "Comment le voir ici",
      text: c.method,
      fen: base.fen,
      arrows:
        base.kind === "square"
          ? []
          : [[base.solution[0].slice(0, 2), base.solution[0].slice(2, 4)]],
    },
    ...(line.length
      ? [
          {
            step: "exemple",
            title: "Regarde chaque coup",
            text: c.comments[0],
            fen: base.fen,
            line,
          },
        ]
      : []),
    {
      step: "pourquoi",
      title: "Ce que cela change",
      text: c.why,
      fen: g.fen(),
    },
    {
      step: "piege",
      title: "Ce qu’il faut vérifier",
      text: c.pitfall,
      fen: base.fen,
    },
  ];
  let ex = { ...challenge };
  if (base.kind === "move" && base.solution.length >= 3) {
    const a = new Chess(base.fen);
    for (const m of base.solution.slice(0, 2)) moveUci(a, m);
    ex = {
      ...challenge,
      fen: a.fen(),
      solution: base.solution.slice(2),
      accept: [base.solution[2]],
      prompt: "La première réponse est jouée. " + c.comments[2],
      hint: "Regarde la pièce en " + base.solution[2].slice(0, 2) + ".",
    };
  }
  return {
    id: c.id,
    title: c.title,
    introduces: c.introduces || [],
    challenge: c.challenge === false ? null : challenge,
    screens,
    exercises: c.challenge === false ? [] : [ex],
    retenir: c.retenir,
    review: challenge,
  };
});
const sources = new Map([...supplied, ...remaining].map((e) => [e.id, e]));
// Corrections factuelles consignées dans docs/TON_CORRECTIONS.md ; les fichiers fournis restent intacts.
const blunder = sources.get("proc-blunder-check").screens[4];
blunder.text = blunder.text.replace(
  "la tour en e1 fait mat",
  "la tour en e8 peut descendre en e1 et faire mat",
);
blunder.line = [
  {
    uci: "e8e1",
    text: "La tour noire descend de e8 en e1. Ton roi est attaqué et ne peut plus être sauvé : échec et mat.",
  },
];
const count = sources.get("proc-exchange-count");
count.introduces.push("défenseur");
count.screens[1].text = count.screens[1].text.replace(
  "Puis celles qui la protègent",
  "Puis les défenseurs, les pièces qui la protègent",
);
const pin = sources.get("tac-pin");
pin.challenge = structuredClone(pin.exercises[0]);
pin.challenge.prompt =
  "Ta dame en e2 peut prendre le cavalier en e5. Le pion noir en d6 protège-t-il vraiment ce cavalier ?";
for (const s of sources.get("fin-opposition").screens) {
  for (const m of s.line || [])
    if (m.uci === "e6e7")
      m.text =
        "Le pion avance encore en e7. Le roi noir doit trouver une case libre.";
}
const remove = sources.get("tac-remove-defender");
const oldFen = "6k1/3r1ppp/5n2/1Q4B1/8/7P/5PP1/R5K1 w - - 0 1",
  newFen = "6k1/3r1pp1/5n1p/6B1/Q7/7P/5PP1/R5K1 w - - 0 1";
function repairDefender(v) {
  return typeof v === "string"
    ? v
        .replaceAll(oldFen, newFen)
        .replaceAll("b5d7", "a4d7")
        .replaceAll("en b5", "en a4")
    : Array.isArray(v)
      ? v.map(repairDefender)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.entries(v).map(([k, x]) => [k, repairDefender(x)]),
          )
        : v;
}
for (const key of ["challenge", "screens", "exercises"]) {
  if (Array.isArray(remove[key]))
    remove[key] = remove[key].map((x) =>
      x.fen === oldFen ? repairDefender(x) : x,
    );
  else if (remove[key]?.fen === oldFen)
    remove[key] = repairDefender(remove[key]);
}
for (const s of remove.screens.filter((s) => s.fen === newFen)) {
  s.arrows = s.arrows?.map((a) => a.map((sq) => (sq === "b5" ? "a4" : sq)));
}
const index = [],
  search = {};
for (const id of ids) {
  const src = clean(sources.get(id));
  for (const c of [src?.challenge, ...(src?.exercises || [])].filter(Boolean)) {
    c.kind ??= c.solution?.[0]?.length === 2 ? "square" : "move";
  }
  if (!src) throw Error("Fiche manquante " + id);
  const meta = metadata[id] || {
    id,
    tier: 0,
    priority: "S",
    prerequisites: [],
    lichessThemes: [],
    ratingBand: [400, 800],
    mastery: {},
    domain: "vision",
    drill: "tutorial",
  };
  const e = { ...meta, ...src, contentVersion: 2, principle: src.retenir };
  if (id === "vis-rules")
    e.prerequisites = [...new Set(["vis-start", ...e.prerequisites])];
  const c = e.challenge || e.exercises[0] || e.review;
  e.entryChallenge = c ? { ...c, mode: c.kind } : null;
  e.guided = [];
  e.examples = [];
  e.pitfall = {};
  write("curriculum/entries/" + id + ".json", e);
  const item = { ...meta, id, title: e.title, principle: e.retenir };
  index.push(item);
  search[id] = [
    e.title,
    e.retenir,
    ...e.screens.flatMap((s) => [
      s.title,
      s.text,
      ...(s.line || []).map((m) => m.text),
    ]),
  ]
    .join(" ")
    .toLowerCase();
}
write("curriculum/index.json", index);
write("curriculum/search.json", search);
console.log(index.length + " fiches au format pédagogique V2.");
