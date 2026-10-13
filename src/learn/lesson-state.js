import { Chess } from "../chess/chess.js";
import { moveUci } from "../chess/notation.js";
import { courseFor } from "./daily-courses.js";
export function lessonStages(e) {
  const course = courseFor(e);
  return [
    { key: "objective", kind: "screen", data: { title: course.goal, text: course.why, boardless: true, step: "intro" } },
    ...e.screens
      .filter((s) => s.text)
      .map((s, i) => ({ key: "screen:" + i, kind: "screen", data: s })),
    { key: "quiz", kind: "quiz", data: course },
    ...(e.challenge ? [{ key: "challenge", kind: "challenge", data: e.challenge }] : []),
    ...(e.exercises || []).map((c, i) => ({
      key: "exercise:" + i,
      kind: "exercise",
      data: c,
    })),
    ...(e.id !== "vis-start" && (e.lichessThemes?.length || e.drill)
      ? [{ key: "practice", kind: "practice" }]
      : []),
    {
      key: "retain",
      kind: "retain",
      data: { text: course.transfer, fen: e.screens[0]?.fen },
    },
  ];
}
export class LessonRun {
  constructor(c, saved = {}) {
    this.c = c;
    this.index = saved.index || 0;
    this.game = new Chess(c.fen);
    if (c.kind !== "square")
      for (const m of c.solution.slice(0, this.index)) moveUci(this.game, m);
    if (saved.fen) this.game.load(saved.fen);
    this.errors = saved.errors || 0;
    this.helped = !!saved.helped;
    this.done = !!saved.done;
  }
  play(m) {
    if (this.done) return { ignored: true };
    if (this.c.kind === "square") {
      if (!(this.c.accept || this.c.solution).includes(m)) {
        this.errors++;
        return { wrong: true };
      }
      this.done = true;
      return { correct: true, done: true };
    }
    const g = new Chess(this.game.fen());
    let made;
    try {
      made = moveUci(g, m);
    } catch {
      return { illegal: true };
    }
    const accept =
      this.index === 0
        ? this.c.accept || [this.c.solution[0]]
        : [this.c.solution[this.index]];
    if (!accept.includes(m)) {
      if (this.index === 0 && this.c.alsoGood?.includes(m))
        return { alsoGood: true };
      this.errors++;
      return { wrong: true, fen: g.fen(), made };
    }
    this.game = g;
    this.index++;
    this.done = this.index >= this.c.solution.length;
    return { correct: true, done: this.done, fen: g.fen(), made };
  }
  reply() {
    if (this.done || this.index % 2 === 0) return null;
    const move = this.c.solution[this.index++],
      made = moveUci(this.game, move);
    this.done = this.index >= this.c.solution.length;
    return { move, made, fen: this.game.fen() };
  }
  snapshot() {
    return {
      index: this.index,
      fen: this.game.fen(),
      errors: this.errors,
      helped: this.helped,
      done: this.done,
    };
  }
}
