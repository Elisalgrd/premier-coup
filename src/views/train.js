import { esc } from "../ui/helpers.js";
export function trainView(entries) {
  return `<header class="page-intro"><span class="eyebrow">CHOISIS TON ENTRAÎNEMENT</span><h1>À toi de jouer.</h1><p>Tu peux t’entraîner directement, sans relancer une leçon.</p></header><div class="training-grid">${[
    [
      "puzzles",
      "◇",
      "Problèmes mélangés",
      "Repère le motif sans connaître son nom à l’avance.",
      "Résoudre",
    ],
    [
      "mistakes",
      "!",
      "Mes erreurs de partie",
      "Rejoue les positions où tu pouvais faire mieux.",
      "Retrouver",
    ],
    [
      "reviews",
      "↻",
      "Mes révisions",
      "Retrouve les positions et les principes à consolider.",
      "Réviser",
    ],
    [
      "vision",
      "◎",
      "Vision de l’échiquier",
      "Cases, attaques, pièces en prise : entraîne ton regard.",
      "Observer",
    ],
    [
      "game",
      "♞",
      "Jouer une partie",
      "Un adversaire adapté, puis tes moments clés.",
      "Jouer",
    ],
    [
      "import",
      "↥",
      "Analyser mes parties",
      "Importe un PGN ou tes parties publiques.",
      "Importer",
    ],
    [
      "woodpecker",
      "◷",
      "Le pic-vert",
      "Retrouve les mêmes motifs, plus vite à chaque cycle.",
      "Choisir un cycle",
    ],
  ]
    .map(
      ([id, icon, title, text, cta]) =>
        `<a class="training-card" href="#train/${id}"><span>${icon}</span><h2>${title}</h2><p>${text}</p><strong>${cta} →</strong></a>`,
    )
    .join(
      "",
    )}</div><div class="section-title"><h2>Un thème précis</h2></div><div class="theme-links">${entries
    .filter((e) => e.domain === "tactique" || e.domain === "mats")
    .map((e) => `<a href="#train/puzzles/${e.id}">${esc(e.title)} ↗</a>`)
    .join("")}</div>`;
}
