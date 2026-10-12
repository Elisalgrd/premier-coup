import { lessonReceipt, saveSeries } from "./mastery.js";
import { Board } from "../chess/board.js";
import { Chess } from "../chess/chess.js";
import { moveUci, describeMove } from "../chess/notation.js";
import { drillChallenges } from "./drills.js";
import { dateKey, esc, $ } from "../ui/helpers.js";
export function startDrill(
  ctx,
  root,
  entry,
  {
    onDone = null,
    count = 10,
    rows: available,
    scope = "free:" + entry.id,
  } = {},
) {
  const all = available || drillChallenges(entry),
    recent = new Set(
      ctx.state.history
        .filter((x) => x.entryId === entry.id)
        .map((x) => x.puzzleId),
    ),
    ordered = all.sort(
      (a, b) =>
        Number(recent.has(entry.id + ":" + a.id)) -
          Number(recent.has(entry.id + ":" + b.id)) || Math.random() - 0.5,
    ),
    saved = ctx.state.drill?.scope === scope ? ctx.state.drill : null,
    rows = saved?.rows || ordered.slice(0, count);
  const batchId = saved?.batchId || crypto.randomUUID();
  let cleanCount = saved?.cleanCount || 0;
  let i = saved?.index || 0,
    clean = true,
    board,
    disposed = false,
    started = Date.now(),
    complete = false;
  const persist = () => {
    ctx.state.drill = { scope, rows, index: i, clean, complete, batchId, cleanCount };
    ctx.save();
  };
  const show = async () => {
    board?.destroy();
    if (disposed) return;
    if (i >= rows.length) {
      const r = (ctx.state.entries[entry.id] ??= {});
      r.drillAt = dateKey();
      ctx.state.drill = null;
      await saveSeries(ctx, entry.id, { id: batchId, total: rows.length, clean: cleanCount });
      if (disposed) return;
      root.innerHTML = `<section class="completion"><span class="complete-icon">✓</span><h1>${rows.length} repères travaillés.</h1><p>${all.length} variantes disponibles pour cette notion.</p>${ctx.store?.error ? `<p class="feedback wrong">${esc(ctx.store.error)}</p>` : lessonReceipt(ctx.state, entry)}<button id="drill-done" class="button primary">Continuer →</button></section>`;
      $("#drill-done", root).onclick = () =>
        onDone ? onDone() : ctx.navigate("train");
      return;
    }
    const c = rows[i];
    clean = saved?.index === i ? saved.clean : true;
    complete = saved?.index === i ? saved.complete : false;
    persist();
    started = Date.now();
    root.innerHTML = `<a class="back-link" href="#train">← S’entraîner</a><header class="activity-header"><div><span class="eyebrow">${esc(entry.title)} · ${i + 1} / ${rows.length}</span><h1>Retrouve le principe.</h1></div></header><div class="play-layout"><div id="drill-board"></div><section class="play-coach"><p>${esc(c.prompt)}</p>${c.source ? `<p class="muted small">Repérage dans une position réelle. <a href="${esc(c.source)}" target="_blank" rel="noopener">Source Lichess ↗</a></p>` : ""}<p id="drill-feedback" role="status"></p><button id="drill-hint" class="button secondary">Un indice</button><button id="drill-next" class="button primary" hidden>Suivante →</button></section></div>`;
    const answer = (m) => {
      if (complete) return;
      let ok = c.solution.includes(m),
        made;
      if (c.mode !== "square") {
        const g = new Chess(c.fen);
        try {
          made = moveUci(g, m);
          ok = m === c.solution[0] || (c.acceptMate && g.isCheckmate());
          if (ok) board.animate(g.fen(), m);
        } catch {
          return;
        }
      }
      if (ok) {
        complete = true;
        if (clean) cleanCount++;
        const id = entry.id + ":" + c.id;
        ctx.state.history.push({
          puzzleId: id,
          entryId: entry.id,
          day: dateKey(),
          at: Date.now(),
          clean,
          score: clean ? 1 : 0,
          review: recent.has(id),
          seconds: Math.round((Date.now() - started) / 1000),
          drill: true,
        });
        persist();
        board.options.interactive = false;
        board.render();
        $("#drill-feedback", root).textContent =
          (made ? describeMove(made) + " " : "") + entry.principle;
        $("#drill-next", root).hidden = false;
        $("#drill-hint", root).hidden = true;
      } else {
        clean = false;
        persist();
        $("#drill-feedback", root).textContent =
          "Pas tout à fait. " +
          entry.principle +
          " Touche « Un indice » pour voir où regarder.";
      }
    };
    board = new Board($("#drill-board", root), {
      fen: c.fen,
      flipped: c.fen.split(" ")[1] === "b",
      onMove: answer,
      onSquare: c.mode === "square" ? answer : null,
    });
    if (complete) {
      if (c.mode !== "square") {
        const g = new Chess(c.fen);
        moveUci(g, c.solution[0]);
        board.set(g.fen());
      }
      board.options.interactive = false;
      board.render();
      $("#drill-next", root).hidden = false;
      $("#drill-hint", root).hidden = true;
      $("#drill-feedback", root).textContent = entry.principle;
    }
    $("#drill-hint", root).onclick = () => {
      clean = false;
      persist();
      const m = c.solution[0];
      board.set(c.fen, {
        marks: c.mode === "square" ? [m] : [m.slice(0, 2), m.slice(2, 4)],
        arrows: c.mode === "square" ? [] : [[m.slice(0, 2), m.slice(2, 4)]],
      });
      $("#drill-feedback", root).textContent = entry.principle;
    };
    $("#drill-next", root).onclick = () => {
      i++;
      show();
    };
  };
  show();
  return () => {
    disposed = true;
    board?.destroy();
  };
}
