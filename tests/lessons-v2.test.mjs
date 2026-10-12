import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Chess } from "../src/chess/chess.js";
import { moveUci, describeMove } from "../src/chess/notation.js";
import { lessonStages, LessonRun } from "../src/learn/lesson-state.js";
import { rememberPrinciple } from "../src/learn/srs.js";
import { emptyState, validateState } from "../src/state/schema.js";
import { assertPosition, validateEntry } from "../scripts/curriculum-rules.mjs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const entry = (id) => read("curriculum/entries/" + id + ".json");
test("lesson stages keep each board and skip absent stages", () => {
  const e = entry("vis-start"),
    stages = lessonStages(e);
  assert.equal(stages.length, e.screens.length + e.exercises.length + 1);
  assert.equal(stages[0].data, e.screens[0]);
  assert.equal(stages.at(-1).data.text, e.retenir);
  assert.equal(
    stages.some((s) => s.kind === "practice" || s.kind === "challenge"),
    false,
  );
  const fork = entry("tac-fork");
  assert.equal(
    lessonStages(fork).length,
    1 + fork.screens.length + fork.exercises.length + 2,
  );
});
test("a multi-move answer resumes before and after the opponent response", () => {
  const c = entry("tac-fork").challenge,
    run = new LessonRun(c);
  assert.equal(run.play(c.solution[0]).correct, true);
  const pending = new LessonRun(c, run.snapshot());
  assert.equal(pending.reply().move, c.solution[1]);
  const restored = new LessonRun(c, pending.snapshot());
  assert.equal(restored.play(c.solution[2]).done, true);
  const g = new Chess(c.fen);
  for (const m of c.solution) moveUci(g, m);
  assert.equal(restored.game.fen(), g.fen());
});
test("all accepted alternatives work and other good moves do not count as errors", () => {
  const c = {
      kind: "move",
      fen: new Chess().fen(),
      solution: ["e2e4"],
      accept: ["e2e4", "d2d4"],
      alsoGood: ["g1f3"],
    },
    r = new LessonRun(c);
  assert.deepEqual(r.play("g1f3"), { alsoGood: true });
  assert.equal(r.errors, 0);
  assert.equal(r.game.fen(), c.fen);
  assert.equal(r.play("a2a3").wrong, true);
  assert.equal(r.errors, 1);
  assert.equal(r.game.fen(), c.fen);
  assert.equal(r.play("d2d4").done, true);
  assert.equal(r.game.get("d4").type, "p");
});
test("square answers support all accepted squares and preserve help on reload", () => {
  const c = {
    kind: "square",
    fen: new Chess().fen(),
    solution: ["e2"],
    accept: ["e2", "d2"],
  };
  const r = new LessonRun(c);
  r.play("e3");
  r.play("e4");
  r.helped = true;
  const restored = new LessonRun(c, r.snapshot());
  assert.equal(restored.errors, 2);
  assert.ok(restored.helped);
  assert.ok(restored.play("d2").done);
});
test("backup keeps the lesson cursor, move sequence, and existing mastery", () => {
  const s = emptyState();
  s.entries["tac-fork"] = {
    masteredAt: "2026-10-01",
    lesson: {
      version: 2,
      key: "exercise:1",
      demo: 2,
      run: { index: 1, errors: 2, fen: entry("tac-fork").challenge.fen },
    },
  };
  assert.deepEqual(validateState(s).entries, s.entries);
});
test("new retain card refreshes text without resetting scheduled reviews", () => {
  const s = emptyState(),
    e = entry("tac-fork");
  s.cards["principle:tac-fork"] = {
    id: "principle:tac-fork",
    box: 4,
    due: "2026-11-01",
    attempts: 8,
    principle: "Ancien texte",
  };
  rememberPrinciple(s, e);
  const c = s.cards["principle:tac-fork"];
  assert.equal(c.box, 4);
  assert.equal(c.due, "2026-11-01");
  assert.equal(c.principle, e.retenir);
  rememberPrinciple(s, entry("ouv-white-italian"));
  assert.ok(
    Object.values(s.cards).filter((c) => c.type === "opening").length >= 4,
  );
});
test("validation rejects impossible boards, missing boards/comments, jargon and false mates", () => {
  assert.throws(
    () => assertPosition("4k3/8/8/8/8/8/4R3/4K3 w - - 0 1"),
    /déjà attaqué/,
  );
  const base = {
    id: "vis-start",
    prerequisites: [],
    introduces: [],
    screens: [],
    exercises: [],
    retenir: "Regarde le roi.",
  };
  const errors = (s) => {
    const e = { ...base, screens: [s] };
    return validateEntry(
      e,
      [e],
      [{ term: "fourchette", aliases: ["fourchette"] }],
    ).errors.join("\n");
  };
  assert.match(errors({ text: "Observe." }), /position manquante/);
  assert.match(
    errors({ fen: new Chess().fen(), text: "Trait aux blancs." }),
    /interdit/,
  );
  assert.match(
    errors({ fen: new Chess().fen(), text: "Une fourchette." }),
    /terme non introduit/,
  );
  assert.match(
    errors({ fen: new Chess().fen(), text: "Voici un mat." }),
    /mat annoncé incorrect/,
  );
  assert.match(
    errors({ fen: new Chess().fen(), text: "C’est pat." }),
    /pat annoncé incorrect/,
  );
  assert.match(
    errors({
      fen: new Chess().fen(),
      text: "Observe.",
      line: [{ uci: "e2e4" }],
    }),
    /sans commentaire/,
  );
  assert.match(
    errors({
      fen: new Chess().fen(),
      text: Array(71).fill("Regarde").join(" "),
    }),
    /70 mots/,
  );
});
test("engine report covers every move challenge with depth 16 and accepted answers", () => {
  const audit = read("docs/ton-engine-all.json");
  let n = 0;
  for (const item of read("curriculum/index.json")) {
    const e = entry(item.id);
    for (const [index, c] of [e.challenge, ...e.exercises].entries()) {
      if (!c || c.kind === "square" || c.check === "rule") continue;
      const a = audit.find(
        (a) => a.id === e.id && a.index === index && a.fen === c.fen,
      );
      assert.ok(a, e.id);
      assert.ok(a.depth >= 16);
      assert.deepEqual(a.invalid, []);
      for (const move of c.accept)
        assert.ok(a.good.includes(move), e.id + move);
      for (const move of a.good)
        assert.ok(c.accept.includes(move) || c.alsoGood.includes(move));
      n++;
    }
  }
  assert.equal(n, 107);
});
test("move explanation names pieces, captures, castling and promotion in plain French", () => {
  const g = new Chess();
  assert.match(describeMove(moveUci(g, "e2e4")), /pion de e2 à e4/);
  const castle = new Chess("4k3/8/8/8/8/8/8/4K2R w K - 0 1");
  assert.match(describeMove(moveUci(castle, "e1g1")), /roi va de e1 à g1/);
});
