import fs from "node:fs";
const map = {
  "ouv-principles": ["course-italian", "course-king-safety"],
  "ouv-white-italian": ["course-italian", "scotch", "london"],
  "ouv-black-e5": ["sicilian", "caro-kann", "french"],
  "ouv-black-d5": ["queens-gambit"],
  "ouv-gambits": ["queens-gambit"],
  "proc-exchange-count": ["course-captures"],
  "tac-fork": ["course-forks"],
  "tac-pin": ["course-pins"],
  "mat-back-rank": ["course-mates"],
  "str-worst-piece": ["course-active-piece"],
  "str-pawn-structure": ["pawn-break"],
  "str-king-safety-middlegame": ["coordinated-attack"],
  "fin-convert": ["convert-advantage"],
};
const sourceMap = {
  "proc-opponent-threat": [
    "Identifier et parer les menaces",
    "https://fr.linkedin.com/posts/juliensong_cest-la-raison-num%C3%A9ro-1-qui-font-que-les-activity-7255837111466037248-kwv8",
  ],
  "proc-forcing-moves": [
    "Les coups gagnants que tu rates sans le savoir",
    "https://juliensong.beehiiv.com/p/les-coups-gagnants-que-tu-rates-sans-le-savoir",
  ],
  "ouv-principles": [
    "Ce que cachent les trois principes de l’ouverture",
    "https://juliensong.beehiiv.com/p/ce-que-cachent-3-grands-principes-ouverture-echecs",
  ],
  "proc-candidates-calc": [
    "Le temps que tu perds à calculer pour rien",
    "https://juliensong.beehiiv.com/p/le-temps-que-tu-perds-calculer-pour-rien",
  ],
  "meta-game-review": [
    "Pourquoi tu plafonnes aux échecs",
    "https://juliensong.beehiiv.com/p/pourquoi-tu-plafonnes-aux-checs-et-comment-repartir",
  ],
};
for (const file of fs.readdirSync("curriculum/entries")) {
  const p = "curriculum/entries/" + file,
    e = JSON.parse(fs.readFileSync(p));
  e.videos = map[e.id] || [];
  e.videoId = e.videos[0] || null;
  if (sourceMap[e.id]) {
    const [label, url] = sourceMap[e.id];
    e.sources = [{ label: "Julien Song : " + label, url }];
  }
  fs.writeFileSync(p, JSON.stringify(e, null, 2) + "\n");
}
const names = {
  "course-captures": "Prendre sans se faire reprendre",
  "course-italian": "Les idées de l’italienne",
  "course-king-safety": "Protéger son roi",
  "course-forks": "La fourchette",
  "course-pins": "Le clouage",
  "course-mates": "Reconnaître le mat du couloir",
  "course-active-piece": "Activer ses pièces",
  scotch: "L’écossaise",
  london: "Le système de Londres",
  "queens-gambit": "Le gambit dame",
  "caro-kann": "La Caro-Kann",
  french: "La défense française",
  sicilian: "La défense sicilienne",
  "pawn-break": "Les ruptures de pions",
  "coordinated-attack": "Coordonner une attaque",
  "convert-advantage": "Convertir un avantage",
};
fs.writeFileSync("curriculum/videos.json", JSON.stringify(names, null, 2));
