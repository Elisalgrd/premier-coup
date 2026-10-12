import { dueCards, gradeCard } from "./srs.js";
import { Board } from "../chess/board.js";
import { Chess } from "../chess/chess.js";
import { moveUci, sanFr } from "../chess/notation.js";
import { PuzzlePlayer } from "./puzzle-player.js";
import { puzzleManifest } from "./puzzles.js";
import { esc, $ } from "../ui/helpers.js";
export async function startReviews(
  ctx,
  root,
  { ids = null, onDone = null, kind = null } = {},
) {
  const cards = (
    ids
      ? ids.map((id) => ctx.state.cards[id]).filter(Boolean)
      : dueCards(ctx.state)
  ).filter((c) => !kind || c.type === kind);
  let index = 0,
    board,
    sub,
    disposed = false;
  const finish = () => {
    root.innerHTML =
      '<section class="completion"><span class="complete-icon">✓</span><h1>Révisions à jour.</h1><p>Les prochaines positions reviendront à leur date prévue.</p><button id="reviews-done" class="button primary">Continuer →</button></section>';
    $("#reviews-done", root).onclick = () =>
      onDone ? onDone() : ctx.navigate("train");
  };
  const next = async () => {
    board?.destroy();
    sub?.destroy();
    if (disposed) return;
    if (index >= cards.length) {
      finish();
      return;
    }
    const c = cards[index];
    if (c.type === "puzzle") {
      const manifest = await puzzleManifest();
      if (disposed) return;
      sub = new PuzzlePlayer(ctx, [c.row], manifest, {
        theme: c.entryId,
        scope: "review:" + c.id,
        review: true,
        title: "Révision " + (index + 1) + " / " + cards.length,
        onResult: (r) => {
          gradeCard(ctx.state, c.id, r.clean);
          ctx.save();
        },
        onDone: () => {
          index++;
          next();
        },
      });
      sub.start(root);
      return;
    }
    const challenge = c.challenge,
      g = new Chess(challenge.fen);
    let clean = true,
      done = false;
    root.innerHTML = `<a href="#train" class="back-link">← S’entraîner</a><header class="activity-header"><div><span class="eyebrow">RÉVISION ${index + 1} / ${cards.length}</span><h1>Retrouve le repère.</h1></div></header><div class="play-layout"><div id="review-board"></div><section class="play-coach"><p>${esc(challenge.prompt || "Trouve le meilleur coup.")}</p><div id="review-feedback" role="status"></div><button id="review-help" class="button secondary">Revoir le principe</button><button id="review-next" class="button primary" hidden>Suivante →</button></section></div>`;
    const answer = (m) => {
      if (done) return;
      let ok = challenge.solution.includes(m),
        made;
      if (challenge.mode !== "square") {
        const test = new Chess(g.fen());
        try {
          made = moveUci(test, m);
          ok = m === challenge.solution[0] || test.isCheckmate();
          if (ok) board.animate(test.fen(), m);
        } catch {
          return;
        }
      }
      if (ok) {
        done = true;
        gradeCard(ctx.state, c.id, clean);
        ctx.save();
        board.options.interactive = false;
        board.render();
        $("#review-next", root).hidden = false;
        $("#review-help", root).hidden = true;
        $("#review-feedback", root).innerHTML =
          `<p class="feedback correct">${made ? sanFr(made.san) + ". " : ""}${esc(c.principle || "Tu as retrouvé le coup.")}</p>`;
      } else {
        clean = false;
        $("#review-feedback", root).innerHTML =
          '<p class="feedback wrong">Ce coup ne retrouve pas le repère. Vérifie la réponse adverse, puis essaie encore.</p>';
      }
    };
    board = new Board($("#review-board", root), {
      fen: g.fen(),
      flipped: g.turn() === "b",
      onMove: answer,
      onSquare: challenge.mode === "square" ? answer : null,
    });
    $("#review-help", root).onclick = () => {
      clean = false;
      const m = challenge.solution[0];
      board.set(g.fen(), {
        marks:
          challenge.mode === "square" ? [m] : [m.slice(0, 2), m.slice(2, 4)],
        arrows:
          challenge.mode === "square" ? [] : [[m.slice(0, 2), m.slice(2, 4)]],
      });
      $("#review-feedback", root).textContent =
        c.principle || "Suis la flèche pour retrouver le coup.";
    };
    $("#review-next", root).onclick = () => {
      index++;
      next();
    };
  };
  await next();
  return () => {
    disposed = true;
    board?.destroy();
    sub?.destroy();
  };
}
