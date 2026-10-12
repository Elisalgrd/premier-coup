import fs from "node:fs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const findings = read("docs/ton-engine-all.json");
let count = 0;
for (const item of read("curriculum/index.json")) {
  const path = "curriculum/entries/" + item.id + ".json",
    e = read(path);
  for (const [index, c] of [e.challenge, ...e.exercises].entries()) {
    if (!c || c.kind === "square" || c.check === "rule") continue;
    const audit = findings.find(
      (a) => a.id === e.id && a.index === index && a.fen === c.fen,
    );
    if (
      !audit ||
      audit.invalid.length ||
      audit.depth < 16 ||
      c.accept.some((m) => !audit.good.includes(m))
    )
      throw Error(e.id + ": vérification moteur absente ou périmée");
    c.alsoGood = [...new Set([...(c.alsoGood || []), ...audit.good])].filter(
      (m) => !c.accept.includes(m),
    );
    count++;
  }
  const c = e.challenge || e.exercises[0] || e.review;
  if (c) e.entryChallenge = { ...c, mode: c.kind };
  fs.writeFileSync(path, JSON.stringify(e, null, 2) + "\n");
}
console.log(
  count +
    " défis et exercices : les autres bons coups ne comptent pas comme erreurs.",
);
