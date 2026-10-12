import fs from "node:fs";
const edits = [
  [
    "fin-lucena",
    "Principe",
    "Roi devant son pion sur la septième, roi adverse coupé : prépare un pont. La tour rejoint la quatrième rangée et bloque les échecs latéraux.",
  ],
  [
    "fin-opposition",
    "Principe",
    "Les rois se font face, séparés par une case. Celui qui n’a pas le trait possède l’opposition. Il peut souvent repousser l’autre roi.",
  ],
  [
    "fin-opposition",
    "Règles à enseigner",
    "Pour un pion sur la deuxième, troisième ou quatrième rangée, les cases clés sont deux rangées devant. Avec un pion e4 : d6, e6 et f6. Ton roi veut les atteindre.",
  ],
  [
    "fin-passed-pawn",
    "Contenu",
    "Un pion passé protégé est défendu par un pion. Un pion passé éloigné attire le roi loin des autres pions. Bloque le pion adverse avec une pièce, idéalement un cavalier. Une majorité de pions permet de créer un pion passé.",
  ],
  [
    "fin-philidor",
    "Principe",
    "En défense, garde le roi devant le pion et la tour sur ta troisième rangée. Dès que le pion avance, donne des échecs par derrière. Pour les noirs, la tour défend d’abord sur la sixième rangée.",
  ],
  [
    "fin-queen-vs-pawn",
    "Principe",
    "Contre un pion central ou de cavalier sur la septième, combine les échecs avec le rapprochement du roi. Contre un pion de fou ou de tour, cherche les ressources de pat. Un roi attaquant éloigné laisse souvent la nulle.",
  ],
  [
    "fin-rook-behind",
    "Principe",
    "Place ta tour derrière les pions passés. Derrière les tiens, elle aide leur avance. Derrière ceux de l’adversaire, elle les freine.",
  ],
  [
    "fin-square",
    "Méthode",
    "Le côté du carré correspond à la distance du pion à sa promotion. S’il peut encore avancer de deux cases, compte depuis sa case d’arrivée.",
  ],
  [
    "mat-anastasia",
    "Principe",
    "Le cavalier en e7 bloque des cases de fuite. La tour ou la dame mate sur la colonne h.",
  ],
  [
    "mat-arabian",
    "Principe",
    "Le cavalier protège la tour collée au roi dans le coin. Il contrôle aussi une case de fuite.",
  ],
  [
    "mat-back-rank",
    "Principe",
    "Ses pions peuvent enfermer le roi roqué. Une tour ou une dame peut alors mater sur sa dernière rangée.",
  ],
  [
    "mat-back-rank",
    "Méthode",
    "Vérifie les cases de fuite du roi adverse. Vérifie les défenseurs de sa dernière rangée. Fais entrer ta tour ou ta dame. Pour ton roi, prépare une case de fuite avec h3 ou g3 quand aucune menace urgente ne l’interdit.",
  ],
  [
    "mat-basic-queen",
    "Méthode",
    "Place ta dame à un saut de cavalier du roi adverse. Elle lui coupe une zone sans donner échec. Réduis progressivement son espace. Rapproche ton roi pour soutenir le mat au bord. Vérifie le pat avant chaque coup.",
  ],
  [
    "mat-basic-queen",
    "Piège",
    "Au bord, ne retire pas la dernière case du roi adverse sans donner échec. Sans autre coup légal, ce serait pat.",
  ],
  [
    "mat-basic-rook",
    "Méthode",
    "Coupe le roi adverse avec la tour. Approche ton roi pour soutenir la tour. Si les rois ne se font pas face, joue un coup d’attente avec la tour. Donne échec quand les rois se font face, pour repousser le roi adverse.",
  ],
  [
    "mat-patterns-misc",
    "Contenu",
    "Apprends d’abord le mat du crochet, puis celui des deux fous. Continue avec l’épaulette, la queue d’aronde et l’opéra. Ajoute ensuite les mats de Morphy et de Pillsbury.",
  ],
  [
    "mat-queen-support",
    "Pourquoi",
    "Une dame soutenue près du roi peut fermer ses sorties. Le roi ne peut pas la prendre. Repère notamment g7, h7 et f7 dans les attaques contre le petit roque.",
  ],
  [
    "mat-smothered",
    "Signaux",
    "Le roi adverse est dans un coin, entouré de ses propres pièces. Ton cavalier peut atteindre f7 ou f2. Ta dame peut donner échec en g8.",
  ],
  [
    "mat-smothered",
    "Méthode",
    "Un échec de cavalier chasse le roi dans le coin. Le sacrifice de dame en g8 oblige la tour à la prendre. Le cavalier mate ensuite en f7. Vérifie chaque réponse avant de sacrifier.",
  ],
  [
    "meta-game-review",
    "Pourquoi",
    "Tes erreurs montrent ce que tu ne repères pas encore. Retravaille celles qui reviennent : elles indiquent ta priorité.",
  ],
  [
    "meta-play-slow",
    "Principe",
    "Joue assez lentement pour appliquer ta routine à chaque coup. Vise au moins quinze minutes, avec dix secondes ajoutées par coup.",
  ],
  [
    "meta-time-management",
    "Principe",
    "Joue vite les coups évidents et les ouvertures connues. Garde ton temps pour les captures, sacrifices et décisions d’échange. La fin de l’ouverture mérite aussi une pause.",
  ],
  [
    "proc-blunder-check",
    "Pourquoi",
    "Entre débutants, une menace simple oubliée peut décider la partie. Vérifie les échecs et les captures avant ton projet.",
  ],
  [
    "proc-candidates-calc",
    "Pourquoi",
    "Calculer loin ne suffit pas si tu ignores une réponse gênante au premier coup. Compare d’abord les réponses adverses.",
  ],
  [
    "proc-candidates-calc",
    "Exercices spécifiques",
    "Sur les problèmes longs, imagine la suite avant de déplacer une pièce. Vérifie ensuite chaque réponse sur l’échiquier.",
  ],
  [
    "proc-free-material",
    "Piège",
    "Un pion gratuit peut éloigner ta dame de la défense. Il peut aussi ouvrir une ligne vers ton roi. Vérifie ces conséquences avant de prendre.",
  ],
  [
    "str-initiative",
    "Principe",
    "Avec davantage de pièces développées, ouvre le centre par des échanges de pions. Ton avance peut devenir une attaque. En retard, garde plutôt le jeu fermé.",
  ],
  [
    "str-outposts",
    "Principe",
    "Cherche une case avancée défendue par un de tes pions. Si aucun pion adverse ne peut l’attaquer, installe ton cavalier.",
  ],
  [
    "str-outposts",
    "Pourquoi",
    "Un cavalier stable au centre contrôle beaucoup de cases. Sans attaque de pion possible, l’adversaire doit souvent l’échanger pour le chasser.",
  ],
  [
    "str-worst-piece",
    "Signaux",
    "Repère le fou bloqué par tes pions. Cherche aussi un cavalier au bord, une tour enfermée ou une dame inactive.",
  ],
  [
    "tac-discovered",
    "Signaux",
    "Une tour, un fou ou une dame vise une cible adverse. Une de tes pièces bloque encore cette ligne.",
  ],
  [
    "tac-fork",
    "Types à couvrir",
    "Le cavalier peut attaquer roi et dame : c’est une fourchette royale. Un pion peut attaquer deux pièces voisines. La dame peut combiner échec et attaque d’une pièce. Le roi, le fou et la tour peuvent aussi créer des doubles attaques.",
  ],
  [
    "tac-pin",
    "Pourquoi",
    "Une pièce clouée au roi ne peut pas découvrir son roi. Attaque-la à nouveau, souvent avec un pion.",
  ],
  [
    "tac-pin",
    "Signaux",
    "Cherche une pièce alignée avec son roi ou sa dame. Ta tour, ton fou ou ta dame doit pouvoir viser cet alignement.",
  ],
  [
    "tac-quiet-move",
    "Principe",
    "Le coup gagnant ne donne pas toujours échec et ne capture pas toujours. Il peut créer une menace imparable ou supprimer une défense.",
  ],
  [
    "tac-skewer",
    "Signaux",
    "Cherche un roi devant une dame ou une tour, sur la même ligne. Une de tes pièces longues doit atteindre cette ligne.",
  ],
  [
    "tac-trapped-piece",
    "Pourquoi",
    "Un fou qui prend en a7 ou h7 peut être enfermé par b6 ou g6. Une dame gourmande en b2 peut manquer de sorties. Un cavalier au bord peut aussi être piégé.",
  ],
  [
    "vis-attacked-squares",
    "Piège",
    "Une pièce derrière un obstacle ne défend pas encore la case. Son rayon X devient actif quand l’obstacle se déplace.",
  ],
  [
    "vis-draws",
    "Méthode",
    "Si tu es largement derrière, cherche une ressource de pat. Sacrifier tes dernières pièces peut supprimer tes coups légaux. Cherche aussi un échec perpétuel avec ta dame.",
  ],
  [
    "vis-notation",
    "Pourquoi",
    "La notation permet de lire une analyse, un livre ou un problème. Elle sert aussi à rejouer une partie.",
  ],
  [
    "vis-notation",
    "Contenu",
    "Les colonnes vont de a à h, les rangées de 1 à 8. Cf3 : le cavalier va en f3. exd5 : le pion e prend en d5. Fxf7+ : le fou prend en f7 avec échec. O-O : petit roque. O-O-O : grand roque. e8=D : promotion en dame. Le signe # indique le mat.",
  ],
  [
    "vis-rules",
    "Pourquoi",
    "Le roque, la prise en passant, la promotion et le pat changent certaines positions. Les connaître évite des erreurs décisives.",
  ],
];
const replacements = [
  [
    "Écris la leçon en une phrase (« Avant de jouer Fd3, je n'ai pas vu que mon cavalier en c3 n'était plus défendu »).",
    "Écris la leçon en une phrase. Exemple : « Avant Fd3, je n’ai pas vu mon cavalier c3 sans défenseur. »",
  ],
  [
    "Défense correcte : 1.e4 e5 2.Dh5 Cc6 3.Fc4 g6 4.Df3 Cf6 (le cavalier coupe la ligne de la dame vers f7).",
    "Défense : 1.e4 e5 2.Dh5 Cc6 3.Fc4 g6 4.Df3 Cf6. Le cavalier coupe la ligne de la dame vers f7.",
  ],
  [
    "Le piège du pion « gratuit » : les débutants prennent un pion avec leur dame en b2/b7 et se font enfermer la dame ou la tour en a1/a8.",
    "Une dame qui prend le pion b2 ou b7 peut être enfermée. Vérifie ses sorties et la sécurité des tours.",
  ],
  [
    "Si je n'attaque pas plus de fois qu'il ne défend, je ne gagne pas la pièce (sauf si ma première pièce vaut moins que la cible).",
    "Compare le nombre d’attaquants et de défenseurs. Compare aussi leur valeur : une pièce peu chère peut prendre une cible coûteuse.",
  ],
  [
    "Si une menace existe, compare quatre réponses : défendre la cible, prendre l'attaquant, s'interposer, déplacer la cible avec gain de temps (en créant soi-même une menace).",
    "Compare quatre réponses : défendre, prendre l’attaquant, s’interposer ou déplacer la cible. Cherche si ta réponse crée aussi une menace.",
  ],
  [
    "Échange quand tu es devant au matériel, quand tu manques de place, ou pour éliminer une pièce adverse très active ou un défenseur clé.",
    "Échange si tu es devant au matériel ou si tu manques de place. Tu peux aussi éliminer un défenseur clé.",
  ],
  [
    "Formule le plan en une phrase (« J'installe mon cavalier en d5 puis je double mes tours sur la colonne c »).",
    "Formule ton plan. Exemple : « Cavalier en d5, puis mes deux tours sur la colonne c. »",
  ],
  [
    "Si derrière la ligne il y a le roi adverse : n'importe quel coup de la pièce de devant donne échec.",
    "Si la ligne vise le roi, déplacer la pièce peut découvrir un échec. Vérifie que ton coup libère bien la ligne.",
  ],
  [
    "Deux pièces adverses côte à côte sur la même rangée, avec un pion qui peut avancer entre elles (fourchette de pion).",
    "Deux pièces adverses voisines peuvent subir une fourchette de pion. Cherche une poussée qui attaque les deux.",
  ],
  [
    "Vérifie que ta pièce n'est pas prise sur cette case (ou que la prise te coûte moins que ce que tu gagnes).",
    "Vérifie si ta pièce peut être prise. Si oui, compare sa valeur au gain attendu.",
  ],
];
for (const file of fs.readdirSync("curriculum/entries")) {
  const p = "curriculum/entries/" + file,
    e = JSON.parse(fs.readFileSync(p));
  for (const [id, title, text] of edits.filter((x) => x[0] === e.id)) {
    e.screens = e.screens.filter((s) => s.title !== title);
    e.screens.push({ title, text, audio: null });
    if (title === "Principe") e.principle = text;
  }
  for (const s of e.screens) {
    for (const [from, to] of replacements) s.text = s.text.replace(from, to);
    s.text = s.text
      .replace(/\s*;\s*/g, ". ")
      .replace(/(^|\. )([a-zàéèê])/g, (_, a, b) => a + b.toUpperCase());
  }
  if (e.id === "vis-rules") {
    e.screens = e.screens.filter(
      (s) =>
        !s.title.startsWith("Contenu") && s.title !== "Règles sur l’échiquier",
    );
    for (const text of [
      "La tour se déplace en ligne droite. Le fou suit les diagonales. La dame combine les deux. Le cavalier saute en L. Le roi avance d’une case.",
      "Le pion avance d’une case, ou de deux depuis sa case de départ. Il prend en diagonale. Il ne recule jamais.",
      "Pour roquer, le roi et la tour concernée ne doivent jamais avoir bougé. Les cases entre eux doivent être vides. Le roi ne doit être ni en échec, ni traverser ou atteindre une case attaquée.",
      "La prise en passant suit immédiatement une avance adverse de deux cases. Ton pion voisin capture comme si le pion adverse n’avait avancé que d’une case.",
      "Sur la dernière rangée, le pion devient dame, tour, fou ou cavalier. La promotion n’est pas limitée aux pièces capturées.",
      "Le roi ne se capture jamais. En échec, prends l’attaquant, interpose une pièce ou déplace le roi. Sans aucune réponse légale, c’est mat.",
      "Sans échec et sans coup légal : c’est pat. La partie est nulle. La répétition, la règle des cinquante coups, le matériel insuffisant ou un accord peuvent aussi donner la nulle.",
    ])
      e.screens.push({ title: "Règles sur l’échiquier", text, audio: null });
  }
  if (!e.pitfall.fen) {
    const screen = e.screens.find((s) => s.title === "Piège");
    if (screen) e.pitfall.text = screen.text;
  }
  fs.writeFileSync(p, JSON.stringify(e, null, 2) + "\n");
}
const index = JSON.parse(fs.readFileSync("curriculum/index.json"));
for (const x of index) {
  const e = JSON.parse(fs.readFileSync("curriculum/entries/" + x.id + ".json"));
  x.principle = e.principle;
  x.searchText = e.screens.map((s) => s.text).join(" ");
}
const order = [
  ...fs.readFileSync("CURRICULUM.md", "utf8").matchAll(/^### `([^`]+)`/gm),
].map((m) => m[1]);
index.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
const search = Object.fromEntries(index.map((x) => [x.id, x.searchText]));
for (const x of index) delete x.searchText;
fs.writeFileSync("curriculum/search.json", JSON.stringify(search));
fs.writeFileSync(
  "curriculum/index.json",
  JSON.stringify(index, null, 2) + "\n",
);
