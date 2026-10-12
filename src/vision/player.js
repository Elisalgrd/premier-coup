import { Board } from "../chess/board.js";
import { Chess } from "../chess/chess.js";
import {
  squares,
  checks,
  endangeredPieces,
  knightPath,
} from "../chess/vision.js";
import { moveUci, sanFr, uci, describeMove } from "../chess/notation.js";
import { loadPuzzles } from "../learn/puzzles.js";
import { dateKey, esc, $ } from "../ui/helpers.js";
const games = {
  find: [
    "Trouve la case",
    "Touche la case annoncée. Objectif : 30 réponses en 30 secondes.",
  ],
  name: [
    "Nomme la case",
    "Une case est entourée. Choisis sa lettre et son chiffre.",
  ],
  loose: [
    "Pièces en prise",
    "Touche les pièces qu’on peut prendre en gagnant plus de points qu’on en perd.",
  ],
  count: [
    "Compte les attaquants",
    "Compte les pièces de chaque camp qui attaquent la case entourée.",
  ],
  knight: [
    "Chemin du cavalier",
    "Rejoins la cible en sautant avec le cavalier. Évite les cases rouges.",
  ],
  checks: [
    "Attaquer le roi",
    "Joue les coups qui attaquent le roi adverse. Cherche ensuite avec l’autre camp.",
  ],
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];
export function visionMenu(state) {
  return `<a href="#train" class="back-link">← S’entraîner</a><header class="page-intro"><span class="eyebrow">TON REGARD AVANT TES PLANS</span><h1>Une minute de vision.</h1><p>Des exercices courts pour voir les cases, les menaces et les attaques et les prises.</p></header><div class="training-grid">${Object.entries(
    games,
  )
    .map(
      ([id, [title, text]]) =>
        `<a href="#train/vision/${id}" class="training-card"><span>◎</span><h2>${title}</h2><p>${text}</p><strong>Record : ${state.vision[id]?.best || 0} · Jouer →</strong></a>`,
    )
    .join("")}</div>`;
}
export async function startVision(
  ctx,
  root,
  mode = "find",
  { onDone = null } = {},
) {
  if (!games[mode]) mode = "find";
  let disposed = false,
    clock = null,
    board,
    score = 0,
    errors = 0,
    left = ["find", "name"].includes(mode) ? 30 : 60,
    flipped = false,
    target,
    game,
    expected = [],
    found = new Set(),
    from,
    steps = 0,
    minSteps = 0,
    blocked = [];
  const rows = (await loadPuzzles("mixed")).rows;
  const save = () => {
    const s = (ctx.state.vision[mode] ??= { best: 0, runs: [] });
    s.best = Math.max(s.best, score);
    s.current = { score, errors, left };
    ctx.save();
  };
  const finish = () => {
    clearInterval(clock);
    board?.destroy();
    const s = (ctx.state.vision[mode] ??= { best: 0, runs: [] });
    s.best = Math.max(s.best, score);
    s.runs.push({
      day: dateKey(),
      score,
      errors,
      seconds: ["find", "name"].includes(mode) ? 30 : 60,
    });
    s.runs = s.runs.slice(-100);
    s.current = null;
    ctx.save();
    root.innerHTML = `<section class="completion"><span class="complete-icon">◎</span><h1>${score} repères trouvés.</h1><p>${errors} essais à corriger. Ton record : ${s.best}.</p><button class="button primary" id="vision-done">${onDone ? "Continuer la séance" : "Refaire une série"} →</button><a href="#train/vision" class="text-link">Choisir un autre exercice</a></section>`;
    $("#vision-done", root).onclick = () => (onDone ? onDone() : ctx.render());
  };
  root.innerHTML = `<a href="#train/vision" class="back-link">← Exercices de vision</a><header class="activity-header"><div><span class="eyebrow">${games[mode][0]}</span><h1 id="vision-prompt">Observe l’échiquier.</h1></div><span id="vision-clock" class="pill">${left} s</span></header><div class="play-layout"><section><div class="board-top"><strong id="vision-score">0 point</strong><button id="vision-flip" class="text-link">Blancs / noirs en bas ↻</button></div><div id="vision-board"></div><p id="vision-feedback" role="status" class="notation"></p></section><section class="play-coach"><p>${games[mode][1]}</p><div id="vision-controls"></div><button id="vision-start" class="button primary">Démarrer le chrono →</button><button id="vision-next" class="button secondary" hidden>Position suivante →</button></section></div>`;
  const feedback = (text, correct) => {
    const el = $("#vision-feedback", root);
    el.textContent = text;
    el.className = "notation " + (correct ? "success" : "error");
  };
  const success = () => {
    score++;
    $("#vision-score", root).textContent = score + " points";
    save();
  };
  const position = () => {
    board?.destroy();
    found = new Set();
    const controls = $("#vision-controls", root);
    controls.innerHTML = "";
    $("#vision-next", root).hidden = true;
    game = new Chess("7k/8/8/8/8/8/8/K7 w - - 0 1");
    target = pick(squares);
    expected = [];
    blocked = [];
    if (["loose", "count", "checks"].includes(mode)) {
      for (let tries = 0; tries < 100; tries++) {
        const row = pick(rows);
        game = new Chess(row[1]);
        moveUci(game, row[2].split(" ")[0]);
        if (game.isCheck()) continue;
        expected =
          mode === "loose"
            ? endangeredPieces(game)
            : mode === "checks"
              ? [...checks(game, "w"), ...checks(game, "b")].map((m) => uci(m))
              : [];
        if (mode === "count" || expected.length) break;
      }
      if (mode === "count")
        target = pick(
          squares.filter(
            (s) =>
              game.attackers(s, "w").length + game.attackers(s, "b").length > 0,
          ),
        );
    }
    if (mode === "knight") {
      game = new Chess("7k/8/3p1p2/8/8/8/8/K7 w - - 0 1");
      blocked = squares.filter((s) => game.isAttacked(s, "b") || game.get(s));
      from = pick(squares.filter((s) => !blocked.includes(s)));
      target = pick(
        squares.filter(
          (s) =>
            !blocked.includes(s) &&
            s !== from &&
            knightPath(from, s, blocked).length > 2,
        ),
      );
      game.put({ type: "n", color: "w" }, from);
      steps = 0;
      minSteps = knightPath(from, target, blocked).length - 1;
    }
    $("#vision-prompt", root).textContent =
      mode === "find"
        ? "Touche " + target + "."
        : mode === "name"
          ? "Quelle case est entourée ?"
          : mode === "loose"
            ? "Trouve les pièces en prise."
            : mode === "count"
              ? "Qui attaque " + target + " ?"
              : mode === "knight"
                ? "Rejoins " + target + " en " + minSteps + " coups."
                : "Trouve tous les échecs.";
    const tap = (s) => {
      if (!clock) return;
      if (mode === "find" || mode === "name") {
        if (s === target) {
          success();
          position();
          feedback("Oui, " + s + ".", true);
        } else {
          errors++;
          feedback("Tu as touché " + s + ". Cherche " + target + ".", false);
        }
      } else if (mode === "loose") {
        if (expected.includes(s) && !found.has(s)) {
          found.add(s);
          success();
          board.set(game.fen(), { marks: [...found] });
          feedback(
            found.size + " / " + expected.length + " pièces trouvées.",
            true,
          );
          if (found.size === expected.length)
            $("#vision-next", root).hidden = false;
        } else {
          errors++;
          feedback(
            "Vérifie les captures légales et les reprises sur " + s + ".",
            false,
          );
        }
      } else if (mode === "knight") {
        const path = knightPath(from, s, blocked);
        if (path.length !== 2) {
          errors++;
          feedback("Un saut de cavalier vers une case sûre.", false);
          return;
        }
        game.remove(from);
        game.put({ type: "n", color: "w" }, s);
        from = s;
        steps++;
        board.set(game.fen(), { marks: [target, ...blocked] });
        if (s === target) {
          board.options.interactive = false;
          board.render();
          success();
          feedback(
            steps + " coups joués. Minimum : " + minSteps + ".",
            steps === minSteps,
          );
          $("#vision-next", root).hidden = false;
        }
      }
    };
    board = new Board($("#vision-board", root), {
      fen: game.fen(),
      flipped,
      interactive: !!clock,
      marks: ["name", "count"].includes(mode)
        ? [target]
        : mode === "knight"
          ? [target, ...blocked]
          : [],
      onSquare: mode === "checks" || mode === "count" ? null : tap,
      onMove: (m) => {
        if (!clock || mode !== "checks") return;
        if (expected.includes(m) && !found.has(m)) {
          found.add(m);
          success();
          const g = new Chess(game.fen()),
            made = moveUci(g, m);
          board.set(game.fen(), {
            arrows: [[m.slice(0, 2), m.slice(2, 4)]],
            marks: [m.slice(2, 4)],
          });
          feedback(
            describeMove(made) + " " + found.size + " / " + expected.length,
            true,
          );
          if (found.size === expected.length)
            $("#vision-next", root).hidden = false;
        } else {
          errors++;
          feedback("Ce coup ne donne pas un nouvel échec.", false);
        }
      },
    });
    if (mode === "name") {
      const choices = [target];
      while (choices.length < 4) {
        const s = pick(squares);
        if (!choices.includes(s)) choices.push(s);
      }
      controls.innerHTML =
        '<div class="choice-grid">' +
        choices
          .sort(() => Math.random() - 0.5)
          .map(
            (s) =>
              `<button class="button secondary" data-answer="${s}">${s}</button>`,
          )
          .join("") +
        "</div>";
      controls.onclick = (e) => {
        const s = e.target.closest("[data-answer]")?.dataset.answer;
        if (s) tap(s);
      };
    }
    if (mode === "count") {
      controls.innerHTML =
        '<label class="form-label">Pièces blanches<input id="count-white" type="number" min="0" max="16" value="0" inputmode="numeric"></label><label class="form-label">Pièces noires<input id="count-black" type="number" min="0" max="16" value="0" inputmode="numeric"></label><button id="count-check" class="button secondary">Vérifier</button>';
      $("#count-check", root).onclick = () => {
        if (!clock) return;
        const white = game.attackers(target, "w"),
          black = game.attackers(target, "b");
        if (
          Number($("#count-white", root).value) === white.length &&
          Number($("#count-black", root).value) === black.length
        ) {
          success();
          feedback(
            "Oui : " + white.length + " blanches, " + black.length + " noires.",
            true,
          );
        } else {
          errors++;
          feedback(
            white.length +
              " blanches et " +
              black.length +
              " noires : suis les flèches.",
            false,
          );
        }
        board.set(game.fen(), {
          arrows: [...white, ...black].map((s) => [s, target]),
          marks: [target],
        });
        $("#vision-next", root).hidden = false;
        $("#count-check", root).disabled = true;
      };
    }
    if (mode === "checks") {
      controls.innerHTML =
        '<button class="button secondary" id="checks-side">Changer le camp qui joue</button>';
      $("#checks-side", root).onclick = () => {
        const parts = game.fen().split(" ");
        parts[1] = game.turn() === "w" ? "b" : "w";
        parts[3] = "-";
        game.load(parts.join(" "));
        board.set(game.fen(), {
          flipped: game.turn() === "b",
          marks: [],
          arrows: [],
        });
        feedback(
          "C’est aux " +
            (game.turn() === "w" ? "blancs de jouer." : "noirs de jouer."),
          true,
        );
      };
    }
  };
  position();
  $("#vision-start", root).onclick = () => {
    $("#vision-start", root).hidden = true;
    board.options.interactive = true;
    board.render();
    clock = setInterval(() => {
      if (document.visibilityState === "visible") {
        left--;
        $("#vision-clock", root).textContent = left + " s";
        if (left <= 0) finish();
      }
    }, 1000);
  };
  $("#vision-flip", root).onclick = () => {
    flipped = !flipped;
    board.options.flipped = flipped;
    board.render();
  };
  $("#vision-next", root).onclick = position;
  return () => {
    disposed = true;
    clearInterval(clock);
    board?.destroy();
  };
}
