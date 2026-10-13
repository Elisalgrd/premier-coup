import { nextGameRule } from "./mistake-recap.js";
import { CoachAlerts, currentBadge } from "./coach-alerts.js";
import { playerStrip } from "../ui/player-strip.js";
import { LiveCoach, coachModes, coachMode } from "./live-coach.js";
import { CoachPanel } from "./coach-panel.js";
import { timeControls, applyIncrement, takeback, takebackCount } from "./training-game.js";
import { rememberMistake } from "../learn/srs.js";
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
    finished = false,
    epoch = 0,
    coach = null,
    panel = null,
    alertUI = null,
    alerts = [],
    takebacks = 0,
    increment = 10,
    liveCoach = coachMode(ctx.state.preferences.liveCoach),
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
  const reminder = nextGameRule(ctx.state.games.at(-1));
  let reminderShown = false;
  root.innerHTML = `<a class="back-link" href="#train">← S’entraîner</a><header class="page-intro"><span class="eyebrow">JOUER, PUIS COMPRENDRE</span><h1>Une partie à ton rythme.</h1><p>Les premiers niveaux font des erreurs. Le coach explique tes erreurs après tes coups. Tu peux aussi vérifier ta position cinq fois avant de jouer.</p></header>${reminder ? `<aside class="next-game-rule"><strong>Rappel de ta dernière partie</strong><p>${esc(reminder)}</p></aside>` : ""}<section class="session-card"><label class="form-label">Adversaire<select id="game-level">${["1 · Découverte (repère ≈ 400)", "2 · Premiers réflexes (≈ 600)", "3 · Consolidation (≈ 800)", "4 · Un adversaire attentif", "5 · Des menaces à repérer", "6 · Un vrai défi", "7 · Peu d’erreurs à exploiter", "8 · Le défi le plus difficile"].map((x, i) => `<option value="${i + 1}">${x}</option>`).join("")}</select></label><label class="form-label">Tu joues<select id="game-color"><option value="w" ${side === "w" ? "selected" : ""}>Les blancs</option><option value="b" ${side === "b" ? "selected" : ""}>Les noirs</option></select></label><label class="form-label">Temps par camp<select id="game-time">${timeControls.map((t) => `<option value="${t.id}">${t.label}</option>`).join("")}</select></label><p class="small muted">Les secondes ajoutées après chaque coup te laissent le temps de vérifier les menaces.</p><label class="form-label">Coach en direct<select id="game-live-coach">${Object.entries(coachModes).map(([key, label]) => `<option value="${key}" ${key === liveCoach ? "selected" : ""}>${label}</option>`).join("")}</select></label><button id="game-start" class="button primary">Commencer →</button>${saved && !entryId ? '<button id="game-resume" class="button secondary">Reprendre ma partie →</button>' : ""}</section>`;
  const persist = () => {
    ctx.state.activeGame = {
      id: gameId,
      pgn: game.pgn(),
      initialFen: initial,
      side,
      level,
      tokens,
      time, increment, liveCoach, alerts, takebacks,
    };
    ctx.save();
  };
  const finish = (reason) => {
    if (disposed || finished) return;
    finished = true;
    epoch++;
    clearInterval(clock);
    coach?.close();
    engine?.close();
    engine = null;
    board.options.interactive = false;
    board.render();
    if (!game.history().length) {
      ctx.state.activeGame = null;
      ctx.save();
      $("#game-feedback", root).textContent = reason;
      return;
    }
    if (game.isCheckmate()) game.setHeader("Result", game.turn() === "w" ? "0-1" : "1-0");
    else if (game.isDraw()) game.setHeader("Result", "1/2-1/2");
    else if (time.w === 0 || time.b === 0) game.setHeader("Result", time.w === 0 ? "0-1" : "1-0");
    const record = parsePgn(game.pgn(), {
      color: side,
      source: "Premier coup, niveau " + level,
      id: gameId,
    });
    Object.assign(record, { liveCoach, alerts, takebacks, increment });
    record.autoAnalyze = true;
    record.resultReason = reason;
    saveGames(ctx.state, [record]);
    ctx.state.activeGame = null;
    ctx.save();
    $("#game-feedback", root).innerHTML =
      `<h2>${esc(reason)}</h2><p>Ta partie est enregistrée. Comprends tes erreurs, puis retrouve les meilleurs coups.</p><a href="#train/review-video/${esc(record.id)}" class="button primary">▶ Revoir mes erreurs en vidéo</a><a href="#train/import/${esc(record.id)}" class="button secondary">Voir l’analyse →</a>`;
    $("#game-stop", root).hidden = true;
    alertUI?.close();
    $("#game-feedback", root).scrollIntoView({ block: "center" });
  };
  const update = () => {
    $("#game-turn", root).textContent =
      game.turn() === side ? "À toi de jouer." : "L’adversaire réfléchit…";
    $("#game-moves", root).textContent = game.history().map(sanFr).join(" ");
    $("#game-coach", root).textContent =
      "Vérifier ma position (" + tokens + " / 5)";
    $("#game-coach", root).disabled = tokens === 0 || busy || game.turn() !== side || finished;
    panel?.update();
    for (const [id, color] of [["player-above", side === "w" ? "b" : "w"], ["player-below", side]])
      $("#" + id, root).innerHTML = playerStrip(game, color, { name: color === side ? "Toi" : "Adversaire", seconds: time[color], clockId: "clock-" + color });
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
    if (disposed || finished || busy || game.turn() === side || terminal()) return;
    const ticket = epoch, expectedFen = game.fen();
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
      if (disposed || finished || ticket !== epoch || game.fen() !== expectedFen || !move) return;
      const movingColor = game.turn();
      moveUci(game, move);
      applyIncrement(time, movingColor, increment);
      board.animate(game.fen(), move);
      $("#game-feedback", root).textContent = game.isCheck()
        ? "Ton roi est en échec. Protège-le."
        : "";
      busy = false;
      if (!terminal()) {
        board.options.interactive = true;
        board.render();
        update();
        coach?.prepare(game.fen());
      }
    } catch (e) {
      if (ticket !== epoch || disposed || finished) return;
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
  const newCoach = () => {
    coach?.close();
    coach = new LiveCoach({ mode: liveCoach, mobile: matchMedia("(max-width:700px)").matches });
  };
  const rewind = (alert) => {
    if (disposed || finished || !takebackCount(game, alert, liveCoach, takebacks)) return false;
    epoch++;
    engine?.close();
    engine = null;
    newCoach();
    if (!takeback(game, alert, { mode: liveCoach, used: takebacks, time })) return false;
    takebacks++;
    busy = false;
    board.set(game.fen(), { interactive: true, marks: [], arrows: [], last: [], badges: [] });
    $("#game-feedback", root).textContent = `Coup repris. Cherche une meilleure réponse. ${3 - takebacks} reprise${takebacks === 2 ? "" : "s"} restante${takebacks === 2 ? "" : "s"}.`;
    update();
    coach.prepare(game.fen());
    return true;
  };
  const assess = (fen, move, ply, timeBefore) => {
    const ticket = epoch;
    coach.afterMove(fen, move).then((message) => {
      if (!message || disposed || finished || ticket !== epoch) return;
      if (alerts.some((a) => a.ply === ply && a.fen === fen && a.played === move && !a.retracted)) return;
      const alert = { ...message, ply, timeBefore, at: Date.now() };
      alerts.push(alert);
      rememberMistake(ctx.state, gameId, alert);
      persist();
      panel.add(alert);
      board.options.badges = currentBadge(alert, game.history().length, liveCoach);
      board.render();
      alertUI.notify(alert);
    }).catch(() => {});
  };
  const launch = (resume = false) => {
    gameId = resume ? saved.id : crypto.randomUUID();
    if (resume) {
      initial = saved.initialFen;
      game = new Chess(initial);
      if (saved.pgn) game.loadPgn(saved.pgn);
      ({ side, level, tokens, time } = saved);
      increment = saved.increment || 0;
      liveCoach = coachMode(saved.liveCoach ?? ctx.state.preferences.liveCoach);
      alerts = saved.alerts || [];
      takebacks = saved.takebacks || 0;
    } else {
      side = $("#game-color", root).value;
      level = Number($("#game-level", root).value);
      const control = timeControls.find((t) => t.id === $("#game-time", root).value) || timeControls[0];
      const seconds = control.seconds;
      increment = control.increment;
      liveCoach = coachMode($("#game-live-coach", root).value);
      ctx.state.preferences.liveCoach = liveCoach;
      time = { w: seconds, b: seconds };
      game = new Chess(initial);
      game.setHeader("TimeControl", seconds + "+" + increment);
      game.setHeader("White", side === "w" ? "Toi" : "Adversaire");
      game.setHeader("Black", side === "b" ? "Toi" : "Adversaire");
    }
    newCoach();
    root.innerHTML = `<a class="back-link" href="#train">← S’entraîner (partie conservée)</a><header class="activity-header"><div><span class="eyebrow">NIVEAU ${level}</span><h1 id="game-turn">À toi de jouer.</h1></div></header><div class="play-layout"><section><div id="player-above"></div><div id="game-board"></div><div id="player-below"></div></section><section class="play-coach"><div id="game-feedback" role="status"></div><button id="game-coach" class="button secondary">Vérifier ma position</button><div id="coach-sheet"><div class="coach-sheet-handle"><span></span><button aria-label="Fermer le conseil">✕</button></div><div id="live-coach-panel"></div></div><details><summary>Coups joués</summary><p id="game-moves" class="notation"></p></details><button id="game-stop" class="text-link">Terminer et analyser cette partie</button><small>${increment ? `${increment} secondes ajoutées après chaque coup. ` : ""}Le chrono se suspend quand tu quittes cet écran.</small></section></div>`;
    panel = new CoachPanel($("#live-coach-panel", root), {
      side, alerts, canTakeback: (alert) => !finished && !!takebackCount(game, alert, liveCoach, takebacks),
      onTakeback: rewind, onDismiss: persist,
    });
    $("#live-coach-panel", root).hidden = liveCoach === "off";
    alertUI = new CoachAlerts(root, panel, alerts);
    board = new Board($("#game-board", root), {
      fen: game.fen(),
      flipped: side === "b",
      onBadge: () => alertUI.open(),
      onMove: (m) => {
        if (busy || disposed || finished || game.turn() !== side) return;
        const fen = game.fen(), timeBefore = { ...time };
        try {
          moveUci(game, m);
        } catch {
          return;
        }
        if (!reminderShown && reminder && liveCoach !== "off") { alertUI.remind(reminder); reminderShown = true; }
        alertUI.close();
        board.options.badges = [];
        applyIncrement(time, side, increment);
        board.animate(game.fen(), m);
        assess(fen, m, game.history().length, timeBefore);
        update();
        if (!terminal()) reply();
      },
    });
    $("#game-coach", root).onclick = () => {
      if (tokens <= 0 || busy || finished || game.turn() !== side) return;
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
      if (disposed || finished || document.visibilityState !== "visible") return;
      time[game.turn()] = Math.max(0, time[game.turn()] - 1);
      $("#clock-" + game.turn(), root).textContent = duration(
        time[game.turn()],
      );
      if (time[game.turn()] === 0) finish("Temps écoulé.");
      else if (time[game.turn()] % 10 === 0) persist();
    }, 1000);
    update();
    if (game.turn() === side) coach.prepare(game.fen());
    reply();
  };
  $("#game-start", root).onclick = () => launch();
  if ($("#game-resume", root))
    $("#game-resume", root).onclick = () => launch(true);
  return () => {
    if (game && !finished) persist();
    disposed = true;
    epoch++;
    coach?.close();
    panel?.destroy();
    alertUI?.destroy();
    clearInterval(clock);
    board?.destroy();
    engine?.close();
  };
}
