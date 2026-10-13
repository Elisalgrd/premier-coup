import { mistakeRecapHtml, bindMistakeRecap } from "./mistake-recap.js";
import { coachSummaryHtml } from "./coach-panel.js";
import { Engine } from "../chess/engine.js";
import { analyzePendingGame } from "./analysis-task.js";
import { PlayerBoard, gameAt } from "../ui/player-strip.js";
import { parsePgn, importPublic, saveGames } from "./import.js";
import { simpleMove } from "../chess/coach-explanation.js";
import { esc, $ } from "../ui/helpers.js";
export async function startImport(ctx, root, gameId = null) {
  let disposed = false,
    engine = null,
    controller = null,
    boards = [];
  const render = () => {
    for (const b of boards) b.destroy();
    boards = [];
    root.innerHTML = `<a class="back-link" href="#train">← S’entraîner</a><header class="page-intro"><span class="eyebrow">APPRENDRE DE TES PARTIES</span><h1>Comprendre tes parties.</h1><p>Choisis une partie, regarde pourquoi un coup posait problème, puis retrouve une meilleure idée toi-même.</p></header><div class="section-title"><h2>Mes parties (${ctx.state.games.length})</h2></div><div class="game-list">${
      [...ctx.state.games]
        .reverse()
        .map(
          (g) =>
            `<article><div><strong>${esc(g.headers.White || "Blancs")} / ${esc(g.headers.Black || "Noirs")}</strong><small>${esc(g.source)} · ${Math.ceil(g.moves.length / 2)} coups · ${g.analysis ? "analysée" : ["running", "interrupted"].includes(g.analysisStatus) ? "Analyse interrompue, reprendre" : "à analyser"}</small></div><a class="button primary" href="#train/review-video/${esc(g.id)}">▶ Comprendre mes erreurs pas à pas</a><button class="text-link" data-review="${esc(g.id)}">Revoir la partie</button><button class="button secondary" data-analyze="${esc(g.id)}">${g.analysis ? "Voir le rapport" : "Analyser"} →</button></article>`,
        )
        .join("") || '<p>Aucune partie enregistrée pour le moment. <a href="#train/game">Jouer ma première partie →</a></p>'
    }</div><details class="import-options"><summary>Ajouter une partie de Chess.com ou Lichess</summary><div class="import-grid"><section class="session-card"><h2>Coller une partie</h2><label class="form-label">Texte de la partie (bouton « Copier PGN » sur Lichess ou Chess.com)<textarea id="pgn-input" rows="7" placeholder="Colle ici le texte copié depuis ton site d’échecs."></textarea></label><label class="form-label">Tu jouais<select id="pgn-color"><option value="w">Les blancs</option><option value="b">Les noirs</option></select></label><button id="import-pgn" class="button primary">Ajouter la partie →</button></section><section class="session-card"><h2>Ton compte public</h2><label class="form-label">Plateforme<select id="import-platform"><option value="lichess">Lichess</option><option value="chesscom">Chess.com</option></select></label><label class="form-label">Pseudo<input id="import-user" autocomplete="off" value="${esc(ctx.state.preferences.lichess || "")}" placeholder="Ton pseudo"></label><button id="import-public" class="button secondary">Récupérer mes parties</button><small>20 parties maximum. Seul ton pseudo est envoyé au service choisi.</small></section></div><p id="import-feedback" role="status"></p></details>`;
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
    root.innerHTML = `<button class="back-link" id="review-back">← Mes parties</button><h1>Revoir tous les coups.</h1><p>Pour comprendre tes erreurs avec les explications du coach : <a class="text-link" href="#train/review-video/${esc(record.id)}">ouvrir la revue guidée →</a></p><div class="play-layout"><section><div id="replay-board"></div></section><section class="play-coach"><p id="replay-move" role="status"></p><div class="demo-controls"><button class="button secondary" id="replay-prev">← Coup précédent</button><button class="button primary" id="replay-next">Coup suivant →</button></div><button class="text-link" id="replay-report">${record.analysis ? "Voir le rapport" : "Analyser cette partie"} →</button></section></div>`;
    const board = new PlayerBoard($("#replay-board", root), gameAt(record, 0), { side: record.color, names: { w: record.headers.White, b: record.headers.Black } });
    boards = [board];
    const show = () => {
      const game = gameAt(record, ply), move = game.history({ verbose: true }).at(-1);
      board.set(game, { last: move ? [move.from, move.to] : [] });
      $("#replay-move", root).textContent = move ? `${ply} / ${record.moves.length} : ${simpleMove(move, move.color === record.color)}` : "Position de départ.";
      $("#replay-prev", root).disabled = ply === 0;
      $("#replay-next", root).disabled = ply === record.moves.length;
    };
    $("#replay-prev", root).onclick = () => { ply--; show(); };
    $("#replay-next", root).onclick = () => { ply++; show(); };
    $("#review-back", root).onclick = render;
    $("#replay-report", root).onclick = () => report(record);
    show();
  };
  const report = async (g, force = false) => {
    for (const b of boards) b.destroy();
    boards = [];
    if (!g.analysis || force) {
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
    const count = (g.analysis.allMoments || g.analysis.moments || []).length;
    root.innerHTML = `<button class="back-link" id="report-back">← Mes parties</button><header class="page-intro"><span class="eyebrow">BILAN DE TA PARTIE</span><h1>${count ? `${count} moment${count > 1 ? "s" : ""} à comprendre.` : "Pas de grosse erreur détectée."}</h1><p>${g.analysis.analyzedMoves} de tes coups vérifiés. Tes positions à retravailler sont enregistrées.</p></header>${!Array.isArray(g.analysis.allMoments) ? '<button class="button secondary" id="analysis-full">Relancer l’analyse complète</button>' : ""}<a class="button primary" href="#train/review-video/${esc(g.id)}">Comprendre mes erreurs pas à pas →</a>${mistakeRecapHtml(g)}<details><summary>Les alertes reçues pendant la partie</summary>${coachSummaryHtml(g)}</details>`;
    $("#report-back", root).onclick = render;
    if ($("#analysis-full", root)) $("#analysis-full", root).onclick = () => report(g, true);
    bindMistakeRecap(root, g);
  };
  render();
  const pending = ctx.state.games.find((g) => g.id === gameId) || ctx.state.games.find((g) => g.autoAnalyze && !g.analysis);
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
