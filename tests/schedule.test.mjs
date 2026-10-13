import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { emptyState } from "../src/state/schema.js";
import { addCard, gradeCard, dueCards, intervals } from "../src/learn/srs.js";
import { sessionPlan } from "../src/learn/session.js";
const entries = JSON.parse(fs.readFileSync("curriculum/index.json"));
test("Leitner calendar boundaries, lapse and maximum box", () => {
  const s = emptyState();
  addCard(s, { id: "x", type: "principle" }, "2026-01-31");
  assert.equal(s.cards.x.due, "2026-02-01");
  gradeCard(s, "x", true, "2026-02-01");
  assert.equal(s.cards.x.due, "2026-02-04");
  gradeCard(s, "x", false, "2026-02-04");
  assert.equal(s.cards.x.box, 0);
  assert.equal(s.cards.x.due, "2026-02-05");
  for (let i = 0; i < 10; i++) gradeCard(s, "x", true, "2026-02-05");
  assert.equal(s.cards.x.box, 5);
  assert.equal(s.cards.x.due, "2026-05-06");
});
test("due queue prioritises game mistakes, then failed puzzles; cards deduplicated", () => {
  const s = emptyState();
  for (const [id, type] of [
    ["a", "principle"],
    ["b", "puzzle"],
    ["c", "mistake"],
  ])
    addCard(s, { id, type }, "2026-10-10");
  addCard(s, { id: "c", type: "mistake" }, "2026-10-11");
  assert.deepEqual(
    dueCards(s, "2026-10-12").map((c) => c.id),
    ["c", "b", "a"],
  );
  assert.equal(dueCards(s, "2026-10-10").length, 0);
});
test("15/25/45 minute plans teach first and preserve time and due-card priority", () => {
  for (const minutes of [15, 25, 45]) {
    const s = emptyState();
    s.preferences.minutes = minutes;
    for (let i = 0; i < 20; i++)
      addCard(s, { id: "m" + i, type: "mistake" }, "2026-10-10");
    const p = sessionPlan(s, entries, "2026-10-12");
    assert.equal(p.tasks[0].kind, "lesson");
    assert.equal(p.tasks[1].kind, "reviews");
    assert.ok(
      Math.abs(p.tasks.reduce((n, t) => n + t.minutes, 0) - minutes) < 0.01,
    );
    assert.equal(new Set(p.tasks[1].cards).size, p.tasks[1].cards.length);
    assert.equal(p.tasks.filter((t) => t.kind === "lesson").length, 1);
  }
});
test("a viewed notion no longer blocks a new daily course", () => {
  const s = emptyState();
  s.entries["tac-fork"] = { viewedAt: "2026-10-11" };
  assert.equal(
    sessionPlan(s, entries).tasks.find((t) => t.kind === "lesson").entryId,
    "ouv-principles",
  );
});
