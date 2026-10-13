import { videoResources, sourceResources } from "./media.js";
import { loadDrillChallenges } from "./drills.js";
import { lessonReceipt } from "./mastery.js";
import { startDrill } from "./drill-player.js";
import { rememberPrinciple } from "./srs.js";
import { Board } from "../chess/board.js";
import { Chess } from "../chess/chess.js";
import { moveUci, describeMove, pieceName } from "../chess/notation.js";
import { Engine } from "../chess/engine.js";
import { markViewed } from "../state/schema.js";
import { loadPuzzles } from "./puzzles.js";
import { pickPuzzles } from "./rating.js";
import { PuzzlePlayer } from "./puzzle-player.js";
import { lessonStages, LessonRun } from "./lesson-state.js";
import { esc, $, dateKey } from "../ui/helpers.js";
const labels = {
  intro: "Pour commencer",
  principe: "L’idée",
  pourquoi: "Pourquoi",
  signaux: "Quand y penser",
  methode: "Comment faire",
  méthode: "Comment faire",
  exemple: "Regarde les coups",
  piege: "À vérifier",
  piège: "À vérifier",
};
export class LessonPlayer {
  constructor(e, ctx, { onDone = null, sessionKey = null, practiceCount = 6 } = {}) {
    Object.assign(this, { e, ctx, onDone, sessionKey, practiceCount });
    this.stages = lessonStages(e);
    const previous = ctx.state.entries[e.id]?.lesson;
    const saved = !sessionKey || previous?.sessionKey === sessionKey || (previous?.sessionKey && !previous.finished) ? previous : null;
    this.step =
      saved?.version === 2 && !saved.finished
        ? Math.max(
            0,
            this.stages.findIndex((s) => s.key === saved.key),
          )
        : 0;
    this.restored = saved?.version === 2 ? saved : null;
    this.timers = new Set();
    this.disposed = false;
    this.turn = 0;
  }
  start(root) {
    this.root = root;
    this.show();
    return () => this.destroy();
  }
  wait(fn, ms = 550) {
    const t = setTimeout(() => {
      this.timers.delete(t);
      if (!this.disposed) fn();
    }, ms);
    this.timers.add(t);
  }
  clear() {
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    this.engine?.close();
    this.engine = null;
    this.turn++;
    this.busy = false;
  }
  save() {
    const r = (this.ctx.state.entries[this.e.id] ??= {});
    r.lesson = {
      version: 2,
      sessionKey: this.sessionKey,
      key: this.stages[this.step].key,
      step: this.step,
      demo: this.demoIndex || 0,
      run: this.run?.snapshot() || null,
      finished: !!this.finished,
    };
    this.ctx.save();
  }
  show() {
    this.clear();
    this.board?.destroy();
    this.sub?.destroy();
    this.sub = null;
    const stage = this.stages[this.step],
      c = stage.data || {},
      interactive = ["challenge", "exercise"].includes(stage.kind),
      saved = this.restored?.key === stage.key ? this.restored : null;
    this.restored = null;
    this.run = interactive ? new LessonRun(c, saved?.run) : null;
    this.demoIndex =
      stage.kind === "screen"
        ? Math.min(saved?.demo || 0, c.line?.length || 0)
        : 0;
    this.finished = false;
    this.save();
    const title =
      stage.kind === "challenge"
        ? "Applique ce que tu viens d’apprendre"
        : stage.kind === "quiz"
          ? "As-tu compris l’idée ?"
        : stage.kind === "exercise"
          ? "À toi de jouer"
          : stage.kind === "practice"
            ? "Retrouve l’idée ailleurs"
            : stage.kind === "retain"
              ? "À retenir"
              : c.title;
    this.root.innerHTML = `<a class="back-link" href="#catalogue">← Catalogue</a><header class="activity-header"><div><span class="eyebrow">${esc(this.e.title)} · ${this.step + 1} / ${this.stages.length}</span><h1>${esc(title)}</h1></div><button id="lesson-restart" class="text-link">Recommencer</button></header><progress class="lesson-progress" value="${this.step + 1}" max="${this.stages.length}" aria-label="Étape ${this.step + 1} sur ${this.stages.length}"></progress><div class="lesson-flow"><section class="lesson-explanation"><span class="eyebrow">${esc(labels[c.step] || (stage.kind === "exercise" ? "Exercice" : stage.kind === "challenge" ? "Exercice guidé" : ""))}</span><p class="prompt">${esc(interactive ? c.prompt : stage.kind === "practice" ? "Tu vas retrouver cette idée dans plusieurs positions. Les indices restent disponibles." : c.text || "")}</p></section>${!c.boardless && c.fen ? '<section class="lesson-board-panel"><div class="board-top"><div id="lesson-turn"></div><button id="lesson-flip" class="text-link">Retourner ↻</button></div><div id="active-board"></div><p class="demo-comment" id="lesson-notation" aria-live="polite"></p></section>' : ""}<section class="lesson-controls"><div id="lesson-feedback" role="status"></div>${c.line?.length ? '<div class="demo-controls"><button id="lesson-demo" class="button secondary">Voir la démonstration</button><button id="demo-back" class="text-link" hidden>← Coup précédent</button><button id="demo-next" class="button secondary" hidden>Coup suivant →</button><button id="demo-replay" class="text-link" hidden>Rejouer</button><span id="demo-count" class="muted"></span></div>' : ""}<div class="puzzle-actions">${interactive ? '<button class="button secondary" id="lesson-hint" hidden>Un indice</button><button class="button secondary" id="lesson-solution" hidden>Voir la solution</button>' : ""}${stage.kind === "practice" ? '<button class="button primary" id="lesson-practice">Commencer les problèmes →</button>' : ""}<button class="button primary" id="lesson-next" ${(stage.kind === "exercise" && !this.run.done) || stage.kind === "practice" ? "hidden" : ""}>${stage.kind === "challenge" ? "Continuer la pratique" : stage.kind === "retain" ? "Terminer la fiche" : "Continuer"} →</button>${this.step > 0 ? '<button class="text-link" id="lesson-back">← Explication précédente</button>' : ""}</div>${stage.kind === "retain" ? `<p class="muted">Cette fiche est conservée dans ton catalogue. Tes révisions t’aideront à retrouver l’idée sans aide.</p>${this.e.id.startsWith("fin-") || this.e.id.startsWith("ouv-") ? `<a class="text-link" href="#train/game/${this.e.id}">Jouer cette position →</a>` : ""}${videoResources(this.e, this.ctx.state.preferences)}${sourceResources(this.e)}` : ""}</section></div>`;
    if (c.fen && !c.boardless) {
      this.side = new Chess(
        interactive
          ? c.fen
          : this.e.challenge?.fen ||
            this.e.screens.find((s) => s.fen)?.fen ||
            c.fen,
      ).turn();
      this.board = new Board($("#active-board", this.root), {
        fen: this.run?.game.fen() || c.fen,
        flipped: this.side === "b",
        interactive: interactive && !this.run.done,
        arrows: c.arrows || [],
        marks: c.marks || [],
        onMove: (m) => this.answer(m),
        onSquare: c.kind === "square" ? (s) => this.answer(s) : null,
      });
      $("#lesson-flip", this.root).onclick = () => {
        this.board.options.flipped = !this.board.options.flipped;
        this.board.render();
      };
      this.updateTurn();
    }
    const phase = stage.kind === "retain" ? 3 : ["practice", "exercise", "challenge"].includes(stage.kind) ? 2 : stage.kind === "quiz" ? 1 : 0;
    $(".lesson-progress", this.root).insertAdjacentHTML("beforebegin", `<ol class="course-phases" aria-label="Les étapes du cours">${["Comprendre", "Quiz", "Pratiquer", "Retenir"].map((s,i) => `<li ${i === phase ? 'aria-current="step"' : ''}>${i+1}. ${s}</li>`).join("")}</ol>`);
    if (stage.key === "objective") $(".lesson-explanation", this.root).insertAdjacentHTML("beforeend", `<p>Tu vas regarder ${this.e.screens.filter(s => s.text).length} explications et exemples, vérifier ce que tu as compris, puis essayer sur l’échiquier.</p>${videoResources(this.e, this.ctx.state.preferences)}`);
    if (stage.kind === "quiz") {
      $(".prompt", this.root).textContent = c.question;
      $("#lesson-next", this.root).hidden = true;
      $("#lesson-feedback", this.root).innerHTML = `<div class="course-answers">${c.answers.map((answer,i) => `<button class="button secondary" data-answer="${i}">${esc(answer)}</button>`).join("")}</div><p id="quiz-reason" role="status"></p>`;
      for (const b of this.root.querySelectorAll("[data-answer]")) b.onclick = () => {
        const correct = Number(b.dataset.answer) === c.correct;
        $("#quiz-reason", this.root).textContent = (correct ? "Oui. " : "Pas tout à fait. ") + c.feedback;
        b.setAttribute("aria-pressed", "true");
        $("#lesson-next", this.root).hidden = !correct;
      };
    }
    $("#lesson-next", this.root).onclick = () => this.next();
    $("#lesson-restart", this.root).onclick = () => {
      this.step = 0;
      this.finished = false;
      this.show();
    };
    if ($("#lesson-back", this.root))
      $("#lesson-back", this.root).onclick = () => {
        this.step--;
        this.show();
      };
    if (interactive) {
      $("#lesson-hint", this.root).onclick = () => this.hint();
      $("#lesson-solution", this.root).onclick = () => this.solution();
      this.assistance();
      if (this.run.done) this.success(false);
      else if (this.run.index % 2) this.reply();
    }
    if (c.line?.length) {
      $("#lesson-demo", this.root).onclick = () => this.demo(1);
      $("#demo-next", this.root).onclick = () => this.demo(this.demoIndex + 1);
      $("#demo-back", this.root).onclick = () => this.demo(this.demoIndex - 1);
      $("#demo-replay", this.root).onclick = () => this.demo(0);
      if (this.demoIndex) this.demo(this.demoIndex, false);
    }
    if (stage.kind === "practice")
      $("#lesson-practice", this.root).onclick = () => this.practice();
    if (stage.kind === "retain") {
      markViewed(this.ctx.state, this.e.id);
      $(".lesson-controls", this.root).insertAdjacentHTML("afterbegin", lessonReceipt(this.ctx.state, this.e));
      rememberPrinciple(this.ctx.state, this.e);
      this.ctx.save();
    }
    window.scrollTo(0, 0);
  }
  updateTurn() {
    const el = $("#lesson-turn", this.root);
    if (!el || !this.board) return;
    const turn = this.board.game.turn();
    if (!this.run) {
      el.innerHTML = `<strong>Regarde l’exemple.</strong><small>${this.board.game.isCheckmate() ? "Échec et mat : le roi n’a aucune défense." : `C’est aux ${turn === "w" ? "blancs" : "noirs"} de jouer.`}</small>`;
      return;
    }
    el.innerHTML = `<strong>Tu joues les ${this.side === "w" ? "blancs" : "noirs"}.</strong><small>${this.board.game.isCheckmate() ? "La partie est terminée : échec et mat." : this.board.game.isStalemate() ? "Personne ne gagne : le roi n’est pas attaqué, mais il ne peut rien jouer." : turn === this.side ? "C’est à toi." : `C’est aux ${turn === "w" ? "blancs" : "noirs"} de jouer.`}</small>`;
  }
  next() {
    if (this.stages[this.step].kind === "retain") {
      this.finished = true;
      this.ctx.state.entries[this.e.id].lastTaught = dateKey();
      this.save();
      if (this.e.id === "vis-start") {
        this.ctx.state.preferences.tutorialDone = true;
        this.ctx.state.entries[this.e.id].drillAt = dateKey();
        this.ctx.save();
      }
      this.onDone
        ? this.onDone()
        : this.ctx.navigate(this.e.id === "vis-start" ? "today" : "catalogue");
      return;
    }
    this.step++;
    this.show();
  }
  demo(index, animate = true) {
    const c = this.stages[this.step].data;
    this.demoIndex = Math.max(0, Math.min(c.line.length, index));
    const g = new Chess(c.fen);
    for (const m of c.line.slice(0, this.demoIndex)) moveUci(g, m.uci);
    const m = c.line[this.demoIndex - 1];
    if (animate && m) this.board.animate(g.fen(), m.uci, 500);
    else
      this.board.set(g.fen(), { arrows: c.arrows || [], marks: c.marks || [] });
    $("#lesson-notation", this.root).textContent =
      m?.text || "Prête ? Avance d’un coup pour voir ce qui change.";
    $("#lesson-demo", this.root).hidden = true;
    for (const id of ["demo-back", "demo-next", "demo-replay"])
      $("#" + id, this.root).hidden = false;
    $("#demo-back", this.root).disabled = this.demoIndex === 0;
    $("#demo-next", this.root).disabled = this.demoIndex === c.line.length;
    $("#demo-count", this.root).textContent =
      `${this.demoIndex} / ${c.line.length}`;
    this.updateTurn();
    this.save();
  }
  assistance() {
    if (!this.run) return;
    $("#lesson-hint", this.root).hidden = this.run.errors < 2 || this.run.done;
    $("#lesson-solution", this.root).hidden =
      this.run.errors < 3 || this.run.done;
  }
  async answer(move) {
    if (this.busy || this.disposed || this.run.done) return;
    const result = this.run.play(move);
    if (result.illegal || result.ignored) return;
    this.save();
    this.assistance();
    const f = $("#lesson-feedback", this.root);
    if (result.alsoGood) {
      f.innerHTML =
        '<p class="feedback correct">Bon coup, mais ce n’est pas l’idée de cette fiche. Essaie encore.</p>';
      return;
    }
    if (result.wrong) {
      if (!result.fen) {
        f.innerHTML =
          '<p class="feedback wrong">Pas cette case. ' +
          esc(this.run.c.hint) +
          "</p>";
        return;
      }
      await this.wrong(result);
      return;
    }
    f.innerHTML =
      '<p class="feedback correct">Bon coup. Observe la réponse, puis continue.</p>';
    if (result.fen) {
      this.board.options.interactive = false;
      this.board.animate(result.fen, move, 500);
      $("#lesson-notation", this.root).textContent = this.describe(result.made);
    } else
      this.board.set(this.run.game.fen(), {
        marks: [move],
        interactive: false,
      });
    this.updateTurn();
    if (this.run.done) this.success();
    else this.reply();
  }
  describe(m) {
    return describeMove(m);
  }
  reply() {
    this.busy = true;
    this.board.options.interactive = false;
    this.wait(() => {
      const r = this.run.reply();
      if (r) {
        this.board.animate(r.fen, r.move, 500);
        $("#lesson-notation", this.root).textContent = this.describe(r.made);
      }
      this.busy = false;
      this.updateTurn();
      this.save();
      if (this.run.done) this.success();
      else {
        this.board.options.interactive = true;
        this.board.render();
      }
    });
  }
  success(record = true) {
    this.board.options.interactive = false;
    this.board.render();
    $("#lesson-feedback", this.root).innerHTML =
      '<p class="feedback correct">' +
      esc(
        this.run.c.success ||
          "Bien. " + this.e.retenir,
      ) +
      "</p>";
    $("#lesson-next", this.root).hidden = false;
    this.assistance();
    this.save();
  }
  async wrong(result) {
    this.busy = true;
    const ticket = this.turn;
    this.board.options.interactive = false;
    this.board.animate(result.fen, result.made.from + result.made.to, 500);
    const f = $("#lesson-feedback", this.root);
    f.innerHTML =
      '<p>Je regarde ce que l’adversaire peut répondre…</p><button id="lesson-retry" class="button secondary">Revenir et réessayer →</button>';
    $("#lesson-retry", this.root).onclick = () => this.retry();
    this.engine?.close();
    const engine = (this.engine = new Engine());
    try {
      const r = await engine.search(result.fen, { depth: 10 });
      if (this.disposed || ticket !== this.turn || this.engine !== engine)
        return;
      const g = new Chess(result.fen);
      if (!g.isGameOver() && r.best !== "(none)") {
        const m = moveUci(g, r.best);
        this.board.animate(g.fen(), r.best, 500);
        this.board.options.arrows = [[m.from, m.to]];
        this.board.options.arrowColor = "danger";
        this.board.render();
        f.querySelector("p").textContent = m.captured
          ? `Après ton coup, ${["q", "r"].includes(m.piece) ? "sa " + pieceName[m.piece] : "son " + pieceName[m.piece]} en ${m.from} prend ${["q", "r"].includes(m.captured) ? "ta " + pieceName[m.captured] : "ton " + pieceName[m.captured]} en ${m.to}.`
          : g.isCheckmate()
            ? "Après ton coup, l’adversaire fait échec et mat."
            : `${this.describe(m)} Compare cette réponse à l’idée expliquée dans la fiche.`;
      } else
        f.querySelector("p").textContent =
          "Ton coup termine la partie autrement. Reviens à la position pour retrouver l’idée de cette fiche.";
      this.updateTurn();
    } catch {
      if (!this.disposed && ticket === this.turn)
        f.querySelector("p").textContent =
          "Je ne peux pas vérifier sa réponse pour le moment. Reviens à la position : l’indice reste disponible.";
    } finally {
      engine.close();
      if (this.engine === engine) this.engine = null;
    }
  }
  retry() {
    this.clear();
    this.board.set(this.run.game.fen(), {
      interactive: true,
      arrows: this.run.c.arrows || [],
      marks: [],
      arrowColor: null,
    });
    $("#lesson-feedback", this.root).textContent =
      "Repars de cette position. " +
      (this.run.errors >= 2
        ? this.run.c.hint
        : "Regarde ce que ton coup laisserait prendre.");
    this.updateTurn();
    this.assistance();
  }
  hint() {
    if (this.busy) this.retry();
    this.run.helped = true;
    const c = this.run.c,
      m = c.solution[this.run.index] || c.solution[0];
    this.board.set(this.run.game.fen(), {
      marks: c.kind === "square" ? c.accept : [m.slice(0, 2)],
      interactive: true,
    });
    $("#lesson-feedback", this.root).textContent = c.hint;
    this.save();
  }
  solution() {
    if (this.busy) this.retry();
    this.run.helped = true;
    this.busy = true;
    this.board.options.interactive = false;
    const c = this.run.c;
    if (c.kind === "square") {
      this.run.done = true;
      this.board.set(c.fen, { marks: c.accept, interactive: false });
      this.busy = false;
      this.success();
      return;
    }
    const tick = () => {
      if (this.run.index >= c.solution.length) {
        this.run.done = true;
        this.busy = false;
        this.success();
        return;
      }
      const m = c.solution[this.run.index++],
        made = moveUci(this.run.game, m);
      this.board.animate(this.run.game.fen(), m, 500);
      $("#lesson-notation", this.root).textContent = this.describe(made);
      this.updateTurn();
      this.save();
      this.wait(tick, 1600);
    };
    tick();
  }
  async practice() {
    const b = $("#lesson-practice", this.root);
    b.disabled = true;
    const ticket = this.turn;
    try {
      const data = await loadPuzzles(this.e.id);
      if (this.disposed || ticket !== this.turn) return;
      const onDone = () => {
        this.step++;
        this.show();
      };
      if (data.theme !== this.e.id) {
        const rows = await loadDrillChallenges(this.e);
        if (this.disposed || ticket !== this.turn) return;
        this.sub = {
          destroy: startDrill(this.ctx, this.root, this.e, {
            rows: rows.slice(0, this.practiceCount),
            scope: "lesson:" + this.e.id,
            onDone,
          }),
        };
        return;
      }
      const rows = pickPuzzles(data.rows, this.ctx.state, this.e.id, {
        count: this.practiceCount,
      }).sort((a, b) => a[3] - b[3]);
      if (!rows.length) {
        onDone();
        return;
      }
      this.sub = new PuzzlePlayer(this.ctx, rows, data.manifest, {
        theme: this.e.id,
        scope: "lesson:" + this.e.id,
        title: this.e.title,
        onDone,
      });
      this.sub.start(this.root);
    } catch (error) {
      if (!this.disposed && ticket === this.turn) {
        b.disabled = false;
        $("#lesson-feedback", this.root).textContent = error.message;
      }
    }
  }
  destroy() {
    this.disposed = true;
    this.clear();
    this.board?.destroy();
    this.sub?.destroy();
  }
}
