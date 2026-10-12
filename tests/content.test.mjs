import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Chess, validateFen } from "../src/chess/chess.js";
import { moveUci } from "../src/chess/notation.js";
import { drillChallenges } from "../src/learn/drills.js";
test("every dedicated drill position and solution is legal", () => {
  let total = 0;
  for (const file of fs.readdirSync("curriculum/entries")) {
    const e = JSON.parse(fs.readFileSync("curriculum/entries/" + file));
    if (!e.drill) continue;
    const rows = drillChallenges(e);
    assert.ok(rows.length, e.id);
    for (const c of rows) {
      assert.ok(validateFen(c.fen).ok);
      const g = new Chess(c.fen);
      if (c.mode === "square")
        for (const sq of c.solution) assert.match(sq, /^[a-h][1-8]$/);
      else for (const move of c.solution) moveUci(g, move);
      total++;
    }
  }
  assert.ok(total > 300, "drill variants: " + total);
});
test("all retained videos are linked to catalogue entries and have captions", () => {
  const names = JSON.parse(fs.readFileSync("curriculum/videos.json")),
    linked = new Set();
  for (const file of fs.readdirSync("curriculum/entries"))
    for (const id of JSON.parse(fs.readFileSync("curriculum/entries/" + file))
      .videos || [])
      linked.add(id);
  for (const id of Object.keys(names)) {
    assert.ok(linked.has(id), id);
    assert.ok(fs.existsSync("videos/" + id + ".mp4"));
    assert.ok(fs.existsSync("videos/" + id + ".vtt"));
  }
});

test("catalogue preserves source order and full text search is separate", () => {
  const index = JSON.parse(fs.readFileSync("curriculum/index.json")),
    order = [
      ...fs.readFileSync("CURRICULUM.md", "utf8").matchAll(/^### `([^`]+)`/gm),
    ].map((m) => m[1]);
  assert.deepEqual(
    index.map((e) => e.id),
    order,
  );
  const search = JSON.parse(fs.readFileSync("curriculum/search.json"));
  assert.equal(Object.keys(search).length, 71);
  assert.ok(search["vis-rules"].includes("passant"));
});

test("strategy recognition bank has 180 distinct real positions per theme", () => {
  const manifest = JSON.parse(fs.readFileSync("data/drills/manifest.json"));
  assert.equal(Object.keys(manifest.entries).length, 8);
  for (const [id, meta] of Object.entries(manifest.entries)) {
    const rows = JSON.parse(fs.readFileSync("data/drills/" + meta.file));
    assert.equal(rows.length, 180, id);
    assert.equal(new Set(rows.map((r) => r.id)).size, 180);
    assert.equal(new Set(rows.map((r) => r.fen)).size, 180);
    for (const row of rows) {
      const g = new Chess(row.fen);
      assert.equal(g.isCheck(), false);
      assert.ok(row.solution.length);
      for (const s of row.solution) {
        assert.match(s, /^[a-h][1-8]$/);
        if (id === "str-pawn-structure" || id === "str-plan-making") {
          const p = g.get(s);
          assert.equal(p.type, "p");
          assert.equal(
            p.color,
            id === "str-pawn-structure"
              ? g.turn()
              : g.turn() === "w"
                ? "b"
                : "w",
          );
          assert.equal(
            g
              .board()
              .flat()
              .filter(Boolean)
              .some(
                (q) =>
                  q.type === "p" &&
                  q.color === p.color &&
                  Math.abs(q.square.charCodeAt(0) - s.charCodeAt(0)) === 1,
              ),
            false,
          );
        }
        if (id === "str-outposts" || id === "str-weak-squares")
          assert.equal(g.get(s), undefined);
      }
    }
  }
});
