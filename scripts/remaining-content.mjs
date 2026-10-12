import { Chess } from "../src/chess/chess.js";
import { moveUci, pieceName } from "../src/chess/notation.js";
export const positions = {
  "fin-active-king": {
    fen: "5r2/8/4Q1pk/p5b1/2P1B3/1P4P1/P4P1q/4RK2 b - - 13 35",
    solution: ["h2f2"],
    kind: "move",
    check: "list",
  },
  "fin-convert": {
    fen: "4r3/7p/p1pB2p1/P1P5/R5P1/3bk2P/4p1K1/8 w - - 2 47",
    solution: ["d6f4"],
    kind: "move",
    check: "list",
  },
  "fin-lucena": {
    fen: "1K6/1P2k3/8/8/8/8/2r5/3R4 w - - 0 1",
    solution: [
      "d1d4",
      "c2c1",
      "b8a7",
      "c1a1",
      "a7b6",
      "a1b1",
      "b6c6",
      "b1c1",
      "c6b5",
      "c1b1",
      "d4b4",
    ],
    kind: "move",
    check: "list",
  },
  "fin-opposite-bishops": {
    fen: "8/8/1pp3p1/p1k2p2/P1Pb1P1B/1P6/6K1/8 w - - 10 47",
    solution: ["h4e7"],
    kind: "move",
    check: "list",
  },
  "fin-passed-pawn": {
    fen: "4nk2/1pr1qp2/pR4p1/P1pPQ3/4PP2/8/6Bp/4K3 w - - 0 26",
    solution: ["e5h8"],
    kind: "move",
    check: "list",
  },
  "fin-philidor": {
    fen: "4k3/7R/1r6/3KP3/8/8/8/8 b - - 0 1",
    solution: ["b6a6", "e5e6", "a6a1"],
    kind: "move",
    check: "list",
  },
  "fin-queen-vs-pawn": {
    fen: "1R6/5p1p/1p2pkp1/1P6/3P1P2/3RKP2/P7/1q6 b - - 0 43",
    solution: ["b1e1"],
    kind: "move",
    check: "list",
  },
  "fin-rook-behind": {
    fen: "8/8/6pp/4Rp1k/7P/3rp1PK/8/8 w - - 0 57",
    solution: ["g3g4"],
    kind: "move",
    check: "list",
  },
  "fin-square": {
    fen: "7k/8/8/p7/8/8/8/5K2 w - - 0 1",
    solution: ["f1e2", "a5a4", "e2d2", "a4a3", "d2c2", "a3a2", "c2b2"],
    kind: "move",
    check: "list",
  },
  "mat-anastasia": {
    fen: "8/4N1pk/8/8/8/R7/8/6K1 w - - 0 1",
    solution: ["a3h3"],
    kind: "move",
    check: "list",
  },
  "mat-arabian": {
    fen: "k3r3/2R5/p1Np2pp/3Pbp2/8/7P/KPr5/3R4 w - - 0 32",
    solution: ["c7a7"],
    kind: "move",
    check: "list",
  },
  "mat-basic-rook": {
    fen: "7k/8/6K1/8/8/8/8/R7 w - - 0 1",
    solution: ["a1a8"],
    kind: "move",
    check: "list",
  },
  "mat-boden": {
    fen: "2kr4/3p4/8/8/5B2/8/4B3/6K1 w - - 0 1",
    solution: ["e2a6"],
    kind: "move",
    check: "list",
  },
  "mat-greek-gift": {
    fen: "2r3k1/p4pp1/2r4p/3p4/P2P1P2/1PPQR1qb/6P1/1NR3K1 b - - 0 33",
    solution: ["g3g2"],
    kind: "move",
    check: "list",
  },
  "mat-patterns-misc": {
    fen: "2R5/p4kpp/P3pp2/1pBb2rP/8/7K/8/8 w - - 2 45",
    solution: ["c8f8"],
    kind: "move",
    check: "list",
  },
  "mat-queen-support": {
    fen: "2kr1b2/p1pbppp1/p4q2/8/8/8/PPP3QP/2KR4 w - - 0 19",
    solution: ["g2a8"],
    kind: "move",
    check: "list",
  },
  "mat-smothered": {
    fen: "6rk/6pp/3N4/3B4/8/6P1/1p3P1P/2q2RK1 w - - 0 36",
    solution: ["d6f7"],
    kind: "move",
    check: "list",
  },
  "meta-game-review": {
    fen: "4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1",
    solution: ["e4d6", "e8d7", "d6b5"],
    kind: "move",
    check: "list",
  },
  "meta-play-slow": {
    fen: "4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1",
    solution: ["e4d6", "e8d7", "d6b5"],
    kind: "move",
    check: "list",
  },
  "meta-time-management": {
    fen: "4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1",
    solution: ["e4d6", "e8d7", "d6b5"],
    kind: "move",
    check: "list",
  },
  "meta-woodpecker": {
    fen: "4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1",
    solution: ["e4d6", "e8d7", "d6b5"],
    kind: "move",
    check: "list",
  },
  "ouv-black-d5": {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    solution: [
      "d7d5",
      "c2c4",
      "e7e6",
      "b1c3",
      "g8f6",
      "c1g5",
      "f8e7",
      "e2e3",
      "e8g8",
      "g1f3",
      "h7h6",
      "g5h4",
      "b7b6",
    ],
    kind: "move",
    check: "list",
  },
  "ouv-black-e5": {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    solution: [
      "e7e5",
      "g1f3",
      "b8c6",
      "f1c4",
      "f8c5",
      "d2d3",
      "g8f6",
      "e1g1",
      "d7d6",
      "b1c3",
      "e8g8",
    ],
    kind: "move",
    check: "list",
  },
  "ouv-early-traps": {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    solution: ["e2e4", "e7e5", "d1h5", "b8c6", "f1c4", "g8f6", "h5f7"],
    kind: "move",
    check: "list",
  },
  "ouv-gambits": {
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    solution: ["f2f4"],
    kind: "move",
    check: "list",
  },
  "ouv-white-italian": {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    solution: [
      "e2e4",
      "e7e5",
      "g1f3",
      "b8c6",
      "f1c4",
      "f8c5",
      "c2c3",
      "g8f6",
      "d2d3",
      "d7d6",
      "e1g1",
      "e8g8",
      "f1e1",
      "a7a6",
      "c4b3",
      "c5a7",
      "h2h3",
    ],
    kind: "move",
    check: "list",
  },
  "proc-candidates-calc": {
    fen: "6k1/5p2/6p1/1p5p/2b5/2Qr1PqP/6P1/4R2K w - - 6 47",
    solution: ["e1e8", "g8h7", "e8h8"],
    kind: "move",
    check: "list",
  },
  "proc-forcing-moves": {
    fen: "3r2k1/pp3pp1/2n1q2p/3p4/4n1Q1/PP1Nb3/1BP2PPP/4R1K1 w - - 0 24",
    solution: ["g4g7"],
    kind: "move",
    check: "list",
  },
  "proc-free-material": {
    fen: "6k1/p1p3p1/1pn4p/3rp3/8/4P1PP/PP3PB1/6K1 w - - 0 24",
    solution: ["g2d5", "g8f8", "d5c6"],
    kind: "move",
    check: "list",
  },
  "str-bishop-pair-space": {
    fen: "r1bq1rk1/ppp2ppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1",
    solution: ["d3d4"],
    kind: "move",
    check: "list",
  },
  "str-exchanges": {
    fen: "3r2k1/pp3ppp/8/8/8/8/PP3PPP/3RQ1K1 w - - 0 1",
    solution: ["d1d8"],
    kind: "move",
    check: "list",
  },
  "str-good-bad-bishop": {
    fen: "6k1/8/3p4/2pPp3/2P1P3/8/8/2B3K1 w - - 0 1",
    solution: ["c1"],
    kind: "square",
    check: "list",
  },
  "str-initiative": {
    fen: "r1bq1rk1/ppp2ppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1",
    solution: ["d3d4"],
    kind: "move",
    check: "list",
  },
  "str-king-safety-middlegame": {
    fen: "3r1rk1/p3Bppp/2b1p3/2R5/3Pq3/Q7/PP3PP1/R5K1 b - - 4 23",
    solution: ["e4g2"],
    kind: "move",
    check: "list",
  },
  "str-open-files": {
    fen: "8/8/1p3k1p/p1p2pP1/P1P2KP1/3r4/1PR5/8 b - - 0 39",
    solution: ["h6g5"],
    kind: "move",
    check: "list",
  },
  "str-outposts": {
    fen: "6k1/pp3ppp/3p4/8/2P1P3/2N5/PP3PPP/6K1 w - - 0 1",
    solution: ["c3d5"],
    kind: "move",
    check: "list",
  },
  "str-pawn-structure": {
    fen: "6k1/pp3ppp/8/8/3P4/8/PP3PPP/6K1 w - - 0 1",
    solution: ["d4"],
    kind: "square",
    check: "list",
  },
  "str-plan-making": {
    fen: "6k1/pp3ppp/3p4/8/2P1P3/2N5/PP3PPP/6K1 w - - 0 1",
    solution: ["c3d5"],
    kind: "move",
    check: "list",
  },
  "str-prophylaxis": {
    fen: "r1b2rk1/1pp3p1/p2p3p/2b1pp2/P1N1Pq2/2PP1N1P/1P3PPK/R2Q1R2 w - - 4 16",
    solution: ["g2g3", "f4f3", "d1f3"],
    kind: "move",
    check: "list",
  },
  "str-weak-squares": {
    fen: "6k1/pp3ppp/3p4/8/2P1P3/2N5/PP3PPP/6K1 w - - 0 1",
    solution: ["d5"],
    kind: "square",
    check: "list",
  },
  "tac-attraction": {
    fen: "R4rk1/5ppp/2pPp3/8/2P5/2q2P2/4KP1P/R7 w - - 0 29",
    solution: ["a8f8", "g8f8", "a1a8"],
    kind: "move",
    check: "list",
  },
  "tac-deflection": {
    fen: "6k1/1p3p2/p4P1p/8/4Q3/1P2p1q1/P5P1/6K1 w - - 2 46",
    solution: ["e4e8", "g8h7", "e8f7"],
    kind: "move",
    check: "list",
  },
  "tac-double-check": {
    fen: "2b4r/p2k2pp/1p3p2/2bN4/3nn3/3N4/P5PP/1R3BKR b - - 4 21",
    solution: ["d4e2"],
    kind: "move",
    check: "list",
  },
  "tac-interference-clearance": {
    fen: "r1bq1rk1/p1n2pp1/2p1pb1p/1p6/1PpPN3/P3P3/2Q2PPP/1BR1K1NR w K - 2 15",
    solution: ["e4f6", "d8f6", "c2h7"],
    kind: "move",
    check: "list",
  },
  "tac-intermezzo": {
    fen: "r4rk1/1ppRppbp/p4np1/4n3/2B5/2N1BQ1P/PPP2PP1/5RK1 b - - 0 13",
    solution: ["e5f3", "g2f3", "f6d7"],
    kind: "move",
    check: "list",
  },
  "tac-overload": {
    fen: "8/5k2/8/r3pKR1/8/7P/6P1/8 b - - 0 48",
    solution: ["e5e4", "f5e4", "a5g5"],
    kind: "move",
    check: "list",
  },
  "tac-promotion": {
    fen: "5k2/1p1P2pp/3bP3/pP6/6P1/2p2K2/7P/3r4 w - - 3 45",
    solution: ["d7d8q"],
    kind: "move",
    check: "list",
  },
  "tac-quiet-move": {
    fen: "1k4r1/1p6/p1pq4/P4p2/1P2p2p/2BrP2P/1Q3P1K/2R5 w - - 5 40",
    solution: ["c3e5", "b8a8", "e5d6"],
    kind: "move",
    check: "list",
  },
  "tac-skewer": {
    fen: "8/8/8/3k3q/8/8/8/R5K1 w - - 0 1",
    solution: ["a1a5", "d5c4", "a5h5"],
    kind: "move",
    check: "list",
  },
  "tac-trapped-piece": {
    fen: "8/8/4p1k1/4Pb2/5K2/3p2P1/8/4B3 w - - 3 73",
    solution: ["g3g4", "f5g4", "f4g4"],
    kind: "move",
    check: "list",
  },
  "tac-xray": {
    fen: "4r1k1/p4ppp/8/1Q1p1q2/4rP2/1P4P1/7P/2R1R1K1 w - - 0 26",
    solution: ["b5e8", "e4e8", "e1e8"],
    kind: "move",
    check: "list",
  },
  "vis-draws": {
    fen: "4Q3/1p4R1/3k1r2/3P2p1/1P4P1/6K1/5r2/8 b - - 3 58",
    solution: ["f6f3"],
    kind: "move",
    check: "list",
  },
};
export const content = {};
const add = (
  id,
  title,
  definition,
  why,
  method,
  pitfall,
  comments = [],
  extra = {},
) => {
  content[id] = {
    id,
    title,
    definition,
    why,
    method,
    pitfall,
    comments,
    ...extra,
  };
};
add(
  "mat-basic-rook",
  "Faire mat avec une tour et ton roi",
  "Ta tour en a1 empêche le roi noir de traverser une ligne entière. Ton roi en g6 ferme ses sorties vers la sixième rangée. Ensemble, ils peuvent coincer le roi noir en h8.",
  "La tour arrive en a8 : elle attaque le roi noir sur toute la dernière rangée. Ton roi surveille g7 et h7. Le roi noir ne peut plus fuir : la partie est gagnée.",
  "Commence par réduire la place du roi adverse avec ta tour. Approche ensuite ton roi. Quand le roi adverse atteint un bord, ta tour peut donner le dernier échec, comme ici de a1 vers a8.",
  "Garde ta tour loin du roi adverse. Une tour non protégée placée juste à côté de lui peut être prise. Ici, a8 reste loin du roi en h8.",
  [
    "La tour en a1 monte en a8. Le roi noir est attaqué et toutes ses sorties sont fermées : échec et mat.",
  ],
  {
    prompt:
      "Ta tour en a1 et ton roi en g6 peuvent enfermer le roi noir en h8. Termine la partie en un coup.",
    retenir:
      "La tour ferme une ligne ; ton roi ferme les sorties. Garde la tour loin du roi adverse.",
  },
);
positions["vis-draws"] = {
  fen: "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1",
  kind: "square",
  solution: ["h8"],
  check: "rule",
};
add(
  "vis-draws",
  "Les parties sans gagnant",
  "Une partie nulle, c’est une partie sans gagnant. Ici, le roi noir en h8 n’est pas attaqué, mais il ne peut aller nulle part. Ce blocage s’appelle le pat.",
  "La dame blanche en f7 surveille g8 et h7. Le roi blanc en g6 surveille g7. Les noirs ne peuvent rien jouer, mais leur roi n’est pas attaqué. Les blancs ne gagnent donc pas.",
  "Avant un coup de dame près du roi adverse, regarde ses sorties. S’il ne pourra plus jouer, ton coup doit attaquer son roi. Sinon, tu risques de transformer une victoire en partie nulle.",
  "On peut aussi réclamer une partie nulle si une même position revient trois fois avec le même camp à jouer. Rejouer trois fois le même coup ne suffit pas si le reste de la position change.",
  [],
  {
    prompt:
      "Touche le roi qui ne peut plus jouer, alors qu’aucune pièce ne l’attaque.",
    retenir:
      "Un roi sans coup possible n’est pas forcément battu. S’il n’est pas attaqué, la partie est nulle.",
  },
);
add(
  "proc-free-material",
  "Prendre une pièce sans rien perdre",
  "Ton fou en g2 voit la tour noire en d5. Aucune pièce noire ne protège cette tour. La prendre rapporte cinq points, à condition que ton roi reste en sécurité.",
  "Après avoir pris la tour en d5, ton fou peut encore viser le cavalier en c6. Regarde toute la suite : une pièce gratuite peut en cacher une autre.",
  "Suis la diagonale de ton fou : g2, f3, e4, d5. Après la prise, demande-toi quelle pièce noire pourrait reprendre en d5. Puis vérifie les attaques contre ton roi en g1.",
  "Ne confonds pas une pièce sans protection avec une prise sans danger. Un adversaire peut parfois abandonner sa tour pour attaquer ton roi. Ici, vérifie ses réponses avant de prendre.",
  [
    "Ton fou en g2 prend la tour noire en d5 : cinq points gagnés.",
    "Le roi noir va en f8. Il ne peut pas reprendre ton fou.",
    "Ton fou en d5 prend aussi le cavalier en c6.",
  ],
  {
    prompt:
      "Ton fou en g2 peut gagner une tour. Trouve la prise, puis continue après la réponse noire.",
    retenir:
      "Avant de prendre une pièce gratuite, vérifie la reprise adverse et la sécurité de ton roi.",
  },
);
// Le piège est montré comme une réponse à une erreur, pas comme un répertoire recommandé.
positions["ouv-early-traps"] = {
  fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
  solution: ["h5f7"],
  kind: "move",
  check: "engine",
};
add(
  "ouv-early-traps",
  "Reconnaître le piège sur f7",
  "Au début de la partie, le pion noir en f7 n’est protégé que par son roi. Ici, ta dame en h5 et ton fou en c4 le visent ensemble.",
  "Ta dame prend en f7 avec échec. Le fou en c4 la protège : le roi noir ne peut pas la prendre. Ses autres sorties sont fermées. C’est échec et mat.",
  "Regarde toujours les attaques de dame et de fou vers f7 quand tu joues les noirs. Avec les blancs, le même danger existe sur f2. Réponds à cette attaque avant de sortir une autre pièce.",
  "Ce piège ne gagne pas contre toutes les réponses. Si les noirs protègent f7 ou chassent la dame à temps, elle doit reculer. Ne construis pas toute ta façon de jouer sur une erreur adverse.",
  [
    "La dame en h5 prend le pion en f7. Le fou en c4 protège la dame : échec et mat.",
  ],
  {
    prompt:
      "Ta dame en h5 et ton fou en c4 attaquent f7 ensemble. Termine la partie.",
    retenir:
      "Dame et fou qui visent f7 ou f2 ensemble : vérifie le danger avant tout autre coup.",
  },
);
add(
  "proc-forcing-moves",
  "Les coups qui obligent à répondre",
  "Un coup forçant oblige l’adversaire à répondre à un danger immédiat. L’échec, qui attaque le roi, est le plus contraignant. Ici, ta dame en g4 peut attaquer directement le roi noir en g8.",
  "La dame arrive en g7, protégée par ton fou en b2. Le roi noir en g8 ne peut pas la prendre. Les autres pièces noires ne peuvent pas non plus supprimer cet échec.",
  "Cherche d’abord les coups qui attaquent le roi. Puis regarde les prises, enfin les attaques de pièces. Essaie cette recherche pour les deux camps : une belle prise ne sert à rien si ton roi perd la partie.",
  "Une prise n’oblige pas toujours l’adversaire à reprendre. Il peut avoir un échec plus fort. Après chaque idée, regarde sa meilleure réponse avant de décider.",
  [
    "La dame en g4 prend le pion en g7 : échec. Le roi noir ne peut plus échapper à l’attaque.",
  ],
  {
    prompt:
      "Ta dame en g4 peut terminer la partie. Cherche d’abord les coups qui attaquent le roi en g8.",
    retenir:
      "Avant de chercher un coup tranquille, regarde les échecs, les prises et les attaques immédiates.",
  },
);
add(
  "tac-skewer",
  "L’enfilade : une cible en cache une autre",
  "Une enfilade, c’est une attaque sur deux pièces alignées : celle de devant doit partir, puis tu prends celle de derrière. Ici, le roi noir en d5 cache sa dame en h5 à ta tour.",
  "La tour arrive en a5 et attaque le roi noir. Le roi doit quitter la rangée. La tour peut alors prendre la dame en h5 : neuf points gagnés.",
  "Regarde la rangée 5 : a5, d5 et h5 sont alignées. Cherche un échec qui place ta tour au bout de cette ligne. Après la réponse du roi, prends la dame.",
  "Vérifie que la pièce de devant ne peut pas prendre ton attaquant. Ici, le roi en d5 est trop loin de la tour en a5 pour la prendre.",
  [
    "La tour va en a5 : le roi noir est attaqué.",
    "Le roi noir quitte la rangée en allant en c4.",
    "La tour prend la dame en h5.",
  ],
  {
    introduces: ["enfilade"],
    prompt:
      "Le roi en d5 et la dame en h5 sont alignés. Donne échec avec ta tour, puis prends la dame.",
    retenir:
      "Attaque la pièce importante devant. Quand elle part, prends celle qui se cachait derrière.",
  },
);
add(
  "tac-double-check",
  "Deux pièces attaquent le roi ensemble",
  "Un échec double, c’est quand deux pièces attaquent le roi en même temps. Ici, ton cavalier noir en d4 cache la diagonale du fou noir en c5 vers le roi blanc en g1.",
  "Le cavalier arrive en e2 et attaque g1. En quittant d4, il libère aussi le fou en c5. Le roi blanc reçoit deux attaques en même temps.",
  "Cherche une pièce qui masque ton fou, ta tour ou ta dame. Si elle peut partir en attaquant elle-même le roi, tu peux créer deux attaques en un seul coup.",
  "Pour répondre à deux échecs, il faut déplacer le roi. Prendre un seul attaquant ou bloquer une seule ligne ne supprime pas l’autre attaque.",
  [
    "Le cavalier noir va en e2 : il attaque le roi en g1, et le fou en c5 l’attaque aussi.",
  ],
  {
    introduces: ["échec double"],
    prompt:
      "Tu joues les noirs. Ton cavalier en d4 peut laisser passer ton fou en c5 tout en attaquant le roi blanc.",
    retenir: "Deux pièces attaquent le roi ensemble : le roi doit bouger.",
  },
);
add(
  "tac-overload",
  "Une pièce qui protège trop de choses",
  "Une surcharge, c’est quand une pièce doit protéger deux choses et ne peut pas tout garder. Ici, le roi blanc en f5 protège sa tour en g5 et bloque ton pion en e5.",
  "Le pion noir avance en e4. Si le roi blanc le prend, il quitte la protection de la tour en g5. Ta tour en a5 peut alors la prendre.",
  "Repère ce que protège chaque pièce adverse. Ici, imagine le roi blanc sur e4 : g5 n’est plus une case voisine de son roi. La tour blanche perd sa protection.",
  "L’adversaire n’est jamais obligé de prendre ton pion. Vérifie aussi ses autres réponses. La démonstration montre ce qui arrive s’il choisit de le prendre.",
  [
    "Le pion noir avance en e4 : il attire l’attention du roi blanc.",
    "Le roi blanc prend le pion en e4 et ne protège plus g5.",
    "La tour noire en a5 prend la tour blanche en g5.",
  ],
  {
    introduces: ["surcharge"],
    prompt:
      "Le roi blanc en f5 protège g5. Pousse ton pion pour lui donner un deuxième problème.",
    retenir:
      "Une pièce qui protège deux cibles peut en abandonner une quand tu attaques l’autre.",
  },
);
add(
  "tac-deflection",
  "Chasser une pièce de son travail",
  "Une déviation, c’est obliger une pièce adverse à quitter ce qu’elle protège. Ici, le roi noir en g8 protège le pion en f7. Ta dame en e4 peut le chasser avec échec.",
  "La dame va en e8. Après le déplacement du roi en h7, elle prend le pion en f7 avec échec. Le roi ne peut plus protéger f7 depuis h7.",
  "Cherche qui protège ta cible. Puis regarde si tu peux attaquer ce protecteur avec échec. Tu gagnes du temps, car l’adversaire doit d’abord sauver son roi.",
  "Chasser une pièce ne suffit pas : il faut encore pouvoir prendre la cible. Ici, la dame en e8 atteint f7 en diagonale. Vérifie toujours la distance et les obstacles.",
  [
    "La dame va en e8 : elle attaque le roi noir sur la dernière rangée.",
    "Le roi noir va en h7 et ne protège plus f7.",
    "La dame prend le pion en f7 avec échec.",
  ],
  {
    introduces: ["déviation"],
    prompt:
      "Le roi noir protège f7. Chasse-le avec ta dame en donnant échec, puis prends ce pion.",
    retenir:
      "Repère qui protège la cible. Oblige cette pièce à partir, puis prends ce qu’elle gardait.",
  },
);
add(
  "tac-attraction",
  "Attirer le roi sur une mauvaise case",
  "Une attraction, c’est amener une pièce adverse sur une case où tu peux l’attaquer plus fort. Ici, tu peux attirer le roi noir de g8 vers f8 en prenant sa tour.",
  "Après la prise en f8, le roi noir reprend ta tour. Ta deuxième tour monte de a1 à a8 : le roi est attaqué sur sa nouvelle case.",
  "Regarde tes deux tours en a8 et a1. La première peut enlever la tour noire en f8. La deuxième utilise ensuite la rangée libérée pour terminer l’attaque.",
  "Avant de donner une pièce, vérifie toutes les réponses. Si le roi peut refuser ton cadeau sans rien perdre, l’idée ne suffit pas. Ici, regarde pourquoi la prise en f8 impose une réponse.",
  [
    "La tour blanche en a8 prend la tour en f8 et attaque le roi.",
    "Le roi noir reprend en f8 : il arrive sur la case visée.",
    "La tour en a1 monte en a8 : échec et mat.",
  ],
  {
    introduces: ["attraction"],
    prompt:
      "Tes deux tours peuvent agir l’une après l’autre. Prends d’abord la tour noire avec échec.",
    retenir:
      "Un cadeau peut attirer une pièce sur une mauvaise case. Calcule la suite avant de l’offrir.",
  },
);
add(
  "tac-trapped-piece",
  "Une pièce sans case sûre",
  "Une pièce piégée ne peut plus fuir sans se faire prendre. Ici, le fou noir en f5 manque de place. Ton roi en f4, ton pion en e5 et ton fou en e1 limitent ses sorties.",
  "Ton pion avance en g4 et attaque le fou en f5. Si le fou prend ce pion, ton roi le reprend en g4. Tu échanges un pion contre un fou.",
  "Regarde chaque diagonale du fou noir avant de pousser g4. Une attaque gagne une pièce seulement si cette pièce ne peut ni fuir, ni prendre ton attaquant sans perte.",
  "Ne pousse pas un pion uniquement pour chasser un fou. Ton pion ne peut pas reculer. Ici, le gain du fou justifie de modifier les cases surveillées par ton pion.",
  [
    "Le pion blanc avance en g4 et attaque le fou en f5.",
    "Le fou prend le pion en g4.",
    "Le roi blanc reprend le fou en g4 : trois points gagnés contre un.",
  ],
  {
    introduces: ["pièce piégée"],
    prompt:
      "Le fou noir en f5 a très peu de sorties. Attaque-le avec ton pion, puis reprends s’il capture.",
    retenir:
      "Avant de chasser une pièce, regarde toutes ses sorties et toutes ses prises.",
  },
);
add(
  "tac-promotion",
  "Transformer ton pion au bon moment",
  "La promotion transforme un pion arrivé au bout du plateau en dame, tour, fou ou cavalier. Ici, ton pion en d7 est à une seule case de devenir une dame.",
  "Le pion arrive en d8 et devient une dame. Elle attaque aussitôt le roi noir en f8. Les noirs doivent répondre à cette attaque avant de s’occuper d’autre chose.",
  "Compare avancer le pion et jouer un autre coup. Ici, d8 est libre et aucune pièce noire ne peut prendre directement la nouvelle dame. Choisis la dame dans le bouton de transformation.",
  "Choisir une dame est presque toujours utile, mais pas obligatoire. Une autre pièce peut parfois éviter une partie nulle ou créer une attaque spéciale. Regarde toujours la position après la transformation.",
  [
    "Le pion en d7 avance en d8 et devient une dame : elle attaque le roi noir en f8.",
  ],
  {
    prompt:
      "Ton pion en d7 est tout près du bout. Fais-le devenir une dame avec échec.",
    retenir:
      "Un pion arrivé au bout peut devenir une dame. Vérifie ce que cette nouvelle pièce attaque.",
  },
);
add(
  "mat-queen-support",
  "La dame aidée par une autre pièce",
  "Une dame proche du roi adverse surveille presque toutes ses sorties. Mais elle a besoin d’une protection : sinon, le roi peut la prendre. Ici, ta dame en g2 peut rejoindre a8, devant le roi noir en c8.",
  "La dame arrive en a8. Le roi noir en c8 est attaqué le long de la dernière rangée. Ses propres pièces limitent ses sorties : regarde chaque case autour de lui.",
  "Pour chaque coup de dame près du roi, vérifie deux choses : qui protège la dame et où le roi pourrait fuir. Un échec spectaculaire n’est pas forcément la fin de la partie.",
  "Ne pose jamais ta dame juste à côté du roi adverse sans regarder s’il peut la prendre. Une pièce amie doit surveiller sa case, ou le roi doit en être trop loin.",
  ["La dame en g2 va en a8 : elle attaque le roi noir et ferme ses sorties."],
  {
    prompt:
      "Ta dame en g2 voit une diagonale jusqu’à a8. Trouve le coup qui termine la partie.",
    retenir:
      "Avant un coup de dame près du roi adverse, vérifie sa protection et toutes les sorties du roi.",
  },
);
add(
  "mat-smothered",
  "Le roi bloqué par ses propres pièces",
  "Le mat à l’étouffée arrive quand un cavalier attaque un roi enfermé par ses propres pièces. Ici, le roi noir en h8 est coincé par sa tour en g8 et ses pions en g7 et h7.",
  "Le cavalier blanc arrive en f7. Il attaque h8 en sautant au-dessus des autres pièces. Le roi noir n’a aucune sortie et personne ne peut prendre le cavalier.",
  "Regarde d’abord les voisins du roi noir : g8, g7 et h7. Ils sont occupés par son propre camp. Un cavalier peut profiter de cette prison, car il n’a pas besoin d’une ligne libre.",
  "Contre un cavalier, on ne peut pas bloquer l’attaque avec une pièce entre lui et le roi. Mais on peut parfois prendre le cavalier. Vérifie donc les prises adverses avant d’annoncer la victoire.",
  [
    "Le cavalier en d6 saute en f7 : il attaque le roi enfermé en h8. Échec et mat.",
  ],
  {
    introduces: ["mat à l’étouffée"],
    prompt:
      "Le roi noir en h8 est enfermé par ses pièces. Ton cavalier en d6 peut terminer la partie.",
    retenir:
      "Un roi enfermé par son propre camp peut perdre contre un seul échec de cavalier.",
  },
);
add(
  "mat-arabian",
  "La tour et le cavalier dans le coin",
  "Le mat arabe associe une tour et un cavalier près du coin. Ici, ton cavalier en c6 protège a7 et surveille b8. Ta tour en c7 peut utiliser ce soutien.",
  "La tour arrive en a7, juste à côté du roi noir en a8. Le cavalier en c6 protège la tour. Le roi ne peut pas la prendre et ne peut pas fuir par b8.",
  "Repère les deux tâches du cavalier : protéger la tour en a7 et fermer b8. La tour attaque le roi et surveille aussi b7. Chaque pièce a un travail différent.",
  "La tour ne fait pas tout toute seule. Sans le cavalier en c6, le roi pourrait parfois prendre la tour ou s’échapper. Vérifie la position exacte des deux pièces.",
  [
    "La tour en c7 va en a7. Le cavalier en c6 la protège et ferme b8 : échec et mat.",
  ],
  {
    introduces: ["mat arabe"],
    prompt:
      "Ton cavalier en c6 protège a7. Utilise cette case avec ta tour pour enfermer le roi en a8.",
    retenir:
      "Le cavalier protège la tour et ferme une sortie. La tour donne l’échec près du coin.",
  },
);
add(
  "mat-anastasia",
  "Le cavalier qui ferme les sorties du roi",
  "Le mat d’Anastasia utilise un cavalier pour fermer deux sorties d’un roi près du bord. Ici, ton cavalier en e7 surveille g6 et g8. Le pion noir en g7 bloque la troisième sortie.",
  "Ta tour arrive en h3. Elle attaque le roi noir en h7 sur toute la colonne h. Les cases voisines sur la colonne g sont occupées ou surveillées : le roi ne peut plus fuir.",
  "Suis la colonne h avec ta tour. Puis regarde g6, g7 et g8 une par une. Le cavalier surveille les deux cases libres ; le pion noir occupe celle du milieu.",
  "Si le pion en g7 avait quitté sa case, le roi aurait peut-être une sortie. Ce dessin fonctionne grâce à toutes les pièces présentes, y compris le pion adverse.",
  [
    "La tour en a3 va en h3 : le roi noir est attaqué sur la colonne h, sans aucune sortie.",
  ],
  {
    introduces: ["mat d’Anastasia"],
    prompt:
      "Ton cavalier en e7 ferme g6 et g8. Place ta tour sur la colonne du roi noir en h7.",
    retenir:
      "Une tour attaque sur le bord pendant que le cavalier ferme les sorties vers l’intérieur.",
  },
);
add(
  "mat-boden",
  "Deux fous qui croisent leurs attaques",
  "Le mat de Boden utilise deux fous sur des diagonales différentes. Ici, ton fou en f4 surveille b8, c7 et d6. L’autre fou, en e2, peut attaquer le roi noir en c8.",
  "Le fou arrive en a6 et attaque c8 par b7. Le fou en f4 ferme les sorties de l’autre côté. La tour noire en d8 et le pion en d7 gênent aussi leur propre roi.",
  "Suis d’abord la diagonale a6, b7, c8. Puis regarde les sorties b8, c7 et d7. Les deux fous se complètent sans attaquer les mêmes cases.",
  "Un seul fou ne surveille qu’une couleur de cases. Pour enfermer le roi, il faut aussi fermer les cases de l’autre couleur. Ici, le deuxième fou et les pièces noires s’en chargent.",
  [
    "Le fou en e2 va en a6 : échec au roi en c8. L’autre fou et les pièces noires ferment les sorties.",
  ],
  {
    introduces: ["mat de Boden"],
    prompt:
      "Le fou en f4 surveille déjà plusieurs sorties. Avec ton fou en e2, attaque le roi en c8.",
    retenir:
      "Deux fous peuvent enfermer un roi en attaquant sur deux diagonales qui se complètent.",
  },
);
add(
  "mat-patterns-misc",
  "Reconnaître les sorties fermées",
  "Un motif de mat, c’est une disposition de pièces qui revient souvent quand un roi ne peut plus être sauvé. Ici, le fou blanc en c5 et les pions autour du roi noir limitent ses sorties.",
  "La tour blanche arrive en f8. Le roi noir en f7 est attaqué sur sa colonne. Le fou en c5 surveille notamment e7 et f8 : la tour est protégée.",
  "Au lieu de retenir un nom, regarde trois choses : la pièce qui attaque le roi, celle qui protège cette pièce et celles qui ferment les sorties. Ici, commence par la tour en c8 et le fou en c5.",
  "Une seule case libre peut changer le résultat. Avant d’annoncer le mat, regarde chaque case voisine du roi, les prises possibles et les pièces qui pourraient bloquer l’échec.",
  [
    "La tour en c8 va en f8, protégée par le fou en c5 : le roi noir n’a plus de réponse.",
  ],
  {
    introduces: ["motif de mat"],
    prompt:
      "La tour en c8 peut donner un échec protégé par le fou en c5. Trouve-le.",
    retenir:
      "Pour reconnaître un mat, regarde l’attaquant, sa protection et les sorties du roi.",
  },
);
add(
  "proc-candidates-calc",
  "Comparer deux idées avant de jouer",
  "Un coup candidat, c’est une idée que tu envisages avant de choisir. Ici, ta tour en e1 peut attaquer le roi noir en g8. Ne joue pas tout de suite : imagine sa réponse.",
  "Après Te8+, qui signifie « la tour va en e8 avec échec », le roi noir va en h7. La tour peut ensuite aller en h8 : elle continue l’attaque avec l’aide de ta dame en c3.",
  "Choisis deux idées précises. Pour chacune, imagine ton coup, sa meilleure réponse, puis ton coup suivant. Compare les positions obtenues, pas seulement la première prise.",
  "Ne fais pas jouer à l’adversaire la réponse qui t’arrange. Ici, examine toutes les cases où son roi peut aller après l’échec de la tour.",
  [
    "La tour en e1 va en e8 : le roi noir est attaqué.",
    "Le roi noir se déplace en h7.",
    "La tour va en h8, protégée par la dame en c3 : échec et mat.",
  ],
  {
    introduces: ["coup candidat"],
    prompt:
      "Ton roi en h1 est en danger. Cherche une suite d’échecs avec ta tour en e1.",
    retenir:
      "Imagine ta meilleure idée, sa meilleure réponse et ton coup suivant avant de choisir.",
  },
);
add(
  "tac-intermezzo",
  "Un coup plus urgent avant de reprendre",
  "Un coup intermédiaire, c’est un coup utile joué avant une reprise qui semble automatique. Ici, avec les noirs, tu peux attaquer le roi blanc avec ton cavalier en e5 avant de prendre la tour en d7.",
  "Le cavalier prend en f3 avec échec. Les blancs répondent en reprenant avec leur pion g2. Ton autre cavalier, en f6, peut alors prendre la tour en d7.",
  "Quand on vient de te prendre quelque chose, ne reprends pas par réflexe. Regarde d’abord tes échecs et tes prises plus importantes. Ici, la dame blanche en f3 est une cible prioritaire.",
  "Un coup intermédiaire doit vraiment imposer une réponse. Si tu joues un coup lent, l’adversaire peut sauver la pièce que tu voulais reprendre ensuite.",
  [
    "Le cavalier noir en e5 prend la dame en f3 avec échec.",
    "Le pion blanc en g2 reprend le cavalier : le roi n’est plus attaqué.",
    "Le cavalier noir en f6 prend la tour en d7.",
  ],
  {
    introduces: ["coup intermédiaire"],
    prompt:
      "Tu joues les noirs. Avant de prendre la tour en d7, ton cavalier en e5 peut gagner plus gros avec échec.",
    retenir:
      "Avant une reprise automatique, cherche un échec ou une prise plus importante.",
  },
);
add(
  "tac-xray",
  "Une pièce derrière une autre",
  "Une attaque en rayon X se prépare derrière une pièce qui bloque la ligne. Ici, ta tour en e1 vise la tour noire en e8, mais une deuxième tour noire en e4 coupe cette ligne.",
  "Ta dame prend la tour en e8. La tour noire en e4 reprend la dame, quittant sa case. La colonne e se libère pour ta tour en e1, qui reprend en e8.",
  "Suis toute la colonne e, même au-delà du premier obstacle. Imagine ensuite les échanges : chaque pièce qui part peut ouvrir le passage à celle qui attend derrière.",
  "Ta tour n’attaque pas réellement à travers un obstacle. La pièce qui bloque doit bouger ou disparaître avant que l’attaque existe. Vérifie l’ordre des prises.",
  [
    "La dame en b5 prend la tour en e8 avec échec.",
    "La tour noire en e4 reprend ta dame en e8.",
    "La tour blanche en e1 remonte la colonne libérée et prend en e8.",
  ],
  {
    introduces: ["rayon X"],
    prompt:
      "Ta tour en e1 attend derrière la tour noire en e4. Commence par la prise de dame avec échec.",
    retenir:
      "Après un échange, regarde la pièce cachée derrière : sa ligne vient peut-être de s’ouvrir.",
  },
);
add(
  "tac-interference-clearance",
  "Libérer une ligne pour une autre pièce",
  "Un dégagement, c’est déplacer une pièce pour libérer une ligne ou une case. Ici, ton cavalier en e4 bloque la diagonale de ta dame en c2 vers h7.",
  "Le cavalier prend en f6 avec échec. Après la reprise de la dame noire, ta dame rejoint h7 : la diagonale c2, d3, e4, f5, g6, h7 est libre.",
  "Repère ce que tes propres pièces empêchent. Si l’une peut partir avec échec ou une prise, elle libère une attaque tout en obligeant l’adversaire à répondre.",
  "Une interception fait l’inverse : elle place une pièce au milieu d’une ligne adverse pour la couper. Dans cette position, c’est bien un dégagement : ton cavalier quitte le chemin de ta dame.",
  [
    "Le cavalier en e4 prend le fou en f6 avec échec et libère la diagonale de la dame.",
    "La dame noire en d8 reprend le cavalier en f6.",
    "La dame blanche va de c2 à h7 : échec et mat.",
  ],
  {
    introduces: ["dégagement", "interception"],
    prompt:
      "Ton cavalier en e4 bloque ta dame. Fais-le partir avec échec, puis utilise la diagonale libérée.",
    retenir:
      "Regarde les lignes bloquées par tes propres pièces. Les libérer avec échec peut gagner un coup utile.",
  },
);
add(
  "tac-quiet-move",
  "Un coup utile sans échec ni prise",
  "Un coup calme ne donne pas échec et ne prend rien tout de suite. Il peut pourtant créer une attaque impossible à éviter. Ici, ton fou en c3 peut rejoindre e5.",
  "En e5, ton fou attaque la dame noire en d6. Il agit sur une diagonale proche du roi noir en b8. Regarde pourquoi les noirs ne peuvent pas simplement ignorer l’attaque.",
  "Quand les échecs et les prises ne donnent rien, cherche une attaque de dame ou une menace contre le roi. Ici, commence par regarder les diagonales de ton fou en c3.",
  "Un coup calme laisse à l’adversaire le temps de jouer. Vérifie donc ses échecs et ses prises avant de préparer ton attaque. Ton roi en h2 doit rester en sécurité.",
  [
    "Le fou en c3 va en e5 : il attaque la dame en d6.",
    "Le roi noir va en a8.",
    "Le fou en e5 prend la dame en d6.",
  ],
  {
    introduces: ["coup calme"],
    prompt:
      "Ton fou en c3 peut attaquer la dame en d6 sans donner échec. Trouve sa case.",
    retenir:
      "Si aucun échec ni aucune prise ne marche, cherche une attaque qui prépare un gain au coup suivant.",
  },
);
// Démonstration courte du sacrifice grec : ne pas appeler ainsi un simple mat de dame.
positions["mat-greek-gift"] = {
  fen: "rnbq1rk1/ppp2ppp/4pn2/3p4/3P4/3B1N2/PPP2PPP/RNBQ1RK1 w - - 0 1",
  kind: "square",
  solution: ["h7"],
  check: "rule",
};
add(
  "mat-greek-gift",
  "Le fou qui attaque l’abri du roi",
  "Un sacrifice consiste à donner une pièce pour obtenir autre chose. Le sacrifice grec commence souvent par un fou qui prend le pion h7 avec échec. Ici, ton fou en d3 vise ce pion devant le roi noir en g8.",
  "Prendre h7 peut attirer le roi noir hors de son abri. Mais donner un fou pour un pion coûte deux points. Il faut une suite précise pour justifier ce cadeau.",
  "Avant de jouer, regarde ton cavalier en f3 et ta dame en d1. Peuvent-ils rejoindre rapidement l’attaque ? Vérifie aussi le cavalier noir en f6 : il protège h7 et peut changer toute la suite.",
  "Ne joue pas cette prise parce que tu reconnais le dessin. Dans cette position, la question demande seulement de repérer h7. Elle ne te dit pas de sacrifier ton fou sans calculer.",
  [],
  {
    introduces: ["sacrifice"],
    prompt:
      "Touche le pion de l’abri noir que ton fou en d3 attaque. On repère la cible avant de calculer.",
    retenir:
      "Avant de donner ton fou en h7, vérifie les réponses du roi et l’arrivée de ta dame et de ton cavalier.",
  },
);
positions["fin-active-king"] = {
  fen: "8/7k/8/3p4/3K4/8/8/8 w - - 0 1",
  kind: "move",
  solution: ["d4d5"],
  check: "engine",
};
add(
  "fin-active-king",
  "Quand ton roi peut aller prendre des pions",
  "En finale, c’est-à-dire en fin de partie avec peu de pièces, ton roi peut participer à l’attaque. Ici, le roi blanc en d4 peut prendre le pion noir en d5 : le roi noir est trop loin pour le protéger.",
  "Le roi prend le dernier pion. Il ne reste que deux rois : aucun camp ne peut faire échec et mat. La partie se termine sans gagnant.",
  "Avance ton roi vers les pions que personne ne protège. Vérifie chaque case comme pour n’importe quelle pièce. Ici, d5 est loin du roi noir en h7.",
  "« Peu de pièces » ne veut pas dire « aucun danger ». Si une dame ou une tour adverse reste, elle peut encore donner des échecs. Ton roi ne doit jamais aller sur une case attaquée.",
  [
    "Le roi blanc prend le pion en d5. Aucun des deux rois ne peut faire mat tout seul : partie nulle.",
  ],
  {
    prompt:
      "Ton roi en d4 peut enlever le dernier pion noir. Prends-le sans approcher le roi en h7.",
    retenir:
      "Quand il reste peu de pièces, utilise ton roi pour prendre les pions sans entrer sur une case attaquée.",
  },
);
add(
  "fin-square",
  "Ton roi peut-il rattraper ce pion ?",
  "La règle du carré aide à voir si un roi peut rattraper un pion. Ici, le pion noir en a5 veut atteindre a1. Le carré va de a5 à e5, puis de e5 à e1 et de e1 à a1.",
  "Après être entré dans le carré, ton roi suit le pion. Il arrive en b2 quand le pion atteint a2 : il pourra prendre ce pion avant sa transformation.",
  "Ton roi en f1 est juste hors du carré. C’est aux blancs de jouer : avance en e2 pour y entrer. Regarde ensuite la course, un déplacement de pion puis un déplacement de roi.",
  "Cette règle suppose un pion libre et aucun obstacle pour le roi. Un pion sur sa case de départ peut avancer de deux cases : il faut en tenir compte.",
  [
    "Le roi blanc entre dans le carré en e2.",
    "Le pion noir avance en a4.",
    "Le roi blanc va en d2 et se rapproche du pion.",
    "Le pion avance en a3.",
    "Le roi blanc va en c2.",
    "Le pion arrive en a2, tout près de sa transformation.",
    "Le roi blanc arrive en b2 : il surveille a1 et peut prendre le pion en a2.",
  ],
  {
    introduces: ["règle du carré"],
    prompt:
      "Le pion noir en a5 court vers a1. Fais entrer ton roi en f1 dans le carré pour le rattraper.",
    retenir:
      "Compare le chemin du pion et celui du roi. Si le roi entre à temps dans le carré, il peut rattraper le pion.",
  },
);
positions["fin-passed-pawn"] = {
  fen: "7k/8/4P3/8/8/8/8/K7 w - - 0 1",
  kind: "move",
  solution: ["e6e7", "h8g7", "e7e8q"],
  check: "engine",
};
add(
  "fin-passed-pawn",
  "Le pion que les autres pions ne peuvent plus arrêter",
  "Un pion passé n’a aucun pion adverse devant lui sur sa colonne ou les deux colonnes voisines. Ici, ton pion en e6 n’a plus de pion noir à craindre. Il peut courir vers e8.",
  "Le pion arrive en e8 et devient une dame. Le roi noir ne l’a pas rattrapé. Tu disposes maintenant d’une pièce beaucoup plus forte.",
  "Avant de pousser, regarde si une pièce ou le roi adverse peut arrêter ton pion. Ici, le roi noir en h8 est trop loin : e7 puis e8 suffisent.",
  "Un pion passé n’est pas invisible : une tour, un fou, un cavalier ou le roi peuvent encore le bloquer. Son nom indique seulement qu’aucun pion adverse ne peut lui barrer la route.",
  [
    "Le pion blanc avance en e7. Il est à une case de devenir une dame.",
    "Le roi noir va en g7, mais il est encore trop loin.",
    "Le pion arrive en e8 et devient une dame.",
  ],
  {
    introduces: ["pion passé"],
    prompt:
      "Ton pion en e6 n’a plus de pion adverse devant lui. Fais-le avancer jusqu’à devenir une dame.",
    retenir:
      "Un pion passé n’a plus de pion adverse pour l’arrêter. Vérifie quand même les pièces et le roi.",
  },
);
add(
  "fin-lucena",
  "Mettre ta tour entre ton roi et les échecs",
  "La position de Lucena est une méthode pour gagner avec une tour et un pion près du bout. Ici, ton roi en b8 protège le pion en b7. Il doit quitter b8 pour laisser le pion devenir une dame.",
  "Ta tour finit par se placer en b4 entre la tour noire et ton roi. L’échec s’arrête. Le pion en b7 pourra avancer quand ton roi aura libéré son chemin.",
  "Place d’abord ta tour en d4. Sors ensuite ton roi. Quand la tour noire donne échec sur la colonne b, ta tour peut venir en b4 et protéger ton roi.",
  "Ne pousse pas ton roi au hasard devant les échecs. Prépare la tour sur la quatrième rangée avant de sortir. La démonstration montre une défense noire possible, pas tous ses choix.",
  [
    "La tour blanche va en d4 pour pouvoir protéger le roi plus tard.",
    "La tour noire attend sur c1.",
    "Le roi blanc quitte b8 et va en a7.",
    "La tour noire va en a1 et attaque le roi sur la colonne a.",
    "Le roi blanc va en b6.",
    "La tour noire suit sur b1 : nouvel échec.",
    "Le roi blanc va en c6.",
    "La tour noire suit sur c1 avec échec.",
    "Le roi blanc revient vers son abri en b5.",
    "La tour noire donne échec depuis b1.",
    "La tour blanche se place en b4 entre les deux : elle coupe l’échec.",
  ],
  {
    introduces: ["position de Lucena"],
    prompt:
      "Prépare l’abri de ton roi : place ta tour sur la quatrième rangée, puis suis la sortie du roi.",
    retenir:
      "Prépare ta tour avant de sortir ton roi. Elle pourra se mettre entre lui et la tour adverse.",
  },
);
add(
  "fin-philidor",
  "Sauver la partie contre un pion de plus",
  "La position de Philidor est une défense de fin de partie. Ici, avec les noirs, ton roi en e8 reste devant le pion blanc. Ta tour en b6 empêche le roi blanc en d5 de monter sur la sixième rangée.",
  "Quand le pion blanc avance en e6, il empêche son propre roi de trouver un abri sur cette colonne. Ta tour peut descendre en a1 et préparer des échecs par derrière.",
  "Garde d’abord ta tour sur la sixième rangée, par exemple en a6. Attends que le pion avance en e6. Place alors ta tour loin derrière lui pour attaquer le roi blanc.",
  "Si tu recules ta tour trop tôt, le roi blanc peut monter et protéger l’avance du pion. La bonne décision dépend du déplacement du pion, pas d’un nombre de coups à attendre.",
  [
    "La tour noire reste sur la sixième rangée en allant en a6.",
    "Le pion blanc avance en e6 : il ferme une case devant son propre roi.",
    "La tour noire descend en a1 pour pouvoir donner des échecs par derrière.",
  ],
  {
    introduces: ["position de Philidor"],
    prompt:
      "Tu joues les noirs. Garde ta tour sur la sixième rangée, puis change de côté quand le pion avance.",
    retenir:
      "Bloque d’abord le roi adverse avec ta tour. Quand le pion avance, prépare les échecs par derrière.",
  },
);
positions["fin-rook-behind"] = {
  fen: "7k/8/8/4P3/8/8/8/R5K1 w - - 0 1",
  kind: "square",
  solution: ["e1", "e2", "e3", "e4"],
  check: "rule",
};
add(
  "fin-rook-behind",
  "Placer une tour derrière ton pion",
  "Ta tour peut aider un pion en restant derrière lui. Ici, le pion blanc en e5 avance vers e8. Une tour sur la colonne e, derrière ce pion, pourrait continuer à le protéger à chaque pas.",
  "Plus le pion avance, plus la tour a de cases libres devant elle. Elle n’a pas besoin de le dépasser pour le soutenir. Regarde les cases e1, e2, e3 et e4 derrière le pion.",
  "Trace la colonne du pion jusqu’à ton côté du plateau. Cherche une case pour la tour sur cette ligne. Ici, ta tour en a1 peut rejoindre e1.",
  "Ce conseil ne passe pas avant une attaque contre ton roi. Une tour devant le pion peut aussi être utile pour donner échec. Compare la position réelle avant de déplacer ta tour.",
  [],
  {
    prompt:
      "Touche une case libre derrière ton pion en e5, sur la même colonne, où ta tour pourrait le soutenir.",
    retenir:
      "Derrière un pion, la tour peut continuer à le soutenir pendant qu’il avance.",
  },
);
positions["fin-convert"] = {
  fen: "3r2k1/pp3ppp/8/8/8/8/PP3PPP/3RQ1K1 w - - 0 1",
  kind: "move",
  solution: ["d1d8"],
  check: "engine",
};
add(
  "fin-convert",
  "Transformer tes pièces en plus en victoire",
  "Quand tu as plus de pièces, simplifie les dangers avant d’attaquer. Ici, les blancs ont une dame de plus. La tour noire en d8 est encore capable de donner des échecs.",
  "La tour blanche prend la tour noire en d8. Tu enlèves une pièce dangereuse tout en gardant ta dame en e1. Les noirs ont moins de possibilités contre ton roi.",
  "Compte d’abord les points : dame neuf, tour cinq. Puis cherche les prises qui enlèvent une pièce adverse sans perdre ton avance. Ici, la colonne d est libre entre les deux tours.",
  "Ne cherche pas seulement à échanger. Une prise qui ouvre ton roi ou enferme le roi adverse sans l’attaquer peut gâcher la partie. Vérifie toujours les réponses et les sorties des rois.",
  [
    "La tour blanche en d1 prend la tour noire en d8 avec échec. Tu gardes ta dame en plus.",
  ],
  {
    prompt:
      "Tu as une dame de plus. Enlève la tour noire en d8 avant qu’elle crée une attaque.",
    retenir:
      "Avec des pièces en plus, enlève les dangers contre ton roi avant de chercher à terminer la partie.",
  },
);
positions["fin-opposite-bishops"] = {
  fen: "7k/8/8/3b4/8/8/8/2B3K1 w - - 0 1",
  kind: "square",
  solution: ["d5"],
  check: "rule",
};
add(
  "fin-opposite-bishops",
  "Deux fous qui ne se rencontreront jamais",
  "Des fous de couleurs opposées sont deux fous qui restent sur des couleurs de cases différentes. Ici, ton fou en c1 reste sur les cases foncées. Le fou noir en d5 reste sur les cases claires.",
  "Ton fou ne pourra jamais prendre le fou noir : leurs chemins n’utilisent pas les mêmes cases. Avec peu de pièces, cela peut aider le camp qui a moins de pions à tenir la partie.",
  "Regarde la couleur de c1, puis celle de d5. Pour arrêter un pion adverse, ton roi et ton fou doivent se répartir le travail. Le roi peut surveiller les cases que ton fou n’atteint pas.",
  "Avec des dames et des tours encore présentes, les attaques contre le roi comptent beaucoup. Des fous de couleurs opposées ne garantissent donc jamais une partie nulle.",
  [],
  {
    introduces: ["fous de couleurs opposées"],
    prompt:
      "Touche le fou que ton fou en c1 ne pourra jamais prendre, car ils ne parcourent pas la même couleur.",
    retenir:
      "Deux fous sur des couleurs différentes ne peuvent pas se prendre. Le roi doit aider à surveiller les autres cases.",
  },
);
positions["fin-queen-vs-pawn"] = {
  fen: "8/8/8/8/8/1K6/3Qp3/4k3 w - - 0 1",
  kind: "square",
  solution: ["e1"],
  check: "rule",
};
add(
  "fin-queen-vs-pawn",
  "Ta dame contre un pion presque arrivé",
  "Le pion noir en e2 veut devenir une dame en e1. Mais son propre roi occupe e1. C’est un moment utile pour rapprocher ton roi blanc en b3.",
  "Ta dame en d2 surveille le pion en e2 et plusieurs cases autour du roi noir. Ton roi peut venir l’aider pendant que le pion reste bloqué par son propre roi.",
  "Utilise les échecs de dame pour forcer le roi adverse devant son pion. Quand il bloque la case d’arrivée, approche ton roi. Recommence jusqu’à pouvoir prendre le pion.",
  "Attention aux pions proches du bord, notamment en a2, c2, f2 ou h2. Le roi adverse peut parfois se cacher dans un coin sans coup possible : la partie peut finir nulle. Ne suppose pas que la dame gagne toujours.",
  [],
  {
    prompt:
      "Touche la case où le pion noir veut devenir une dame. Quelle pièce noire la bloque actuellement ?",
    retenir:
      "Force le roi adverse devant son pion pour gagner le temps de rapprocher ton propre roi.",
  },
);
add(
  "ouv-white-italian",
  "Une façon simple de commencer avec les blancs",
  "L’ouverture, c’est le début de la partie. L’Italienne commence par le pion e2 qui avance, le cavalier g1 qui sort en f3 et le fou f1 qui rejoint c4. Chaque coup aide une nouvelle pièce.",
  "Le roi blanc se met à l’abri en g1. Le pion en c3 pourra soutenir une future avance du pion d. Le fou garde une diagonale vers le camp noir.",
  "Ne retiens pas seulement les coups. Le pion e occupe le milieu, le cavalier attaque e5, le fou vise f7. Puis tu protèges ton roi. La démonstration montre une réponse noire courante à chaque étape.",
  "Cette suite suppose certaines réponses noires. Si l’adversaire attaque une pièce ou ton roi, réponds au danger avant de continuer le plan appris.",
  [
    "Le pion blanc avance en e4 : il surveille d5 et f5.",
    "Les noirs avancent aussi leur pion en e5.",
    "Le cavalier blanc sort en f3 et attaque e5.",
    "Le cavalier noir va en c6 pour protéger e5.",
    "Le fou blanc va en c4 et vise f7.",
    "Le fou noir va en c5 et vise f2.",
    "Le pion blanc va en c3 pour préparer d4.",
    "Le cavalier noir sort en f6 et attaque e4.",
    "Le pion blanc va en d3 pour protéger e4.",
    "Le pion noir va en d6 pour soutenir e5.",
    "Le roi blanc va en g1 et la tour en f1 : c’est le roque, qui protège le roi.",
    "Les noirs mettent aussi leur roi à l’abri en g8.",
    "La tour blanche va en e1 pour soutenir e4.",
    "Le pion noir avance en a6 pour donner une sortie au fou.",
    "Le fou blanc recule en b3 et garde la diagonale vers f7.",
    "Le fou noir recule en a7.",
    "Le pion blanc va en h3 pour empêcher une pièce noire de s’installer en g4.",
  ],
  {
    introduces: ["ouverture"],
    prompt:
      "Commence par occuper le milieu avec ton pion e2. Les explications vont ensuite te montrer comment sortir tes pièces.",
    retenir:
      "Au début, fais participer tes cavaliers et tes fous, puis mets ton roi à l’abri.",
  },
);
add(
  "ouv-black-e5",
  "Avec les noirs, répondre au pion e4",
  "Les blancs viennent de pousser leur pion en e4. Avec les noirs, tu peux répondre par e5. Ton pion surveille d4 et f4 et libère le passage du fou en f8.",
  "Les noirs ont sorti leurs deux cavaliers et leur fou, puis mis leur roi en g8. Leurs pièces peuvent jouer sans gêner leur propre roi.",
  "Après e5, protège ce pion si le cavalier blanc l’attaque. Ton cavalier en b8 peut aller en c6. Sors ensuite ton autre cavalier et le fou, puis mets le roi à l’abri.",
  "Si la dame blanche arrive tôt près de f7, vérifie son attaque avant de continuer. Une menace immédiate compte plus que l’ordre appris.",
  [
    "Le pion noir avance en e5 et surveille le milieu.",
    "Le cavalier blanc va en f3 et attaque e5.",
    "Le cavalier noir sort en c6 pour protéger e5.",
    "Le fou blanc arrive en c4 et vise f7.",
    "Le fou noir va en c5 et vise f2.",
    "Le pion blanc avance en d3.",
    "Le cavalier noir sort en f6 et attaque e4.",
    "Le roi blanc se met à l’abri en g1.",
    "Le pion noir va en d6 pour soutenir e5.",
    "Le cavalier blanc sort en c3.",
    "Le roi noir va en g8 et la tour en f8 : les noirs mettent leur roi à l’abri.",
  ],
  {
    prompt:
      "Tu joues les noirs. Réponds au pion blanc en e4 en avançant ton pion e7 de deux cases.",
    retenir:
      "Contre e4, e5 occupe le milieu. Protège ce pion, sors tes pièces et mets ton roi à l’abri.",
  },
);
add(
  "ouv-black-d5",
  "Avec les noirs, répondre au pion d4",
  "Le pion blanc vient d’arriver en d4. Tu peux avancer ton pion d7 en d5 pour lui contester les cases du milieu. Ton pion e7 pourra ensuite le soutenir depuis e6.",
  "Les noirs ont protégé le pion d5 et leur roi a rejoint g8. Le pion b6 prépare la sortie du fou en c8 vers b7.",
  "Place d’abord d5, puis e6 quand cela convient. Sors le cavalier g8 en f6 et le fou f8 en e7. Une fois le chemin libre, mets ton roi à l’abri avec la tour h8.",
  "Le pion e6 protège d5, mais il ferme aussi la diagonale du fou en c8. Pense à donner plus tard une sortie à ce fou. Ici, b6 prépare b7.",
  [
    "Le pion noir avance en d5 et surveille c4 et e4.",
    "Les blancs attaquent d5 avec leur pion c4.",
    "Le pion noir va en e6 pour soutenir d5.",
    "Le cavalier blanc sort en c3.",
    "Le cavalier noir sort en f6 et protège d5.",
    "Le fou blanc va en g5 et vise le cavalier.",
    "Le fou noir sort en e7 et libère le chemin du roi.",
    "Le pion blanc va en e3.",
    "Le roi noir va en g8 et la tour en f8 : le roi est à l’abri.",
    "Le cavalier blanc sort en f3.",
    "Le pion noir va en h6 et attaque le fou en g5.",
    "Le fou blanc recule en h4.",
    "Le pion noir va en b6 pour préparer la sortie du fou en c8.",
  ],
  {
    prompt:
      "Tu joues les noirs. Le pion blanc vient d’arriver en d4. Réponds avec ton pion d7.",
    retenir:
      "Contre d4, le duo d5 et e6 forme une base. N’oublie pas de faire sortir le fou en c8.",
  },
);
positions["ouv-gambits"] = {
  fen: "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2",
  kind: "square",
  solution: ["f4"],
  check: "rule",
};
add(
  "ouv-gambits",
  "Un pion offert n’est pas toujours gratuit",
  "Un gambit consiste à offrir un pion au début pour faire sortir ses pièces plus vite ou ouvrir une ligne. Ici, les blancs viennent de pousser f4 : ton pion noir en e5 peut le prendre.",
  "Si le pion noir prend en f4, les blancs ont perdu un pion mais libéré des lignes. Les noirs doivent continuer à sortir leurs pièces sans dépenser tous leurs coups à garder ce pion.",
  "Avant d’accepter un pion offert, regarde ton roi et tes pièces encore à leur place de départ. Un pion vaut un point. Perdre plusieurs coups à le protéger peut laisser l’adversaire attaquer.",
  "Accepter ou refuser peut être raisonnable. Le but de cet exercice est de repérer le pion offert en f4, pas de promettre qu’une seule réponse gagne.",
  [],
  {
    introduces: ["gambit"],
    prompt:
      "Tu joues les noirs. Touche le pion blanc que ton pion en e5 peut prendre.",
    retenir:
      "Un pion de plus ne sert pas si tu oublies de sortir tes pièces et de protéger ton roi.",
  },
);
positions["str-open-files"] = {
  fen: "6k1/pp3ppp/8/8/8/8/PP3PPP/R5K1 w - - 0 1",
  kind: "square",
  solution: ["c1", "d1", "e1"],
  check: "rule",
};
add(
  "str-open-files",
  "Donner une route libre à ta tour",
  "Une colonne ouverte ne contient aucun pion. Ta tour peut y avancer sans être bloquée. Ici, les colonnes c, d et e sont libres. La tour en a1 manque de passage à cause du pion en a2.",
  "En rejoignant c1, d1 ou e1, ta tour regarde loin vers le camp noir. Sur a1, elle reste enfermée derrière son propre pion.",
  "Regarde chaque colonne de bas en haut. Si aucun pion ne la coupe, cherche si ta tour peut l’utiliser sans se faire prendre. Ici, elle peut glisser le long de la première rangée.",
  "Une colonne sans pion peut quand même être surveillée par une pièce adverse. Vérifie les attaques avant d’y envoyer ta tour. Une route libre n’est pas forcément une route sûre.",
  [],
  {
    introduces: ["colonne ouverte"],
    prompt:
      "Touche une case de la première rangée, sur une colonne sans aucun pion, pour donner une route à ta tour.",
    retenir:
      "Cherche une colonne sans pion pour ta tour, puis vérifie que l’adversaire ne peut pas l’y prendre.",
  },
);
add(
  "str-outposts",
  "Une case où ton cavalier peut rester",
  "Un avant-poste est une case avancée protégée par un de tes pions, qu’aucun pion adverse ne peut attaquer. Ici, d5 convient à ton cavalier en c3 : tes pions c4 et e4 la protègent.",
  "En d5, le cavalier surveille des cases proches du camp noir. Le pion noir en d6 ne peut pas le prendre : un pion prend en diagonale, pas devant lui.",
  "Regarde d’abord les pions noirs des colonnes c et e. Il n’y en a plus. Ils ne pourront donc pas chasser un cavalier installé en d5.",
  "Une pièce adverse pourrait quand même prendre ton cavalier. Un avant-poste résiste aux pions, pas à toutes les attaques. Avant de t’y installer, regarde aussi les fous, cavaliers, tours et dame.",
  ["Le cavalier en c3 va en d5, protégé par les pions en c4 et e4."],
  {
    introduces: ["avant-poste"],
    prompt:
      "Le pion noir en d6 ne peut pas prendre devant lui. Installe ton cavalier en d5, protégé par tes pions.",
    retenir:
      "Une bonne case de cavalier est protégée par un pion et difficile à attaquer avec un pion adverse.",
  },
);
add(
  "str-good-bad-bishop",
  "Le fou gêné par ses propres pions",
  "On appelle mauvais fou un fou dont les chemins sont gênés par ses propres pions. Ici, ton fou en c1 parcourt les cases foncées. Tes pions en c4, d5 et e4 occupent aussi des cases foncées et sont bloqués.",
  "Ton fou peut encore bouger, mais il n’atteint pas facilement le camp noir. Ses propres pions forment une barrière sur sa couleur.",
  "Compare la couleur du fou et celle de tes pions bloqués. Pour l’aider, cherche plus tard une sortie autour de la barrière ou un échange de pions qui ouvre une diagonale.",
  "Un fou gêné peut rester utile pour protéger tes pions. Ne l’échange pas automatiquement. Regarde ce qu’il protège et ce que ferait l’adversaire après son départ.",
  [],
  {
    introduces: ["mauvais fou"],
    prompt:
      "Touche le fou dont les diagonales sont gênées par les pions blancs bloqués.",
    retenir:
      "Regarde si tes pions bloqués occupent la couleur de ton fou. Cherche comment lui ouvrir un chemin.",
  },
);
add(
  "str-pawn-structure",
  "Les pions qui peuvent s’aider",
  "Un pion isolé n’a aucun pion ami sur les colonnes voisines. Ici, le pion blanc en d4 n’a ni pion sur la colonne c, ni pion sur la colonne e. Tes pièces doivent donc l’aider.",
  "Les pions en a2 et b2 peuvent se soutenir en avançant. Le pion en d4 n’a pas ce voisin. S’il est attaqué, une pièce blanche devra souvent rester pour le protéger.",
  "Pour chaque pion, regarde les deux colonnes voisines. Repère aussi les pions doublés : deux pions du même camp sur une seule colonne. Leurs chemins peuvent se gêner.",
  "Un pion isolé n’est pas toujours mauvais. Il peut surveiller des cases importantes et laisser des lignes à tes pièces. Ici, d4 surveille c5 et e5.",
  [],
  {
    introduces: ["pion isolé", "pions doublés"],
    prompt:
      "Touche le pion blanc qui n’a aucun pion ami sur les deux colonnes voisines.",
    retenir:
      "Les pions ne reculent pas. Avant de les avancer, regarde ceux qu’ils aideront et ceux qu’ils laisseront seuls.",
  },
);
add(
  "str-weak-squares",
  "Une case que les pions ne peuvent plus protéger",
  "Une case faible est une case qu’aucun pion du camp concerné ne peut plus défendre. Ici, d5 est faible pour les noirs : leurs pions c et e ont disparu.",
  "Ton cavalier peut utiliser d5. Les pions blancs en c4 et e4 protègent cette case, tandis que le pion noir en d6 ne peut pas attaquer devant lui.",
  "Regarde les colonnes voisines de d5. Un pion noir devrait venir de c6 ou e6 pour la prendre. Sans pions sur ces colonnes, cette attaque ne pourra pas arriver.",
  "« Faible » ne veut pas dire sans aucune protection. Un fou, un cavalier ou une tour peuvent surveiller la case. Le mot parle ici des pions seulement.",
  [],
  {
    introduces: ["case faible"],
    prompt:
      "Touche la case d5 : vérifie pourquoi aucun pion noir ne pourra y prendre ton cavalier.",
    retenir:
      "Avant d’installer une pièce, regarde si les pions adverses pourront encore la chasser.",
  },
);
add(
  "str-king-safety-middlegame",
  "Garder un abri devant ton roi",
  "Les pions devant ton roi ferment des chemins aux pièces adverses. Ici, le roi blanc en g1 a un trou sur la colonne h. La dame noire en e4 et le fou en c6 peuvent en profiter.",
  "La dame noire prend en g2 avec échec. Le fou en c6 la protège par d5, e4 et f3. Le roi blanc ne peut pas prendre cette dame.",
  "Avant d’avancer un pion près de ton roi, regarde quelles diagonales cela ouvre. Ici, suis la diagonale du fou en c6 jusqu’à g2 : elle traverse l’abri blanc.",
  "Il faut parfois avancer un pion pour donner une sortie au roi. Compare le trou créé et la sortie gagnée. Une règle générale ne remplace pas cette vérification.",
  [
    "La dame noire en e4 prend le pion en g2, protégée par le fou en c6 : échec et mat.",
  ],
  {
    prompt:
      "Tu joues les noirs. Ta dame en e4 et ton fou en c6 visent le même pion devant le roi blanc.",
    retenir:
      "Avant de pousser un pion devant ton roi, regarde les lignes que tu ouvres à l’adversaire.",
  },
);
add(
  "str-exchanges",
  "Quand prendre aide vraiment",
  "Un échange, c’est prendre une pièce puis laisser l’adversaire reprendre la tienne. Mais commence par regarder si une prise est simplement gratuite. Ici, ta tour en d1 peut prendre celle en d8 sans être reprise.",
  "La tour noire disparaît. Tu gardes ta dame en e1 et ta tour en d8. Tu as enlevé une pièce qui aurait pu attaquer ton roi.",
  "Avant une prise, compte ce que chaque camp perd. Regarde aussi quelles lignes s’ouvrent. Ici, la colonne d est vide entre les tours, et aucune pièce noire ne peut reprendre en d8.",
  "Ne fais pas un échange uniquement parce que tu as plus de points. Tu peux encore perdre si ton roi est exposé ou si ton dernier pion disparaît.",
  [
    "La tour en d1 prend la tour en d8. Il n’y a pas de reprise noire : c’est une prise gratuite.",
  ],
  {
    prompt:
      "Tu as une dame de plus. Ta tour peut enlever la dernière tour noire : trouve la prise.",
    retenir:
      "Compare les pièces perdues et la sécurité des rois avant de prendre ou d’échanger.",
  },
);
add(
  "str-prophylaxis",
  "Empêcher son idée avant qu’elle arrive",
  "La prophylaxie consiste à empêcher le plan adverse avant qu’il fonctionne. Ici, la dame noire en f4 est très proche de ton roi en h2. Ton pion en g2 peut la chasser.",
  "Le pion arrive en g3 et attaque la dame en f4. Les noirs doivent s’occuper de leur dame. S’ils vont en f3, ta dame en d1 peut la prendre.",
  "Avant ton propre projet, regarde la pièce adverse la plus proche de ton roi. Demande-toi où elle pourrait aller. Ici, g3 fait reculer la dame et gagne un coup utile.",
  "Un pion qui chasse la dame peut aussi ouvrir ton roi. Vérifie donc les prises possibles sur g3 et les échecs adverses avant de pousser.",
  [
    "Le pion blanc en g2 avance en g3 et attaque la dame en f4.",
    "La dame noire va en f3.",
    "La dame blanche en d1 prend la dame en f3.",
  ],
  {
    introduces: ["prophylaxie"],
    prompt:
      "La dame noire en f4 menace ton roi. Chasse-la avec un pion, puis regarde sa réponse.",
    retenir:
      "Avant de commencer ton plan, cherche ce que l’adversaire veut faire et comment l’en empêcher.",
  },
);
add(
  "str-initiative",
  "Faire jouer tes pièces avant les siennes",
  "Avoir l’initiative signifie créer les dangers auxquels l’adversaire doit répondre. Ici, ton fou en c4 et tes cavaliers sont déjà sortis. Avancer le pion d3 peut ouvrir des lignes pour eux.",
  "Le pion arrive en d4 et attaque le pion noir en e5. Si les pions s’échangent, tes pièces auront davantage de cases libres devant elles.",
  "Avant d’ouvrir une ligne, compare les pièces prêtes à jouer. Ici, tes cavaliers en c3 et f3 et ton fou en c4 participent déjà. Ton roi est à l’abri en g1.",
  "Ouvrir le jeu avec ton roi au milieu et tes pièces encore enfermées peut aider l’adversaire. Prépare tes pièces avant de chercher ces échanges de pions.",
  [
    "Le pion blanc en d3 avance en d4 : il attaque e5 et prépare l’ouverture de lignes.",
  ],
  {
    introduces: ["initiative"],
    prompt:
      "Ton roi est à l’abri et plusieurs pièces sont sorties. Avance ton pion d3 pour attaquer e5.",
    retenir:
      "Ouvre des lignes quand tes pièces sont prêtes à les utiliser, puis vérifie la réponse adverse.",
  },
);
positions["str-bishop-pair-space"] = {
  fen: "6k1/5ppp/8/3P4/2B5/8/5PPP/2B3K1 w - - 0 1",
  kind: "square",
  solution: ["c1", "c4"],
  check: "rule",
};
add(
  "str-bishop-pair-space",
  "Deux fous qui couvrent les deux couleurs",
  "La paire de fous, c’est avoir encore tes deux fous : un sur chaque couleur. Ici, celui en c1 parcourt les cases foncées, celui en c4 les cases claires. Ensemble, ils peuvent viser les deux couleurs.",
  "Le pion blanc en d5 bloque certaines diagonales, mais les deux fous trouvent encore des chemins différents. Des échanges de pions peuvent leur ouvrir davantage de lignes.",
  "Regarde chaque fou séparément. Quelles cases peut-il atteindre ? Quels pions le bloquent ? Ne bouge pas tes pions au hasard : cherche la diagonale que tu veux libérer.",
  "Plus d’espace signifie plus de cases disponibles pour tes pièces. Mais avancer trop de pions peut laisser des cases sans protection derrière eux. Regarde aussi les cavaliers adverses.",
  [],
  {
    introduces: ["paire de fous", "espace"],
    prompt:
      "Touche un de tes deux fous. Observe ensuite l’autre : il reste sur une couleur différente.",
    retenir:
      "Deux fous se complètent sur les deux couleurs. Donne-leur des diagonales libres sans abandonner tes protections.",
  },
);
add(
  "str-plan-making",
  "Choisir une idée pour les prochains coups",
  "Un plan est une idée pour plusieurs coups. Ici, ton cavalier en c3 peut rejoindre d5, une case protégée par tes pions et que les pions noirs ne peuvent pas attaquer.",
  "Le cavalier s’installe en d5. Depuis cette case, il surveille davantage le camp noir. Tu as amélioré sa place sans donner une pièce.",
  "Commence par les dangers immédiats. S’il n’y en a pas, cherche ta pièce la moins utile ou une cible adverse. Ici, la bonne case d5 donne une direction simple au cavalier.",
  "Un plan doit changer si l’adversaire crée une menace. Ne joue pas ton deuxième coup prévu sans regarder son dernier coup. Les prochains déplacements dépendent toujours de sa réponse.",
  ["Le cavalier blanc va de c3 à d5, soutenu par les pions en c4 et e4."],
  {
    prompt:
      "Ton cavalier en c3 peut occuper une case protégée au milieu. Installe-le en d5.",
    retenir:
      "Choisis une cible ou une meilleure case pour ta pièce, puis adapte ton idée à chaque réponse adverse.",
  },
);
for (const [id, title, definition, why, method, pitfall, retenir] of [
  [
    "meta-play-slow",
    "Prendre le temps de voir la réponse",
    "Jouer lentement te donne le temps de vérifier ce que l’adversaire peut répondre. Ici, ton cavalier en e4 peut attaquer le roi noir et la dame en même temps. Prendre quelques secondes aide à voir les deux cibles.",
    "Après le saut du cavalier en d6, le roi noir doit bouger. Le cavalier peut alors prendre la dame en b5. La suite compte plus que la vitesse du premier coup.",
    "Pour apprendre, choisis une partie de quinze minutes ou plus. Avant chaque coup, regarde ses attaques, ton idée et sa réponse. Dans cette position, commence par les coups du cavalier qui attaquent le roi.",
    "Ne passe pas tout ton temps à chercher le coup parfait. Quand tu as trouvé un coup sûr et compris sa réponse, joue-le. Garde du temps pour la suite.",
    "Joue assez lentement pour imaginer la réponse adverse avant chaque coup.",
  ],
  [
    "meta-game-review",
    "Comprendre une erreur après la partie",
    "Revoir une partie consiste à retrouver les moments où une décision a changé la suite. Ici, imagine que tu n’as pas vu le saut du cavalier en d6. Cherche d’abord ce que tu aurais pu regarder.",
    "La suite montre le cavalier qui attaque deux cibles. La leçon à garder peut être très précise : quand le roi et la dame sont proches, regarde les sauts du cavalier.",
    "Choisis un moment où tu as perdu une pièce ou raté une prise. Sans aide, écris ce que tu pensais. Compare ensuite avec l’analyse de l’app. Retiens une seule action à essayer dans la prochaine partie.",
    "Le score du logiciel ne remplace pas une explication. Si tu ne comprends pas pourquoi un coup marche, joue sa réponse sur l’échiquier. Ici, observe où le roi doit aller après Cd6+, le cavalier en d6 avec échec.",
    "Après une partie, retrouve une erreur et transforme-la en une question simple pour la prochaine.",
  ],
  [
    "meta-time-management",
    "Garder du temps pour les moments difficiles",
    "La pendule mesure le temps qu’il te reste. Utilise davantage de temps quand une prise ou une attaque peut changer la partie. Ici, il faut voir le saut du cavalier et la prise de dame qui suit.",
    "Une petite pause permet de voir toute la suite : échec au roi, déplacement du roi, prise de la dame. Jouer le premier coup sans imaginer les suivants peut te faire rater le gain.",
    "Quand une pièce vient d’être prise ou que ton roi est attaqué, ralentis. Quand tu connais déjà une réponse sûre, joue sans recommencer tout ton raisonnement. Regarde ta pendule de temps en temps.",
    "Ne joue pas un coup risqué uniquement parce qu’il te reste peu de temps. Cherche d’abord un déplacement qui ne donne aucune pièce. Une idée simple et sûre vaut mieux qu’une attaque incomprise.",
    "Garde ton temps pour les prises et les attaques. Vérifie quand même les coups qui paraissent évidents.",
  ],
  [
    "meta-woodpecker",
    "Refaire les mêmes problèmes pour mieux les voir",
    "Refaire un même groupe de problèmes aide à reconnaître les attaques plus vite. Ici, le cavalier peut attaquer le roi et la dame ensemble. La première fois, tu calcules ; plus tard, tu reconnais le dessin.",
    "La dame tombe parce que le roi doit répondre à l’échec. Ce n’est pas seulement la case d6 qu’il faut retenir : c’est le lien entre le cavalier, le roi et la dame.",
    "Dans S’entraîner, choisis Refaire les mêmes problèmes. Termine le groupe sans chercher la vitesse. Recommence ensuite les mêmes positions en essayant de rester aussi précise. Compare le temps et les réussites.",
    "Si tu retiens seulement les noms des cases, tu peux échouer quand l’image change. Avant chaque réponse, explique quelles sont les deux cibles et pourquoi l’adversaire ne peut pas les sauver ensemble.",
    "Répète les problèmes en comprenant les attaques. La vitesse vient après la précision.",
  ],
])
  add(
    id,
    title,
    definition,
    why,
    method,
    pitfall,
    [
      "Le cavalier va en d6 : il attaque le roi en e8 et la dame en b5.",
      "Le roi noir se déplace en d7 pour sortir de l’échec.",
      "Le cavalier prend la dame en b5.",
    ],
    { challenge: false, retenir },
  );
positions["fin-queen-vs-pawn"].fen = "8/8/8/8/8/1K1Q4/4p3/4k3 w - - 0 1";
content["fin-queen-vs-pawn"].why =
  "Ta dame en d3 surveille le pion en e2 et plusieurs cases autour du roi noir. Ton roi peut venir l’aider pendant que le pion reste bloqué par son propre roi.";
positions["mat-queen-support"] = {
  fen: "k7/2Q5/2K5/8/8/8/8/8 w - - 0 1",
  solution: ["c7b7"],
  kind: "move",
  check: "engine",
};
Object.assign(content["mat-queen-support"], {
  definition:
    "Une dame proche du roi adverse surveille presque toutes ses sorties. Mais elle a besoin d’une protection : sinon, le roi peut la prendre. Ici, ton roi en c6 peut aider ta dame en c7.",
  why: "La dame arrive en b7, juste à côté du roi noir en a8. Ton roi en c6 la protège. Le roi noir ne peut ni la prendre, ni trouver une sortie : échec et mat.",
  method:
    "Regarde b7 avant d’y poser ta dame. Le roi blanc en c6 surveille cette case. Ta dame pourra alors fermer a7, a8 et b8, tout près du roi noir.",
  pitfall:
    "Sans ton roi en c6, le roi noir pourrait prendre une dame arrivée en b7. Avant chaque attaque de dame près du roi, vérifie sa protection.",
  comments: [
    "La dame en c7 va en b7, protégée par ton roi en c6 : échec et mat.",
  ],
  prompt:
    "Ton roi en c6 peut protéger ta dame près du roi noir en a8. Termine la partie.",
});
