import { Engine } from "../chess/engine.js";
import { centipawns } from "../chess/analysis.js";
import { rememberPuzzle } from "./srs.js";
import { Board } from "../chess/board.js";
import { Chess } from "../chess/chess.js";
import { moveUci, sanFr, pieceName } from "../chess/notation.js";
import { PuzzleRun, tagsFor } from "./puzzles.js";
import { recordRating } from "./rating.js";
import { esc, $, dateKey, duration } from "../ui/helpers.js";
export class PuzzlePlayer {
  constructor(
    ctx,
    rows,
    manifest,
    {
      theme = "mixed",
      title = "Problèmes mélangés",
      onDone = null,
      review = false,
      onResult = null,
      scope = null,
      resume = true,
    } = {},
  ) {
    Object.assign(this, {
      ctx,
      rows,
      manifest,
      theme,
      title,
      onDone,
      review,
      onResult,
    });
    this.scope = scope || "free:" + theme;
    this.position = 0;
    this.finished = false;
    this.timers = new Set();
    this.disposed = false;
    this.seconds = 0;
    this.cleanCount = 0;
    const saved = ctx.state.exercise;
    if (resume && saved?.scope === this.scope && saved.batch) {
      this.rows = saved.batch.rows;
      this.position = saved.batch.position;
      this.cleanCount = saved.batch.cleanCount || 0;
      this.seconds = saved.batch.seconds || 0;
    }
  }
  wait(fn, ms = 430) {
    const t = setTimeout(() => {
      this.timers.delete(t);
      if (!this.disposed) fn();
    }, ms);
    this.timers.add(t);
  }
  start(root) {
    this.root = root;
    this.show();
    if (this.finished) return () => this.destroy();
    this.clock = setInterval(() => {
      if (document.visibilityState === "visible") {
        this.seconds++;
        const el = this.root.querySelector("#puzzle-time");
        if (el) el.textContent = duration(this.seconds);
      }
    }, 1000);
    return () => this.destroy();
  }
  show() {
    if (this.position >= this.rows.length) {
      this.finish();
      return;
    }
    this.board?.destroy();
    this.busy = false;
    this.row = this.rows[this.position];
    const saved =
      this.ctx.state.exercise?.scope === this.scope
        ? this.ctx.state.exercise
        : null;
    this.run = new PuzzleRun(
      this.row,
      saved?.id === this.row[0] ? saved.run : undefined,
    );
    this.recorded = !!(saved?.id === this.row[0] && saved.recorded);
    this.startedAt = Date.now();
    this.tags = tagsFor(this.row, this.manifest);
    this.resultTheme =
      this.theme === "mixed"
        ? this.ctx.entries
            .filter((e) => this.ctx.state.entries[e.id]?.viewedAt)
            .find(
              (e) =>
                ["tactique", "mats"].includes(e.domain) &&
                this.manifest.shards[e.id]?.tags.some((t) =>
                  this.tags.includes(t),
                ),
            )?.id || "mixed"
        : this.theme;
    this.root.innerHTML = `<a class="back-link" href="#train">← S’entraîner</a><header class="activity-header"><div><span class="eyebrow">${esc(this.title)} · ${this.position + 1} / ${this.rows.length}</span><h1>Trouve le bon coup.</h1></div><label class="timer-label"><input id="timer-toggle" type="checkbox"> Chrono <span id="puzzle-time" hidden>${duration(this.seconds)}</span></label></header><div class="play-layout"><section><div class="board-top"><strong>${this.run.side === "w" ? "Trait aux blancs" : "Trait aux noirs"}</strong><span>Problème ${this.row[0]}</span></div><div id="puzzle-board"></div><div class="notation" id="move-notation" aria-live="polite"></div></section><section class="play-coach"><span class="eyebrow">OBSERVE, PUIS CHOISIS</span><p class="prompt">Cherche les échecs, les captures et les menaces. Imagine sa réponse avant de jouer.</p><div id="puzzle-feedback" role="status"></div><div class="puzzle-actions"><button id="puzzle-hint" class="button secondary">Un indice</button><button id="puzzle-solution" class="text-link">Voir la solution</button><button id="puzzle-next" class="button primary" hidden>Position suivante →</button></div><a class="text-link" href="https://lichess.org/analysis/${encodeURIComponent(this.run.game.fen())}" target="_blank" rel="noopener">Analyser cette position ↗</a><small>Source : <a href="https://lichess.org/training/${this.row[0]}" target="_blank" rel="noopener">Lichess, licence CC0</a>. Classement du problème : ${this.row[3]}.</small></section></div>`;
    this.board = new Board($("#puzzle-board", this.root), {
      fen: saved?.id === this.row[0] ? this.run.game.fen() : this.row[1],
      flipped: this.run.side === "b",
      interactive: false,
      onMove: (m) => this.move(m),
    });
    $("#timer-toggle", this.root).onchange = (e) =>
      ($("#puzzle-time", this.root).hidden = !e.target.checked);
    $("#puzzle-hint", this.root).onclick = () => this.hint();
    $("#puzzle-solution", this.root).onclick = () => this.solution();
    $("#puzzle-next", this.root).onclick = () => {
      this.position++;
      this.ctx.state.exercise = null;
      this.show();
    };
    this.persist();
    if (saved?.id === this.row[0]) {
      if (!this.run.finished && this.run.game.turn() !== this.run.side)
        this.run.reply();
      this.board.set(this.run.game.fen(), { interactive: !this.run.finished });
      if (this.run.finished) this.complete();
    } else
      this.wait(() => {
        this.board.animate(this.run.game.fen(), this.run.line[0]);
        this.board.options.interactive = true;
        this.board.render();
        const g = new Chess(this.row[1]);
        $("#move-notation", this.root).textContent =
          "Dernier coup adverse : " + sanFr(moveUci(g, this.run.line[0]).san);
        this.persist();
      });
  }
  persist() {
    this.ctx.state.exercise = {
      scope: this.scope,
      batch: {
        rows: this.rows,
        position: this.position,
        cleanCount: this.cleanCount,
        seconds: this.seconds,
      },
      id: this.row[0],
      row: this.row,
      theme: this.theme,
      run: this.run.snapshot(),
      recorded: this.recorded,
    };
    this.ctx.save();
  }
  move(move) {
    if (this.busy || this.disposed) return;
    const result = this.run.tryMove(move, {
      acceptMate: this.tags.some((t) => /^mateIn/.test(t)),
    });
    if (result.ignored || result.illegal) return;
    const feedback = $("#puzzle-feedback", this.root);
    if (!result.ok) {
      if (!this.review)
        rememberPuzzle(this.ctx.state, this.row, this.resultTheme);
      this.board.set(result.fen, {
        interactive: false,
        last: [move.slice(0, 2), move.slice(2, 4)],
      });
      feedback.className = "feedback wrong";
      feedback.innerHTML = `<strong>${esc(result.played)} : compare la suite.</strong><p>${result.reply?.mate ? "L’adversaire peut faire mat avec " + result.reply.san + "." : result.reply && result.loss ? "Il peut répondre " + result.reply.san + " et prendre " + result.loss + " point" + (result.loss > 1 ? "s" : "") + " de matériel." : "Cette réponse diffère de la combinaison attendue. Reviens à la position et compare les coups forçants."}</p><p id="engine-explain">Le coach vérifie la réponse adverse…</p><button id="puzzle-retry" class="button secondary">Revenir et réessayer →</button>`;
      if (result.reply)
        this.wait(
          () => this.board.animate(result.reply.fen, result.reply.move),
          650,
        );
      this.explain(result.fen);
      $("#puzzle-retry", this.root).onclick = () => {
        this.engine?.close();
        this.engine = null;
        for (const t of this.timers) clearTimeout(t);
        this.timers.clear();
        this.board.set(this.run.game.fen(), {
          interactive: true,
          arrows: [result.arrow],
          marks: result.arrow,
        });
        feedback.innerHTML = `<p>Le coup de la ligne est <strong>${result.expected}</strong>. Suis la flèche, puis vérifie sa réponse.</p>`;
      };
      this.persist();
      return;
    }
    feedback.className = "feedback correct";
    feedback.textContent = result.finished
      ? "Oui, la combinaison est complète."
      : "Bon coup. Observe sa réponse.";
    this.board.options.interactive = false;
    this.board.animate(result.fen, move);
    $("#move-notation", this.root).textContent = result.san;
    this.busy = true;
    if (result.finished) {
      this.complete();
      this.busy = false;
    } else {
      this.persist();
      this.wait(() => {
        const reply = this.run.reply();
        if (reply) {
          this.board.animate(reply.fen, reply.move);
          $("#move-notation", this.root).textContent += " " + reply.san;
        }
        this.busy = false;
        if (this.run.finished) this.complete();
        else {
          this.board.options.interactive = true;
          this.board.render();
          this.persist();
        }
      });
    }
  }
  async explain(fen) {
    this.engine?.close();
    const engine = (this.engine = new Engine());
    try {
      const before = await engine.search(this.run.game.fen(), { depth: 12 }),
        after = await engine.search(fen, { depth: 12 });
      if (
        this.disposed ||
        this.engine !== engine ||
        !$("#engine-explain", this.root)
      )
        return;
      for (const t of this.timers) clearTimeout(t);
      this.timers.clear();
      const g = new Chess(fen),
        reply = moveUci(g, after.best),
        loss = Math.max(0, centipawns(before) + centipawns(after));
      this.board.animate(g.fen(), after.best);
      this.board.options.arrows = [[reply.from, reply.to]];
      this.board.render();
      $("#engine-explain", this.root).textContent =
        after.type === "mate" && after.score > 0
          ? sanFr(reply.san) +
            " prépare un mat forcé. Reviens à la position pour chercher une défense."
          : loss < 50
            ? "Ton coup conserve une évaluation proche. Ce problème attend une autre combinaison : compare-la avant de continuer."
            : sanFr(reply.san) +
              (reply.captured
                ? " prend ton " + pieceName[reply.captured] + ". "
                : ". ") +
              "Cette suite coûte environ " +
              (loss / 100).toFixed(1) +
              " pion d’évaluation. Observe la réponse, puis compare le coup proposé.";
    } catch {
      const el = $("#engine-explain", this.root);
      if (el && !this.disposed)
        el.textContent =
          "La ligne affichée montre une réponse légale. L’analyse complète du moteur est indisponible hors ligne avant son premier téléchargement.";
    } finally {
      engine.close();
      if (this.engine === engine) this.engine = null;
    }
  }
  hint() {
    if (this.run.finished || this.busy) return;
    const move = this.run.hint();
    this.board.set(this.run.game.fen(), {
      interactive: true,
      marks:
        this.run.hints === 1
          ? [move.slice(0, 2)]
          : [move.slice(0, 2), move.slice(2, 4)],
      arrows: this.run.hints >= 3 ? [[move.slice(0, 2), move.slice(2, 4)]] : [],
    });
    $("#puzzle-feedback", this.root).innerHTML =
      `<p>${this.run.hints === 1 ? "Cherche un coup de la pièce entourée." : this.run.hints === 2 ? "La case d’arrivée est aussi entourée." : "La flèche indique le coup à jouer."}</p>`;
    this.persist();
  }
  solution() {
    if (this.run.finished || this.busy) return;
    this.run.clean = false;
    this.run.hints = 3;
    this.busy = true;
    const step = () => {
      if (this.run.index >= this.run.line.length) {
        this.run.finished = true;
        this.busy = false;
        this.complete();
        return;
      }
      const move = this.run.line[this.run.index++],
        made = moveUci(this.run.game, move);
      this.board.animate(this.run.game.fen(), move);
      $("#move-notation", this.root).textContent = sanFr(made.san);
      this.persist();
      this.wait(step, 700);
    };
    this.board.options.interactive = false;
    step();
  }
  complete() {
    this.board.options.interactive = false;
    this.board.render();
    if (!this.recorded) {
      this.recorded = true;
      const result = {
        puzzleId: this.row[0],
        entryId: this.resultTheme,
        day: dateKey(),
        at: Date.now(),
        rating: this.row[3],
        clean: this.run.clean,
        score: this.run.clean ? 1 : this.run.hints > 0 ? 0.5 : 0,
        review: this.review,
        seconds: Math.round((Date.now() - this.startedAt) / 1000),
      };
      this.ctx.state.history.push(result);
      if (!result.clean && !this.review)
        rememberPuzzle(this.ctx.state, this.row, this.resultTheme);
      if (!this.review)
        recordRating(
          this.ctx.state,
          this.resultTheme,
          this.row[3],
          this.run.clean,
        );
      result.ratingAfter = this.ctx.state.ratings.global.value;
      if (this.run.clean) this.cleanCount++;
      this.onResult?.(result, this.row);
      this.persist();
    }
    $("#puzzle-hint", this.root).hidden = true;
    $("#puzzle-solution", this.root).hidden = true;
    $("#puzzle-next", this.root).hidden = false;
    $("#puzzle-next", this.root).textContent =
      this.position === this.rows.length - 1
        ? "Voir mon bilan →"
        : "Position suivante →";
    $("#puzzle-feedback", this.root).innerHTML =
      `<strong>${this.run.clean ? "Réussi sans aide." : "Position travaillée."}</strong><p>${this.run.clean ? "Tu as trouvé la suite au premier essai." : "Elle reviendra dans tes révisions."}</p>`;
  }
  finish() {
    this.finished = true;
    clearInterval(this.clock);
    this.ctx.state.exercise = null;
    this.ctx.save();
    this.root.innerHTML = `<section class="completion"><span class="complete-icon">✓</span><h1>Une idée mieux reconnue.</h1><p>${this.rows.length} positions travaillées · ${this.cleanCount} sans aide.</p><button id="exercise-done" class="button primary">${this.onDone ? "Continuer ma séance" : "Revenir à l’entraînement"} →</button><a href="#progress" class="text-link">Voir mes progrès ↗</a></section>`;
    $("#exercise-done", this.root).onclick = () =>
      this.onDone ? this.onDone() : this.ctx.navigate("train");
  }
  destroy() {
    this.disposed = true;
    this.engine?.close();
    clearInterval(this.clock);
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    this.board?.destroy();
  }
}
