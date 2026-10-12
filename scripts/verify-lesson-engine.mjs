import fs from "node:fs";
import crypto from "node:crypto";
import { nodeEngine } from "./engine-node.mjs";
const supplied = process.argv.includes("--supplied"),
  entries = supplied
    ? JSON.parse(fs.readFileSync("curriculum-v2.json", "utf8")).fiches
    : JSON.parse(fs.readFileSync("curriculum/index.json")).map((e) =>
        JSON.parse(fs.readFileSync("curriculum/entries/" + e.id + ".json")),
      );
fs.mkdirSync(".cache", { recursive: true });
const file = ".cache/curriculum-engine.json";
let cache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
const engine = await nodeEngine();
const findings = [];
let n = 0;
for (const e of entries)
  for (const [index, c] of [e.challenge, ...(e.exercises || [])].entries()) {
    if (!c || c.kind === "square" || c.check === "rule") continue;
    const key = crypto
      .createHash("sha256")
      .update(c.fen + "|16|10")
      .digest("hex");
    let r = cache[key];
    if (!r) {
      r = await engine.search(c.fen, { depth: 16, multiPV: 10 });
      cache[key] = r;
      fs.writeFileSync(file, JSON.stringify(cache));
    }
    const vs = r.variations;
    const best = vs[0],
      cut =
        best.type === "cp"
          ? best.score - Math.max(60, 0.15 * Math.abs(best.score))
          : null;
    const good = vs
      .filter((v) =>
        best.type === "mate"
          ? v.type === "mate" && v.score > 0
          : (v.type === "mate" && v.score > 0) ||
            (v.type === "cp" && v.score >= cut),
      )
      .map((v) => v.line[0]);
    const forced = [];
    for (const m of (c.accept || [c.solution[0]]).filter(
      (m) => !good.includes(m),
    )) {
      const fk = key + ":" + m;
      let v = cache[fk];
      if (!v) {
        v = await engine.search(c.fen, { depth: 16, searchmoves: [m] });
        cache[fk] = v;
        fs.writeFileSync(file, JSON.stringify(cache));
      }
      forced.push({ move: m, ...v });
      if (
        best.type === "mate"
          ? v.type === "mate" && v.score > 0
          : (v.type === "mate" && v.score > 0) ||
            (v.type === "cp" && v.score >= cut)
      )
        good.push(m);
    }
    const invalid = (c.accept || [c.solution[0]]).filter(
      (m) => !good.includes(m),
    );
    findings.push({
      id: e.id,
      index,
      fen: c.fen,
      check: c.check,
      accept: c.accept,
      good,
      invalid,
      forced,
      depth: r.depth,
      best,
    });
    console.log(
      ++n,
      e.id,
      index,
      invalid.length ? "CHECK " + invalid.join(",") : "OK",
    );
  }
fs.writeFileSync(
  "docs/ton-engine-" + (supplied ? "supplied" : "all") + ".json",
  JSON.stringify(findings, null, 2),
);
console.log(
  "DONE",
  findings.length,
  findings.filter((x) => x.invalid.length).length,
  "to inspect",
);

if (findings.some((x) => x.invalid.length)) process.exitCode = 1;
