import fs from "node:fs";
import {
  glossaryMatcher,
  introducedTerms,
  wordCount,
} from "./curriculum-rules.mjs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8")),
  write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n"),
  index = read("curriculum/index.json"),
  all = index.map((e) => read("curriculum/entries/" + e.id + ".json")),
  words = read("curriculum/glossary.json"),
  terms = glossaryMatcher(words),
  changes = [];
const inline = {
  "case, colonne, rangée":
    "les petits carrés du plateau ; les colonnes sont verticales, les rangées horizontales",
  attaquer: "menacer une case que ta pièce surveille",
  "défendre, protéger": "pouvoir reprendre si l’adversaire prend cette pièce",
  "prendre, capturer": "aller sur la case adverse et retirer sa pièce",
  échange: "une prise suivie d’une reprise",
  plan: "une idée pour tes prochains coups",
  menace: "ce que l’adversaire pourrait faire de dangereux au prochain coup",
  défenseur: "la pièce qui protège une autre pièce ou une case",
  diagonale: "une ligne en biais, sur une seule couleur",
  finale: "la fin de partie avec peu de pièces",
  centre: "les quatre cases du milieu, d4, e4, d5 et e5",
  "case de fuite": "une case où le roi peut s’échapper",
  ouverture: "le début de la partie",
  échec: "une attaque contre le roi à laquelle il faut répondre",
};
for (const e of all) {
  e.introduces ??= [];
  for (const w of words.filter((w) => w.firstIn === e.id))
    if (!e.introduces.includes(w.term)) e.introduces.push(w.term);
  let known = introducedTerms(e, all);
  const nodes = [
    e.challenge,
    ...e.screens.flatMap((s) => [s, ...(s.line || [])]),
    ...(e.exercises || []),
    { text: e.retenir },
  ].filter(Boolean);
  for (const node of nodes)
    for (const key of ["prompt", "text", "hint", "success"])
      if (node[key])
        for (const w of terms(node[key])) {
          if (known.has(w.term)) continue;
          const alias = w.aliases.find((a) =>
            new RegExp(
              "(?<![\\p{L}])" +
                a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
                "s?(?![\\p{L}])",
              "iu",
            ).test(node[key]),
          );
          if (!alias) continue;
          const re = new RegExp(
              "(?<![\\p{L}])(" +
                alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
                "s?)(?![\\p{L}])",
              "iu",
            ),
            meaning =
              inline[w.term] ||
              w.definition
                .replace(/[.!]$/, "")
                .replace(/^./, (s) => s.toLowerCase());
          node[key] = node[key].replace(re, "$1 (" + meaning + ")");
          e.introduces.push(w.term);
          known.add(w.term);
          changes.push({ id: e.id, term: w.term, field: key });
        }
  // Une explication ajoutée peut nécessiter deux écrans : séparation aux frontières de phrases.
  e.screens = e.screens.flatMap((s) => {
    if (wordCount(s.text) <= 70) return [s];
    const sentences = s.text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/gu) || [
      s.text,
    ];
    let parts = [],
      part = "";
    for (const sentence of sentences) {
      if (wordCount(part + " " + sentence) > 70 && part) {
        parts.push(part.trim());
        part = "";
      }
      part += sentence;
    }
    if (part.trim()) parts.push(part.trim());
    return parts.map((text, i) => ({
      ...s,
      title: s.title + (i ? " (suite)" : ""),
      text,
      line: i === parts.length - 1 ? s.line : undefined,
    }));
  });
  e.principle = e.retenir;
  const c = e.challenge || e.exercises[0] || e.review;
  if (c) e.entryChallenge = { ...c, mode: c.kind };
  write("curriculum/entries/" + e.id + ".json", e);
}
const search = {};
for (const e of all) {
  const item = index.find((x) => x.id === e.id);
  item.prerequisites = e.prerequisites;
  item.principle = e.retenir;
  search[e.id] = [
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
write("docs/ton-inline-definitions.json", changes);
console.log(changes.length + " premières utilisations clarifiées.");
