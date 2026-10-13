export const routine = [
  { title: "Qu’est-ce qu’il menace ?", text: "Mon roi est-il attaqué ? Si oui, je dois le sauver. Sinon, je regarde ce que son dernier coup attaque, surtout ma dame et mes pièces sans protection." },
  { title: "Ai-je une occasion maintenant ?", text: "Dans cet ordre : puis-je attaquer son roi, prendre une pièce, ou menacer quelque chose ? Je cherche d’abord un gain concret, sans supposer qu’il va me laisser faire." },
  { title: "Si rien n’est urgent, quelle pièce améliorer ?", text: "Je fais participer une pièce encore à l’arrière, je contrôle le centre ou je mets mon roi à l’abri. Je choisis une idée utile, pas un coup au hasard." },
  { title: "Après mon coup, que peut-il me faire ?", text: "J’imagine mon coup déjà joué. Je regarde ses attaques contre mon roi et ses prises. Ma pièce peut-elle être prise ? Ai-je cessé d’en protéger une autre ? Si oui, je cherche une autre idée." },
];

export const essentials = [
  {
    id: "safety", title: "Garde tes pièces avant de chercher un coup brillant", lesson: "proc-blunder-check",
    why: "Une pièce de plus, c’est une pièce de plus pour attaquer et défendre. Beaucoup de parties se décident parce qu’une pièce est donnée en un coup.",
    rule: "Avant de lâcher ta pièce : qui peut la prendre là où elle arrive ?",
    nuance: "Une pièce attaquée n’est pas forcément perdue : tu peux parfois reprendre, ou gagner davantage ailleurs. Mais il faut le vérifier.",
    fen: "r6k/8/8/8/8/1B6/P7/6K1 w - - 0 1",
    steps: [
      { text: "Tu joues les blancs. Ton fou est en sécurité pour l’instant. La tour noire, tout en haut à gauche, attaque les cases de sa colonne. N’envoie pas ton fou sur son chemin.", marks: ["b3", "a8"], arrows: [["a8","a4","danger"]] },
      { move: "b3a4", text: "Le fou vient sur le bord gauche. Il entre dans le chemin de la tour noire. Ce déplacement crée un danger qui n’existait pas avant.", color: "danger" },
      { move: "a8a4", text: "La tour prend ton fou. Tu n’as aucune pièce capable de reprendre cette tour immédiatement. Le bon réflexe était de vérifier la case d’arrivée avant de déplacer le fou.", color: "danger" },
    ],
  },
  {
    id: "centre", title: "Joue vers le centre, sans donner de pièce", lesson: "ouv-principles",
    why: "Les quatre cases au milieu sont le centre. Les contrôler laisse plus de place à tes pièces et permet d’agir des deux côtés du plateau.",
    rule: "Au début, avance un pion du centre et prépare la sortie de tes pièces.",
    nuance: "Contrôler une case, c’est pouvoir l’attaquer ; tu n’es pas obligée de l’occuper. Si une pièce est en danger, traite ce danger d’abord.",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    steps: [
      { text: "Tu joues les blancs. Les quatre cases colorées sont le centre. Pour commencer, regarde le pion juste devant ton roi : son avance peut ouvrir le passage à ton fou et à ta dame.", marks: ["d4","e4","d5","e5"], arrows: [["e2","e4","good"]] },
      { move: "e2e4", text: "Le pion avance de deux cases au milieu. Il attaque maintenant les deux cases en diagonale devant lui. Ton fou peut sortir. C’est un début simple et utile, sans avoir à apprendre une longue suite par cœur.", marks: ["d5","f5"] },
    ],
  },
  {
    id: "develop", title: "Fais jouer tes cavaliers et tes fous", lesson: "ouv-principles",
    why: "Une pièce restée derrière tes pions aide peu ton attaque. Sortir tes pièces de leur case de départ s’appelle les développer.",
    rule: "Fais participer plusieurs pièces avant de déplacer trois fois la même.",
    nuance: "Ne déplace pas une pièce juste pour suivre cette règle si tu dois répondre à une menace. La dame sortie très tôt peut être attaquée et te faire perdre du temps.",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    steps: [
      { text: "Les deux joueurs ont avancé un pion au centre. Ton cavalier, en bas près du roi, ne participe pas encore. Il peut sortir vers le milieu en attaquant le pion noir.", marks: ["g1","e5"], arrows: [["g1","f3","good"]] },
      { move: "g1f3", text: "Le cavalier sort et attaque le pion noir au milieu. Il aide aussi à contrôler le centre. Tu fais deux choses utiles en un seul coup : sortir une pièce et poser un problème à l’adversaire.", arrows: [["f3","e5","good"]] },
    ],
  },
  {
    id: "king", title: "Mets ton roi à l’abri au début", lesson: "vis-rules",
    why: "Un roi resté au milieu peut être attaqué quand les pions s’échangent et ouvrent des lignes. Le roque, un déplacement du roi et d’une tour en un coup, met ton roi sur le côté et fait participer cette tour.",
    rule: "Prépare le roque : sors le cavalier et le fou entre ton roi et ta tour.",
    nuance: "Le roque déplace le roi et une tour en un coup. Il n’est autorisé que sous certaines conditions, notamment sans traverser une case attaquée. En fin de partie, ton roi peut au contraire devenir très actif.",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    steps: [
      { text: "Ton cavalier et ton fou sont sortis. Les cases entre ton roi et la tour de droite sont libres. Ici, ton roi n’est pas attaqué, et les cases qu’il traverse sont sûres : tu peux roquer.", marks: ["e1","f1","g1","h1"] },
      { move: "e1g1", text: "Le roi avance de deux cases vers la tour. La tour passe juste à côté de lui. Tes pions abritent ton roi, et ta tour se rapproche du milieu. C’est le petit roque.", marks: ["g1","f1"] },
    ],
  },
  {
    id: "fork", title: "Cherche une attaque qui fait deux choses à la fois", lesson: "tac-fork",
    why: "Quand une seule pièce attaque deux pièces adverses, c’est une fourchette. L’adversaire ne peut parfois pas sauver les deux en un seul coup.",
    rule: "Une attaque contre le roi mérite d’être regardée en premier : il doit répondre.",
    nuance: "Une double attaque ne gagne pas toujours. Vérifie si l’adversaire peut prendre ta pièce, ou répondre par une menace plus forte.",
    fen: "3r3k/8/8/4N3/8/8/8/6K1 w - - 0 1",
    steps: [
      { text: "Regarde ton cavalier au milieu. Il peut sauter vers le haut à droite pour attaquer le roi et la tour en même temps. La flèche montre le saut à essayer.", arrows: [["e5","f7","good"]] },
      { move: "e5f7", text: "Ton cavalier attaque le roi et la tour. Le roi est attaqué : les noirs doivent s’en occuper tout de suite. Ici, ils ne peuvent pas prendre ton cavalier.", arrows: [["f7","h8","good"],["f7","d8","good"]] },
      { move: "h8h7", text: "Dans cet exemple, le roi descend pour se sauver. La tour est toujours attaquée par ton cavalier. C’est maintenant à toi de jouer.", arrows: [["f7","d8","good"]] },
      { move: "f7d8", text: "Tu prends la tour avec ton cavalier. L’idée à retenir est la double attaque contre le roi et une autre pièce, pas le nom des cases de cet exemple." },
    ],
  },
  {
    id: "count", title: "Compte avant de prendre", lesson: "proc-exchange-count",
    why: "Les repères : pion 1, cavalier 3, fou 3, tour 5, dame 9. Ils servent à comparer les pièces perdues de chaque côté lors d’un échange.",
    rule: "Si je prends et qu’il reprend, qu’est-ce que chacun perd ?",
    nuance: "Ces valeurs sont des repères. Une attaque qui termine la partie passe avant les points. Mais ne donne pas ta dame pour un cavalier sans raison vérifiée.",
    fen: "6k1/8/4p3/3n4/2Q5/8/8/6K1 w - - 0 1",
    steps: [
      { text: "Ta dame peut prendre le cavalier noir. Mais regarde le pion juste derrière lui : il protège le cavalier, car il pourra prendre ta dame en diagonale si elle arrive là.", marks: ["c4","d5","e6"], arrows: [["e6","d5","danger"]] },
      { move: "c4d5", text: "Ta dame prend le cavalier : tu prends une pièce qui vaut environ trois points. Mais le pion noir peut maintenant prendre ta dame.", color: "danger" },
      { move: "e6d5", text: "Le pion prend ta dame. Tu as gagné trois points, mais perdu neuf points. Cet échange te coûte donc six points. Il fallait compter la reprise avant de prendre le cavalier.", color: "danger" },
    ],
  },
  {
    id: "finish", title: "À la fin, fais aussi travailler ton roi", lesson: "fin-active-king",
    why: "Quand les dames ont disparu et qu’il reste peu de pièces, ton roi peut aider à prendre des pions et accompagner les tiens jusqu’au bout du plateau.",
    rule: "Rapproche ton roi de l’action, en restant hors des cases attaquées.",
    nuance: "Le roi n’est donc pas une pièce à bouger seulement en dernier recours. Au début, protège-le ; en fin de partie, utilise-le quand c’est sûr. Il ne peut jamais se mettre en danger.",
    fen: "8/1k6/8/8/8/3P4/5K2/8 w - - 0 1",
    steps: [
      { text: "Il reste deux rois et ton pion. Le roi noir est loin. Ton roi peut se rapprocher du pion pour le protéger, au lieu d’attendre dans son coin.", marks: ["d3","f2"], arrows: [["f2","e3","good"]] },
      { move: "f2e3", text: "Ton roi rejoint le pion et le protège. Ici, aucune pièce adverse n’attaque sa nouvelle case. Ton roi participe au jeu : l’abriter au début ne veut pas dire le laisser immobile pour toujours." },
    ],
  },
];

export const essentialsWords = Object.fromEntries(essentials.flatMap(e => e.steps.map((s,i) => [`essential-${e.id}-${i}`, s.text])));
