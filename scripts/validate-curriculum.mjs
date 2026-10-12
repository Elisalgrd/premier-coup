import fs from "node:fs";
import { validateEntry } from "./curriculum-rules.mjs";
const read = (p) =>
    JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "")),
  index = read("curriculum/index.json"),
  all = index.map((e) => read("curriculum/entries/" + e.id + ".json")),
  glossary = read("curriculum/glossary.json");
let errors = [],
  positions = 0,
  moves = 0;
function walk(id, path = []) {
  if (path.includes(id)) throw Error("Cycle : " + [...path, id].join(" > "));
  const e = all.find((x) => x.id === id);
  if (!e) throw Error("Prérequis inconnu " + id);
  for (const p of e.prerequisites) walk(p, [...path, id]);
}
for (const e of all) {
  try {
    walk(e.id);
    const r = validateEntry(e, all, glossary);
    errors.push(...r.errors);
    positions += r.positions;
    moves += r.moves;
  } catch (err) {
    errors.push(e.id + ": " + err.message);
  }
}
if (new Set(all.map((e) => e.id)).size !== 72 || all[0].id !== "vis-start")
  errors.push("72 fiches requises, avec vis-start en premier");
// Les noms techniques de variables ne sont pas des textes d’interface.
const forbiddenUi=/trait aux|\bpalier\s+[0-9]|Types à couvrir|Nuances à donner|Règles à enseigner|Exercices spécifiques|changent certaines positions|erreurs décisives|avantage significatif|gérer la position|améliorer sa structure/iu;
for(const dir of ['src/views','src/learn','src/play','src/vision'])for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.js'))){const source=fs.readFileSync(dir+'/'+file,'utf8');const found=source.match(forbiddenUi);if(found)errors.push(dir+'/'+file+' : formule interdite '+found[0]);}
if (errors.length) {
  fs.mkdirSync(".cache", { recursive: true });
  fs.writeFileSync(
    ".cache/ton-validation-errors.json",
    JSON.stringify(errors, null, 2),
  );
  console.error(errors.slice(0, 25).join("\n"));
  console.error(
    errors.length + " erreurs, détail dans .cache/ton-validation-errors.json",
  );
  process.exitCode = 1;
} else
  console.log(
    `${all.length} fiches, ${positions} positions, ${moves} demi-coups. Textes courts, jargon introduit, démonstrations commentées.`,
  );
