import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Chess } from "../src/chess/chess.js";
import { moveUci } from "../src/chess/notation.js";
import { boardHtml } from "../src/chess/board.js";
import { Engine } from "../src/chess/engine.js";
import { analyzeGame } from "../src/chess/analysis.js";
import { beginnerMove } from "../src/chess/beginner.js";
import { emptyState, validateState } from "../src/state/schema.js";
import { rememberMistake, dueCards } from "../src/learn/srs.js";
import { coachMessage, LiveCoach, coachSummary, materialLoss } from "../src/play/live-coach.js";
import { timeControls, applyIncrement, takebackCount, takeback } from "../src/play/training-game.js";
import { sessionPlan } from "../src/learn/session.js";

const fixtures = JSON.parse(fs.readFileSync("tests/fixtures/mistakes.json"));
const hanging = fixtures[2];
const beforeOf = (f) => ({ ...f.before, best: f.best, line: [f.best] });
const messageOf = (f) => coachMessage(f.fen, f.played, beforeOf(f), f.after);
test("coach explains a hanging piece, fork, missed mate, free capture and ignores good moves", () => {
  const message = messageOf(hanging);
  assert.equal(message.label, "Pièce laissée en prise");
  assert.match(message.risk, /prend ton fou/);
  assert.match(message.risk, /ne peux pas reprendre/);
  assert.doesNotMatch(message.risk, /environ la valeur/);
  const fork = messageOf({
    fen: "7k/8/8/8/2n5/8/8/1Q3R1K w - - 0 1", played: "h1h2", best: "f1f8",
    before: { type: "cp", score: 0 }, after: { type: "cp", score: 300, line: ["c4d2"] },
  });
  assert.equal(fork.label, "Fourchette subie");
  assert.match(fork.risk, /cavalier/);
  assert.match(fork.risk, /deux des tiennes/);
  const mate = messageOf(fixtures[5]);
  assert.equal(mate.label, "Mat raté");
  assert.match(mate.better, /aucune défense légale/);
  const free = messageOf({
    fen: "6k1/8/8/3r4/8/8/8/3Q2K1 w - - 0 1", played: "g1f1", best: "d1d5",
    before: { type: "cp", score: 500 }, after: { type: "cp", score: 500, line: ["d5d1"] },
  });
  assert.equal(free.label, "Capture gratuite ratée");
  assert.match(free.opportunity, /sans reprise immédiate/);
  for (const m of [message, fork, mate, free]) {
    assert.doesNotMatch(m.risk + m.better, /centipion|\bcp\b|\+\d\.\d/);
    const game = new Chess(m.fen);
    for (const move of m.line) moveUci(game, move);
    assert.ok(m.line.length);
  }
  assert.equal(coachMessage(hanging.fen, hanging.best, beforeOf(hanging), hanging.after), null);
  assert.equal(coachMessage(hanging.fen, hanging.played, beforeOf(hanging), { type: "cp", score: 20 }), null);
  assert.equal(materialLoss(100), "environ la valeur d’un pion");
  assert.equal(materialLoss(500), "environ la valeur d’une tour");
});
test("coach and final analysis create one review card and preserve its learning history", async () => {
  const state = emptyState(), m = { ...messageOf(hanging), ply: 1 };
  rememberMistake(state, "game1", m);
  state.cards["mistake:game1:1"].attempts = 2;
  let searches = 0;
  const record = { id: "game1", initialFen: m.fen, color: "w", moves: [m.played] };
  await analyzeGame(record, { search: async () => searches++ === 0 ? beforeOf(hanging) : hanging.after }, { state });
  assert.equal(record.analysis.moments.length, 1);
  assert.equal(Object.keys(state.cards).length, 1);
  assert.equal(state.cards["mistake:game1:1"].attempts, 2);
});
test("coach prefetch is cached, mobile analysis capped, and its engine never belongs to the opponent", async () => {
  const searches = [], opponent = new Engine();
  const engine = { search: async (fen, options) => { searches.push({ fen, options }); return fen === hanging.fen ? beforeOf(hanging) : hanging.after; }, close() {} };
  const coach = new LiveCoach({ mobile: true, engineFactory: () => engine });
  await coach.prepare(hanging.fen);
  const m = await coach.afterMove(hanging.fen, hanging.played);
  assert.equal(searches.length, 2);
  assert.equal(searches[0].options.depth, 12);
  assert.equal(searches[0].options.maxTime, 700);
  assert.notEqual(coach.engine, opponent);
  assert.equal(m.label, hanging.expected);
  coach.close(); opponent.close();
});
test("off, blunders only, failure and a late closed response are quiet", async () => {
  const off = new LiveCoach({ mode: "off", engineFactory() { throw Error("should not load"); } });
  assert.equal(await off.afterMove(hanging.fen, hanging.played), null);
  const failed = new LiveCoach({ engineFactory() { throw Error("worker crash"); } });
  const game = new Chess(hanging.fen);
  const pending = failed.afterMove(game.fen(), hanging.played);
  moveUci(game, hanging.played);
  moveUci(game, beginnerMove(game, 1, () => 0.2));
  assert.equal(game.history().length, 2);
  assert.equal(await pending, null);
  const blunders = new LiveCoach({ mode: "blunders", engineFactory: () => ({ search: async (fen) => fen === hanging.fen ? beforeOf(hanging) : { ...hanging.after, score: 100 }, close() {} }) });
  assert.equal(await blunders.afterMove(hanging.fen, hanging.played), null);
  let resolve;
  const delayed = new LiveCoach({ engineFactory: () => ({ search: () => new Promise((r) => resolve = r), close() { resolve?.(beforeOf(hanging)); } }) });
  const prefetch = delayed.prepare(hanging.fen);
  delayed.close();
  await prefetch;
  assert.equal(await delayed.afterMove(hanging.fen, hanging.played), null);
});
test("takeback rewinds only the current mistake and at most its reply, restores clocks and comments", () => {
  for (const reply of [false, true]) {
    const game = new Chess(), fen = game.fen(), time = { w: 910, b: 910 };
    game.move("e4"); if (reply) game.move("e5");
    const alert = { fen, played: "e2e4", ply: 1, timeBefore: { w: 899, b: 900 } };
    assert.equal(takebackCount(game, alert, "all", 0), reply ? 2 : 1);
    assert.equal(takebackCount(game, alert, "blunders", 0), 0);
    assert.equal(takebackCount(game, alert, "all", 3), 0);
    assert.equal(takeback(game, alert, { mode: "all", used: 0, time }), true);
    assert.equal(game.fen(), fen);
    assert.deepEqual(time, alert.timeBefore);
    game.move("d4");
    assert.match(game.pgn(), /\{coup repris\}/);
    assert.equal(takebackCount(game, alert, "all", 1), 0);
  }
  const game = new Chess(), fen = game.fen();
  for (const move of ["e4", "e5", "Nf3"]) game.move(move);
  assert.equal(takebackCount(game, { fen, played: "e2e4", ply: 1 }, "all", 0), 0);
});
test("increment, settings and alerts survive backup; next day reviews keep game mistakes first after teaching", () => {
  assert.equal(timeControls[0].id, "15+10");
  assert.ok(timeControls.some((t) => t.id === "10+5"));
  const time = { w: 1, b: 3 };
  applyIncrement(time, "w", 10); applyIncrement(time, "b", 5);
  assert.deepEqual(time, { w: 11, b: 8 });
  const state = emptyState(), m = { ...messageOf(hanging), ply: 1 };
  state.preferences.liveCoach = "blunders";
  state.activeGame = { liveCoach: "all", alerts: [m, m], takebacks: 2, increment: 10, time };
  const restored = validateState(state);
  assert.equal(restored.activeGame.takebacks, 2);
  assert.equal(restored.activeGame.increment, 10);
  assert.equal(restored.preferences.liveCoach, "blunders");
  assert.equal(coachSummary(restored.activeGame.alerts).repeated.count, 2);
  state.cards = { "mistake:g:1": { id: "mistake:g:1", type: "mistake", due: "2026-10-12" }, p: { id: "p", type: "puzzle", due: "2026-10-11" } };
  const entries = JSON.parse(fs.readFileSync("curriculum/index.json"));
  assert.equal(dueCards(state, "2026-10-12")[0].type, "mistake");
  assert.equal(sessionPlan(state, entries, "2026-10-12").tasks.find(t => t.kind === "reviews").cards[0], "mistake:g:1");
});
test("red and green annotations can coexist while the main board stays interactive", () => {
  const game = new Chess(hanging.fen);
  const html = boardHtml(game, { interactive: false, arrows: [["g1", "f1", "good"], ["a8", "a4", "danger"]] });
  assert.match(html, /class="good-arrow"/);
  assert.match(html, /class="danger-arrow"/);
  assert.doesNotMatch(boardHtml(game, { interactive: true }), /disabled/);
});
