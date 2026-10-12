import { Chess } from "../chess/chess.js";
import { Board } from "../chess/board.js";
import { Engine } from "../chess/engine.js";
import { beginnerMove } from "../chess/beginner.js";
import { endangeredPieces } from "../chess/vision.js";
import { moveUci, sanFr } from "../chess/notation.js";
import { parsePgn, saveGames } from "./import.js";
import { loadEntry } from "../learn/catalogue.js";
import { esc, $, duration } from "../ui/helpers.js";
export async function startGame(ctx, root, entryId = null) {
  let board,
    engine,
    clock,
    disposed = false,
    busy = false,
    game,
    side = "w",
    level = 1,
    tokens = 5,
    time = { w: 600, b: 600 },
    gameId = null;
  let initial = new Chess().fen();
  if (entryId) {
    const e = await loadEntry(entryId);
    initial = e.entryChallenge.fen;
    side = initial.split(" ")[1];
  }
  const saved = ctx.state.activeGame;
  root.innerHTML = `<a class="back-link" href="#train">← S’entraîner</a><header class="page-intro"><span class="eyebrow">JOUER, PUIS COMPRENDRE</span><h1>Une partie à ton rythme.</h1><p>Les premiers niveaux font des erreurs. Le coach peut t’aider cinq fois pendant la partie.</p></header><section class="session-card"><label class="form-label">Adversaire<select id="game-level">${["1 · Découverte (repère ≈ 400)", "2 · Premiers réflexes (≈ 600)", "3 · Consolidation (≈ 800)", "4 · Stockfish, compétence 0", "5 · Stockfish, compétence 3", "6 · Stockfish, compétence 6", "7 · Stockfish, compétence 10", "8 · Stockfish, compétence 15"].map((x, i) => `<option value="${i + 1}">${x}</option>`).join("")}</select></label><label class="form-label">Tu joues<select id="game-color"><option value="w" ${side === "w" ? "selected" : ""}>Les blancs</option><option value="b" ${side === "b" ? "selected" : ""}>Les noirs</option></select></label><label class="form-label">Temps par camp<select id="game-time"><option value="600">10 minutes</option><option value="900">15 minutes</option><option value="1800">30 minutes</option></select></label><button id="game-start" class="button primary">Commencer →</button>${saved && !entryId ? '<button id="game-resume" class="button secondary">Reprendre ma partie →</button>' : ""}</section>`;
  const persist = () => {
    ctx.state.activeGame = {
      id: gameId,
      pgn: game.pgn(),
      initialFen: initial,
      side,
      level,
      tokens,
      time,
    };
    ctx.save();
  };
  const finish = (reason) => {
    if (disposed) return;
    clearInterval(clock);
    engine?.close();
    engine = null;
    board.options.interactive = false;
    board.render();
    const record = parsePgn(game.pgn(), {
      color: side,
      source: "Premier coup, niveau " + level,
      id: gameId,
    });
    record.autoAnalyze = true;
    record.resultReason = reason;
    saveGames(ctx.state, [record]);
    ctx.state.activeGame = null;
    ctx.save();
    $("#game-feedback", root).innerHTML =
      `<h2>${esc(reason)}</h2><p>Ta partie est enregistrée. Retrouve maintenant tes moments clés.</p><a href="#train/import" class="button primary">Voir l’analyse →</a>`;
    $("#game-stop", root).hidden = true;
    ctx.navigate("train/import");
  };
  const update = () => {
    $("#game-turn", root).textContent =
      game.turn() === side ? "À toi de jouer." : "L’adversaire réfléchit…";
    $("#game-moves", root).textContent = game.history().map(sanFr).join(" ");
    $("#game-coach", root).textContent =
      "Vérifier ma position (" + tokens + " / 5)";
    $("#game-coach", root).disabled = tokens === 0 || busy;
    for (const c of ["w", "b"])
      $("#clock-" + c, root).textContent = duration(time[c]);
    persist();
  };
  const terminal = () => {
    if (game.isGameOver()) {
      finish(
        game.isCheckmate()
          ? game.turn() === side
            ? "Échec et mat."
            : "Tu as fait échec et mat."
          : "Partie nulle.",
      );
      return true;
    }
    return false;
  };
  const reply = async () => {
    if (disposed || game.turn() === side || terminal()) return;
    busy = true;
    board.options.interactive = false;
    board.render();
    update();
    try {
      let move;
      if (level <= 3) move = beginnerMove(game, level);
      else {
        engine ??= new Engine();
        $("#game-feedback", root).textContent = "Le moteur prépare son coup…";
        move = (
          await engine.search(game.fen(), {
            skill: [0, 3, 6, 10, 15][level - 4],
            movetime: [100, 200, 350, 500, 800][level - 4],
          })
        ).best;
      }
      if (disposed || !move) return;
      moveUci(game, move);
      board.animate(game.fen(), move);
      $("#game-feedback", root).textContent = game.isCheck()
        ? "Ton roi est en échec. Protège-le."
        : "";
      busy = false;
      if (!terminal()) {
        board.options.interactive = true;
        board.render();
        update();
      }
    } catch (e) {
      busy = false;
      if (!disposed) {
        $("#game-feedback", root).innerHTML =
          `<p>${esc(e.message)}</p><button id="game-retry" class="button secondary">Réessayer le moteur</button>`;
        $("#game-retry", root).onclick = () => {
          engine?.close();
          engine = null;
          reply();
        };
      }
    }
  };
  const launch = (resume = false) => {
    gameId = resume ? saved.id : crypto.randomUUID();
    if (resume) {
      initial = saved.initialFen;
      game = new Chess(initial);
      if (saved.pgn) game.loadPgn(saved.pgn);
      ({ side, level, tokens, time } = saved);
    } else {
      side = $("#game-color", root).value;
      level = Number($("#game-level", root).value);
      const seconds = Number($("#game-time", root).value);
      time = { w: seconds, b: seconds };
      game = new Chess(initial);
      game.setHeader("White", side === "w" ? "Toi" : "Coach");
      game.setHeader("Black", side === "b" ? "Toi" : "Coach");
    }
    root.innerHTML = `<a class="back-link" href="#train">← S’entraîner (partie conservée)</a><header class="activity-header"><div><span class="eyebrow">NIVEAU ${level}</span><h1 id="game-turn">À toi de jouer.</h1></div></header><div class="play-layout"><section><div class="board-top"><span>Noirs <strong id="clock-b"></strong></span><span>Blancs <strong id="clock-w"></strong></span></div><div id="game-board"></div></section><section class="play-coach"><div id="game-feedback" role="status"></div><button id="game-coach" class="button secondary">Vérifier ma position</button><p id="game-moves" class="notation"></p><button id="game-stop" class="text-link">Terminer et analyser cette partie</button><small>Le chrono se suspend quand tu quittes cet écran.</small></section></div>`;
    board = new Board($("#game-board", root), {
      fen: game.fen(),
      flipped: side === "b",
      onMove: (m) => {
        if (busy || game.turn() !== side) return;
        try {
          moveUci(game, m);
        } catch {
          return;
        }
        board.animate(game.fen(), m);
        update();
        if (!terminal()) reply();
      },
    });
    $("#game-coach", root).onclick = () => {
      if (tokens <= 0) return;
      tokens--;
      const marks = endangeredPieces(game);
      board.set(game.fen(), { marks });
      $("#game-feedback", root).textContent = marks.length
        ? "Pièces exposées : " +
          marks.join(", ") +
          ". Vérifie les captures et les reprises."
        : "Aucune capture gagnante immédiate détectée. Vérifie aussi les échecs et les menaces.";
      update();
    };
    $("#game-stop", root).onclick = () => {
      if (game.history().length) finish("Partie terminée pour analyse.");
      else
        $("#game-feedback", root).textContent =
          "Joue au moins un coup avant de lancer une analyse.";
    };
    clock = setInterval(() => {
      if (disposed || document.visibilityState !== "visible") return;
      time[game.turn()] = Math.max(0, time[game.turn()] - 1);
      $("#clock-" + game.turn(), root).textContent = duration(
        time[game.turn()],
      );
      if (time[game.turn()] === 0) finish("Temps écoulé.");
      else if (time[game.turn()] % 10 === 0) persist();
    }, 1000);
    update();
    reply();
  };
  $("#game-start", root).onclick = () => launch();
  if ($("#game-resume", root))
    $("#game-resume", root).onclick = () => launch(true);
  return () => {
    disposed = true;
    clearInterval(clock);
    board?.destroy();
    engine?.close();
  };
}
