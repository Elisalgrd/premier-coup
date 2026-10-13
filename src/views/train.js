import { dailyCourseCard } from "./today.js";
import { essentialsLink } from "./essentials.js";
import { pendingAnalysisCard } from "../play/analysis-task.js";
import { esc } from "../ui/helpers.js";
export function trainView(entries, state) {
  return `<header class="page-intro"><span class="eyebrow">CHOISIS TON ENTRAÎNEMENT</span><h1>Apprendre, puis essayer.</h1><p>Ton parcours commence par un cours. Les activités libres sont juste en dessous.</p></header>${dailyCourseCard(entries,state)}<div class="section-title"><h2>Pratique libre</h2></div>${essentialsLink()}${pendingAnalysisCard(state)}<div class="training-grid">${[
    [
      "puzzles",
      "◇",
      "Problèmes mélangés",
      "Trouve une prise ou une attaque sans connaître le thème à l’avance.",
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
      "Revois les idées que tu as déjà apprises.",
      "Réviser",
    ],
    [
      "vision",
      "◎",
      "Vision de l’échiquier",
      "Apprends à voir les cases et les pièces qui peuvent être prises.",
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
      "Comprendre mes parties",
      "Retrouve tes parties et comprends tes erreurs, une étape à la fois.",
      "Mes parties",
    ],
    [
      "woodpecker",
      "◷",
      "Refaire les mêmes problèmes",
      "Rejoue les mêmes positions et compare tes réussites.",
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
