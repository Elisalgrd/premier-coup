import { Engine } from "../chess/engine.js";
import { analyzeGame } from "../chess/analysis.js";
import { Board } from "../chess/board.js";
import { Chess } from "../chess/chess.js";
import { moveUci, sanFr } from "../chess/notation.js";
import { parsePgn, importPublic, saveGames } from "./import.js";
import { esc, $ } from "../ui/helpers.js";
export async function startImport(ctx, root) {
  let disposed = false,
    engine = null,
    boards = [];
  const render = () => {
    root.innerHTML = `<a class="back-link" href="#train">← S’entraîner</a><header class="page-intro"><span class="eyebrow">APPRENDRE DE TES PARTIES</span><h1>Tes erreurs, tes exercices.</h1><p>Colle un PGN ou récupère tes dernières parties publiques. L’analyse reste sur ton appareil.</p></header><div class="import-grid"><section class="session-card"><h2>Coller une partie</h2><label class="form-label">PGN<textarea id="pgn-input" rows="7" placeholder="1. e4 e5 2. Cf3… (PGN anglais)"></textarea></label><label class="form-label">Tu jouais<select id="pgn-color"><option value="w">Les blancs</option><option value="b">Les noirs</option></select></label><button id="import-pgn" class="button primary">Ajouter la partie →</button></section><section class="session-card"><h2>Ton compte public</h2><label class="form-label">Plateforme<select id="import-platform"><option value="lichess">Lichess</option><option value="chesscom">Chess.com</option></select></label><label class="form-label">Pseudo<input id="import-user" autocomplete="off" value="${esc(ctx.state.preferences.lichess || "")}" placeholder="Ton pseudo"></label><button id="import-public" class="button secondary">Récupérer mes parties</button><small>20 parties maximum. Seul ton pseudo est envoyé au service choisi.</small></section></div><p id="import-feedback" role="status"></p><div class="section-title"><h2>Mes parties (${ctx.state.games.length})</h2></div><div class="game-list">${
      [...ctx.state.games]
        .reverse()
        .map(
          (g) =>
            `<article><div><strong>${esc(g.headers.White || "Blancs")} / ${esc(g.headers.Black || "Noirs")}</strong><small>${esc(g.source)} · ${Math.ceil(g.moves.length / 2)} coups · ${g.analysis ? "analysée" : "à analyser"}</small></div><button class="button secondary" data-analyze="${esc(g.id)}">${g.analysis ? "Voir le rapport" : "Analyser"} →</button></article>`,
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
    for (const button of root.querySelectorAll("[data-analyze]"))
      button.onclick = () =>
        report(ctx.state.games.find((g) => g.id === button.dataset.analyze));
  };
  const report = async (g) => {
    for (const b of boards) b.destroy();
    boards = [];
    if (!g.analysis) {
      engine = new Engine();
      root.innerHTML =
        '<button class="back-link" id="report-back">← Mes parties</button><h1>Recherche des moments clés.</h1><p id="analysis-status" role="status">Chargement du moteur (environ 7 Mo au premier lancement)…</p><progress id="analysis-progress" max="1" value="0"></progress><button class="button secondary" id="analysis-cancel">Annuler</button>';
      $("#report-back", root).onclick = () => {
        engine?.close();
        render();
      };
      $("#analysis-cancel", root).onclick = () => {
        engine.close();
        render();
      };
      try {
        await analyzeGame(g, engine, {
          depth: matchMedia("(max-width:700px)").matches ? 12 : 16,
          state: ctx.state,
          onProgress: (n, total) => {
            if (disposed || !$("#analysis-progress", root)) return;
            $("#analysis-progress", root).max = total;
            $("#analysis-progress", root).value = n;
            $("#analysis-status", root).textContent =
              n + " / " + total + " coups analysés.";
          },
        });
        ctx.save();
      } catch (e) {
        if (!disposed && $("#analysis-status", root))
          $("#analysis-status", root).textContent = e.message;
        return;
      } finally {
        engine.close();
        engine = null;
      }
    }
    if (disposed) return;
    const moments = g.analysis.moments.slice(0, 3);
    root.innerHTML = `<button class="back-link" id="report-back">← Mes parties</button><header class="page-intro"><span class="eyebrow">${esc(g.headers.White || "Blancs")} / ${esc(g.headers.Black || "Noirs")}</span><h1>${moments.length ? "Tes moments clés." : "Une partie sans grosse erreur détectée."}</h1><p>${g.analysis.analyzedMoves} de tes coups analysés, profondeur ${g.analysis.depth}. Les positions à retravailler sont enregistrées.</p></header>${moments.map((m, i) => `<article class="report-moment"><div id="report-board-${i}"></div><section><span class="eyebrow">COUP ${Math.ceil(m.ply / 2)} · ${m.severity.toUpperCase()}</span><h2>${esc(m.label)}</h2><p>Tu as joué <strong>${esc(m.playedSan)}</strong>. La suite proposée conserve environ ${(m.loss / 100).toFixed(1)} pion${m.loss >= 200 ? "s" : ""} d’évaluation.</p><p id="report-line-${i}" class="notation"></p><button data-line="${i}" class="button primary">Voir le meilleur coup →</button><button data-played="${i}" class="button secondary">Revoir mon coup et sa réponse</button><a class="text-link" href="#lesson/${m.entryId}">Revoir le principe ↗</a></section></article>`).join("")}<a class="button primary" href="#train/mistakes">Retravailler mes erreurs →</a>`;
    $("#report-back", root).onclick = render;
    moments.forEach((m, i) => {
      const b = new Board($("#report-board-" + i, root), {
        fen: m.fen,
        flipped: g.color === "b",
        interactive: false,
      });
      boards.push(b);
      root.querySelector(`[data-line="${i}"]`).onclick = () => {
        const game = new Chess(m.fen),
          made = moveUci(game, m.best);
        b.animate(game.fen(), m.best);
        b.options.arrows = [[m.best.slice(0, 2), m.best.slice(2, 4)]];
        b.render();
        $("#report-line-" + i, root).textContent =
          sanFr(made.san) + " : " + made.from + " → " + made.to;
      };
      root.querySelector(`[data-played="${i}"]`).onclick = () => {
        const game = new Chess(m.fen),
          line = [m.played];
        if (m.reply) line.push(m.reply);
        const sans = [];
        for (const move of line) {
          try {
            sans.push(sanFr(moveUci(game, move).san));
          } catch {
            break;
          }
        }
        b.set(game.fen(), {
          arrows: m.reply ? [[m.reply.slice(0, 2), m.reply.slice(2, 4)]] : [],
        });
        $("#report-line-" + i, root).textContent = sans.join(" ");
      };
    });
  };
  render();
  const pending = ctx.state.games.find((g) => g.autoAnalyze && !g.analysis);
  if (pending) {
    pending.autoAnalyze = false;
    report(pending);
  }
  return () => {
    disposed = true;
    engine?.close();
    for (const b of boards) b.destroy();
  };
}
