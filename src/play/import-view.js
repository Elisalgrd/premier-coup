import { coachSummaryHtml } from "./coach-panel.js";
import { Engine } from "../chess/engine.js";
import { analyzePendingGame } from "./analysis-task.js";
import { PlayerBoard, gameAt } from "../ui/player-strip.js";
import { Chess } from "../chess/chess.js";
import { moveUci, describeMove } from "../chess/notation.js";
import { parsePgn, importPublic, saveGames } from "./import.js";
import { friendlyMistake, esc, $ } from "../ui/helpers.js";
export async function startImport(ctx, root) {
  let disposed = false,
    engine = null,
    controller = null,
    boards = [];
  const render = () => {
    for (const b of boards) b.destroy();
    boards = [];
    root.innerHTML = `<a class="back-link" href="#train">← S’entraîner</a><header class="page-intro"><span class="eyebrow">APPRENDRE DE TES PARTIES</span><h1>Tes erreurs, tes exercices.</h1><p>Colle le texte d’une partie ou récupère tes dernières parties publiques. L’analyse reste sur ton appareil.</p></header><div class="import-grid"><section class="session-card"><h2>Coller une partie</h2><label class="form-label">Texte de la partie (bouton « Copier PGN » sur Lichess ou Chess.com)<textarea id="pgn-input" rows="7" placeholder="Colle ici le texte copié depuis ton site d’échecs."></textarea></label><label class="form-label">Tu jouais<select id="pgn-color"><option value="w">Les blancs</option><option value="b">Les noirs</option></select></label><button id="import-pgn" class="button primary">Ajouter la partie →</button></section><section class="session-card"><h2>Ton compte public</h2><label class="form-label">Plateforme<select id="import-platform"><option value="lichess">Lichess</option><option value="chesscom">Chess.com</option></select></label><label class="form-label">Pseudo<input id="import-user" autocomplete="off" value="${esc(ctx.state.preferences.lichess || "")}" placeholder="Ton pseudo"></label><button id="import-public" class="button secondary">Récupérer mes parties</button><small>20 parties maximum. Seul ton pseudo est envoyé au service choisi.</small></section></div><p id="import-feedback" role="status"></p><div class="section-title"><h2>Mes parties (${ctx.state.games.length})</h2></div><div class="game-list">${
      [...ctx.state.games]
        .reverse()
        .map(
          (g) =>
            `<article><div><strong>${esc(g.headers.White || "Blancs")} / ${esc(g.headers.Black || "Noirs")}</strong><small>${esc(g.source)} · ${Math.ceil(g.moves.length / 2)} coups · ${g.analysis ? "analysée" : ["running", "interrupted"].includes(g.analysisStatus) ? "Analyse interrompue, reprendre" : "à analyser"}</small></div><button class="text-link" data-review="${esc(g.id)}">Revoir la partie</button><button class="button secondary" data-analyze="${esc(g.id)}">${g.analysis ? "Voir le rapport" : "Analyser"} →</button></article>`,
        )
        .join("") || "<p>Aucune partie importée pour le moment.</p>"
    }</div>`;
    $("#import-pgn", root).onclick = () => {
      try {
        const g = parsePgn($("#pgn-input", root).value, {
          color: $("#pgn-color", root).value,
        });
        saveGames(ctx.state, [g]);
        ctx.save();
        render();
      } catch (e) {
        $("#import-feedback", root).textContent = e.message;
      }
    };
    $("#import-public", root).onclick = async (e) => {
      e.target.disabled = true;
      try {
        const platform = $("#import-platform", root).value,
          user = $("#import-user", root).value;
        const games = await importPublic(platform, user);
        if (disposed) return;
        const count = saveGames(ctx.state, games);
        ctx.state.preferences[platform] = user;
        ctx.save();
        render();
        $("#import-feedback", root).textContent =
          count + " nouvelles parties ajoutées.";
      } catch (error) {
        if (!disposed) {
          $("#import-feedback", root).textContent = error.message;
          e.target.disabled = false;
        }
      }
    };
    for (const button of root.querySelectorAll("[data-review]"))
      button.onclick = () => review(ctx.state.games.find((g) => g.id === button.dataset.review));
    for (const button of root.querySelectorAll("[data-analyze]"))
      button.onclick = () =>
        report(ctx.state.games.find((g) => g.id === button.dataset.analyze));
  };
  const review = (record) => {
    for (const b of boards) b.destroy();
    let ply = 0;
    root.innerHTML = `<button class="back-link" id="review-back">← Mes parties</button><h1>Revoir ta partie.</h1><div class="play-layout"><section><div id="replay-board"></div></section><section class="play-coach"><p id="replay-move" role="status"></p><div class="demo-controls"><button class="button secondary" id="replay-prev">← Coup précédent</button><button class="button primary" id="replay-next">Coup suivant →</button></div><button class="text-link" id="replay-report">${record.analysis ? "Voir le rapport" : "Analyser cette partie"} →</button></section></div>`;
    const board = new PlayerBoard($("#replay-board", root), gameAt(record, 0), { side: record.color, names: { w: record.headers.White, b: record.headers.Black } });
    boards = [board];
    const show = () => {
      const game = gameAt(record, ply), move = game.history({ verbose: true }).at(-1);
      board.set(game, { last: move ? [move.from, move.to] : [] });
      $("#replay-move", root).textContent = move ? `${ply} / ${record.moves.length} : ${describeMove(move)}` : "Position de départ.";
      $("#replay-prev", root).disabled = ply === 0;
      $("#replay-next", root).disabled = ply === record.moves.length;
    };
    $("#replay-prev", root).onclick = () => { ply--; show(); };
    $("#replay-next", root).onclick = () => { ply++; show(); };
    $("#review-back", root).onclick = render;
    $("#replay-report", root).onclick = () => report(record);
    show();
  };
  const report = async (g) => {
    for (const b of boards) b.destroy();
    boards = [];
    if (!g.analysis) {
      const taskEngine = new Engine(), task = new AbortController();
      engine = taskEngine;
      controller = task;
      const cancel = () => {
        task.abort();
        taskEngine.close();
        if (!g.analysis) g.analysisStatus = "interrupted";
        ctx.save();
        render();
      };
      root.innerHTML = coachSummaryHtml(g) +
        '<button class="back-link" id="report-back">← Mes parties</button><h1>Recherche des moments clés.</h1><p id="analysis-status" role="status">Chargement du moteur (environ 7 Mo au premier lancement)…</p><progress id="analysis-progress" max="1" value="0"></progress><button class="button secondary" id="analysis-cancel">Annuler</button>';
      $("#report-back", root).onclick = cancel;
      $("#analysis-cancel", root).onclick = cancel;
      try {
        await analyzePendingGame(g, taskEngine, {
          save: ctx.save,
          signal: task.signal,
          depth: matchMedia("(max-width:700px)").matches ? 12 : 16,
          state: ctx.state,
          onProgress: (n, total) => {
            if (disposed || task.signal.aborted || !$("#analysis-progress", root)) return;
            $("#analysis-progress", root).max = total;
            $("#analysis-progress", root).value = n;
            $("#analysis-status", root).textContent =
              n + " / " + total + " coups analysés.";
          },
        });
        if (task.signal.aborted) return;
      } catch (e) {
        if (!disposed && !task.signal.aborted) render();
        return;
      } finally {
        taskEngine.close();
        if (controller === task) {
          engine = null;
          controller = null;
        }
      }
    }
    if (disposed) return;
    const moments = g.analysis.moments.slice(0, 3);
    root.innerHTML = `<button class="back-link" id="report-back">← Mes parties</button><header class="page-intro"><span class="eyebrow">${esc(g.headers.White || "Blancs")} / ${esc(g.headers.Black || "Noirs")}</span><h1>${moments.length ? "Tes moments clés." : "Une partie sans grosse erreur détectée."}</h1><p>${g.analysis.analyzedMoves} de tes coups vérifiés. Les positions à retravailler sont enregistrées.</p></header>${coachSummaryHtml(g)}${moments.map((m, i) => `<article class="report-moment"><div id="report-board-${i}"></div><section><span class="eyebrow">COUP ${Math.ceil(m.ply / 2)} · ${m.severity.toUpperCase()}</span><h2>${esc(friendlyMistake(m.label))}</h2><p>Ton coup : <strong>${esc(describeMove(moveUci(new Chess(m.fen), m.played)))}</strong> Le logiciel préfère une autre suite. Joue les deux réponses pour comprendre ce qui change.</p><p id="report-line-${i}" class="notation"></p><button data-line="${i}" class="button primary">Voir le meilleur coup →</button><button data-played="${i}" class="button secondary">Revoir mon coup et sa réponse</button><a class="text-link" href="#lesson/${m.entryId}">Revoir le principe ↗</a></section></article>`).join("")}<a class="button primary" href="#train/mistakes">Retravailler mes erreurs →</a>`;
    $("#report-back", root).onclick = render;
    moments.forEach((m, i) => {
      const b = new PlayerBoard($("#report-board-" + i, root), gameAt(g, m.ply - 1), {
        side: g.color, names: { w: g.headers.White, b: g.headers.Black },
      });
      boards.push(b);
      root.querySelector(`[data-line="${i}"]`).onclick = () => {
        const game = gameAt(g, m.ply - 1),
          made = moveUci(game, m.best);
        b.animate(game, m.best);
        b.options.arrows = [[m.best.slice(0, 2), m.best.slice(2, 4)]];
        b.render();
        $("#report-line-" + i, root).textContent = describeMove(made);
      };
      root.querySelector(`[data-played="${i}"]`).onclick = () => {
        const game = gameAt(g, m.ply - 1),
          line = [m.played];
        if (m.reply) line.push(m.reply);
        const sans = [];
        for (const move of line) {
          try {
            sans.push(describeMove(moveUci(game, move)));
          } catch {
            break;
          }
        }
        b.set(game, {
          arrows: m.reply ? [[m.reply.slice(0, 2), m.reply.slice(2, 4)]] : [],
        });
        $("#report-line-" + i, root).textContent = sans.join(" ");
      };
    });
  };
  render();
  const pending = ctx.state.games.find((g) => g.autoAnalyze && !g.analysis);
  if (pending) {
    report(pending);
  }
  return () => {
    disposed = true;
    controller?.abort();
    engine?.close();
    for (const b of boards) b.destroy();
  };
}
