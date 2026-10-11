// Pedagogical variants: reflected boards and swapped camps, checked with chess.js.
export const puzzleBank=[
  {
    "id": "rook-queen-mirror",
    "title": "Une dame sans défense · autre aile",
    "theme": "Capture",
    "level": 1,
    "fen": "k7/8/8/4q3/8/8/8/1K2R3 w - - 0 1",
    "solution": [
      "e1e5"
    ],
    "hint": "La tour se déplace en ligne droite. Regarde la colonne e.",
    "why": "Même motif, nouvelle disposition. Ta tour prend une dame non protégée. Tu gagnes du matériel sans pouvoir être reprise.",
    "variantOf": "rook-queen",
    "side": "w"
  },
  {
    "id": "rook-queen-colors",
    "title": "Une dame sans défense · autre camp",
    "theme": "Capture",
    "level": 1,
    "fen": "3r2k1/8/8/8/3Q4/8/8/7K b - - 0 1",
    "solution": [
      "d8d4"
    ],
    "hint": "La tour se déplace en ligne droite. Regarde la colonne d.",
    "why": "Même motif, nouvelle disposition. Ta tour prend une dame non protégée. Tu gagnes du matériel sans pouvoir être reprise.",
    "variantOf": "rook-queen",
    "side": "b"
  },
  {
    "id": "rook-queen-both",
    "title": "Une dame sans défense · autre perspective",
    "theme": "Capture",
    "level": 1,
    "fen": "1k2r3/8/8/8/4Q3/8/8/K7 b - - 0 1",
    "solution": [
      "e8e4"
    ],
    "hint": "La tour se déplace en ligne droite. Regarde la colonne e.",
    "why": "Même motif, nouvelle disposition. Ta tour prend une dame non protégée. Tu gagnes du matériel sans pouvoir être reprise.",
    "variantOf": "rook-queen",
    "side": "b"
  },
  {
    "id": "bishop-rook-mirror",
    "title": "Sur la bonne diagonale · autre aile",
    "theme": "Capture",
    "level": 1,
    "fen": "k7/8/2r5/8/8/5B2/8/1K6 w - - 0 1",
    "solution": [
      "f3c6"
    ],
    "hint": "Pars du fou et suis sa diagonale vers le haut à droite.",
    "why": "Même motif, nouvelle disposition. Le fou capture la tour en diagonale. Les cases entre les deux pièces sont libres.",
    "variantOf": "bishop-rook",
    "side": "w"
  },
  {
    "id": "bishop-rook-colors",
    "title": "Sur la bonne diagonale · autre camp",
    "theme": "Capture",
    "level": 1,
    "fen": "6k1/8/2b5/8/8/5R2/8/7K b - - 0 1",
    "solution": [
      "c6f3"
    ],
    "hint": "Pars du fou et suis sa diagonale vers le haut à droite.",
    "why": "Même motif, nouvelle disposition. Le fou capture la tour en diagonale. Les cases entre les deux pièces sont libres.",
    "variantOf": "bishop-rook",
    "side": "b"
  },
  {
    "id": "bishop-rook-both",
    "title": "Sur la bonne diagonale · autre perspective",
    "theme": "Capture",
    "level": 1,
    "fen": "1k6/8/5b2/8/8/2R5/8/K7 b - - 0 1",
    "solution": [
      "f6c3"
    ],
    "hint": "Pars du fou et suis sa diagonale vers le haut à droite.",
    "why": "Même motif, nouvelle disposition. Le fou capture la tour en diagonale. Les cases entre les deux pièces sont libres.",
    "variantOf": "bishop-rook",
    "side": "b"
  },
  {
    "id": "knight-queen-mirror",
    "title": "Le saut du cavalier · autre aile",
    "theme": "Capture",
    "level": 1,
    "fen": "k7/8/8/3q4/8/2N5/8/1K6 w - - 0 1",
    "solution": [
      "c3d5"
    ],
    "hint": "Deux cases vers le haut, une vers la gauche : un L.",
    "why": "Même motif, nouvelle disposition. Le cavalier capture la dame. Il n’a pas besoin d’un chemin libre pour sauter.",
    "variantOf": "knight-queen",
    "side": "w"
  },
  {
    "id": "knight-queen-colors",
    "title": "Le saut du cavalier · autre camp",
    "theme": "Capture",
    "level": 1,
    "fen": "6k1/8/5n2/8/4Q3/8/8/7K b - - 0 1",
    "solution": [
      "f6e4"
    ],
    "hint": "Deux cases vers le haut, une vers la gauche : un L.",
    "why": "Même motif, nouvelle disposition. Le cavalier capture la dame. Il n’a pas besoin d’un chemin libre pour sauter.",
    "variantOf": "knight-queen",
    "side": "b"
  },
  {
    "id": "knight-queen-both",
    "title": "Le saut du cavalier · autre perspective",
    "theme": "Capture",
    "level": 1,
    "fen": "1k6/8/2n5/8/3Q4/8/8/K7 b - - 0 1",
    "solution": [
      "c6d4"
    ],
    "hint": "Deux cases vers le haut, une vers la gauche : un L.",
    "why": "Même motif, nouvelle disposition. Le cavalier capture la dame. Il n’a pas besoin d’un chemin libre pour sauter.",
    "variantOf": "knight-queen",
    "side": "b"
  },
  {
    "id": "pawn-capture-mirror",
    "title": "Le pion capture de travers · autre aile",
    "theme": "Capture",
    "level": 1,
    "fen": "k7/8/8/4r3/3P4/8/8/1K6 w - - 0 1",
    "solution": [
      "d4e5"
    ],
    "hint": "Un pion blanc capture une case en diagonale vers le haut.",
    "why": "Même motif, nouvelle disposition. Le pion prend la tour en e5. Souviens-toi : il avance droit, mais capture en diagonale.",
    "variantOf": "pawn-capture",
    "side": "w"
  },
  {
    "id": "pawn-capture-colors",
    "title": "Le pion capture de travers · autre camp",
    "theme": "Capture",
    "level": 1,
    "fen": "6k1/8/8/4p3/3R4/8/8/7K b - - 0 1",
    "solution": [
      "e5d4"
    ],
    "hint": "Un pion noir capture une case en diagonale vers le haut.",
    "why": "Même motif, nouvelle disposition. Le pion prend la tour en d4. Souviens-toi : il avance droit, mais capture en diagonale.",
    "variantOf": "pawn-capture",
    "side": "b"
  },
  {
    "id": "pawn-capture-both",
    "title": "Le pion capture de travers · autre perspective",
    "theme": "Capture",
    "level": 1,
    "fen": "1k6/8/8/3p4/4R3/8/8/K7 b - - 0 1",
    "solution": [
      "d5e4"
    ],
    "hint": "Un pion noir capture une case en diagonale vers le haut.",
    "why": "Même motif, nouvelle disposition. Le pion prend la tour en e4. Souviens-toi : il avance droit, mais capture en diagonale.",
    "variantOf": "pawn-capture",
    "side": "b"
  },
  {
    "id": "queen-rook-mirror",
    "title": "La dame voit loin · autre aile",
    "theme": "Capture",
    "level": 1,
    "fen": "k7/8/8/1r6/8/8/4Q3/1K6 w - - 0 1",
    "solution": [
      "e2b5"
    ],
    "hint": "La dame peut aussi se déplacer comme un fou.",
    "why": "Même motif, nouvelle disposition. La dame prend la tour en suivant la diagonale e2–d3–c4–b5.",
    "variantOf": "queen-rook",
    "side": "w"
  },
  {
    "id": "queen-rook-colors",
    "title": "La dame voit loin · autre camp",
    "theme": "Capture",
    "level": 1,
    "fen": "6k1/3q4/8/8/6R1/8/8/7K b - - 0 1",
    "solution": [
      "d7g4"
    ],
    "hint": "La dame peut aussi se déplacer comme un fou.",
    "why": "Même motif, nouvelle disposition. La dame prend la tour en suivant la diagonale d7–e6–f5–g4.",
    "variantOf": "queen-rook",
    "side": "b"
  },
  {
    "id": "queen-rook-both",
    "title": "La dame voit loin · autre perspective",
    "theme": "Capture",
    "level": 1,
    "fen": "1k6/4q3/8/8/1R6/8/8/K7 b - - 0 1",
    "solution": [
      "e7b4"
    ],
    "hint": "La dame peut aussi se déplacer comme un fou.",
    "why": "Même motif, nouvelle disposition. La dame prend la tour en suivant la diagonale e7–d6–c5–b4.",
    "variantOf": "queen-rook",
    "side": "b"
  },
  {
    "id": "escape-mirror",
    "title": "Échec : trouve la capture · autre aile",
    "theme": "Défense",
    "level": 1,
    "fen": "k7/8/8/8/8/8/1r6/1K6 w - - 0 1",
    "solution": [
      "b1b2"
    ],
    "hint": "Le roi peut capturer une pièce voisine si la case n’est pas attaquée.",
    "why": "Même motif, nouvelle disposition. Le roi capture la tour non protégée. Ce coup met fin à l’échec. Ici, d’autres fuites existent, mais l’objectif est de capturer la tour.",
    "variantOf": "escape",
    "side": "w"
  },
  {
    "id": "escape-colors",
    "title": "Échec : trouve la capture · autre camp",
    "theme": "Défense",
    "level": 1,
    "fen": "6k1/6R1/8/8/8/8/8/7K b - - 0 1",
    "solution": [
      "g8g7"
    ],
    "hint": "Le roi peut capturer une pièce voisine si la case n’est pas attaquée.",
    "why": "Même motif, nouvelle disposition. Le roi capture la tour non protégée. Ce coup met fin à l’échec. Ici, d’autres fuites existent, mais l’objectif est de capturer la tour.",
    "variantOf": "escape",
    "side": "b"
  },
  {
    "id": "escape-both",
    "title": "Échec : trouve la capture · autre perspective",
    "theme": "Défense",
    "level": 1,
    "fen": "1k6/1R6/8/8/8/8/8/K7 b - - 0 1",
    "solution": [
      "b8b7"
    ],
    "hint": "Le roi peut capturer une pièce voisine si la case n’est pas attaquée.",
    "why": "Même motif, nouvelle disposition. Le roi capture la tour non protégée. Ce coup met fin à l’échec. Ici, d’autres fuites existent, mais l’objectif est de capturer la tour.",
    "variantOf": "escape",
    "side": "b"
  },
  {
    "id": "backrank-mirror",
    "title": "Le mat du couloir · autre aile",
    "theme": "Mat en 1",
    "level": 2,
    "fen": "1k6/ppp5/8/8/8/8/PPP5/1K2R3 w - - 0 1",
    "solution": [
      "e1e8"
    ],
    "hint": "La tour peut entrer sur la huitième rangée. Les pions enferment le roi.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "mate": true,
    "variantOf": "backrank",
    "side": "w"
  },
  {
    "id": "backrank-colors",
    "title": "Le mat du couloir · autre camp",
    "theme": "Mat en 1",
    "level": 2,
    "fen": "3r2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1",
    "solution": [
      "d8d1"
    ],
    "hint": "La tour peut entrer sur la première rangée. Les pions enferment le roi.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "mate": true,
    "variantOf": "backrank",
    "side": "b"
  },
  {
    "id": "backrank-both",
    "title": "Le mat du couloir · autre perspective",
    "theme": "Mat en 1",
    "level": 2,
    "fen": "1k2r3/ppp5/8/8/8/8/PPP5/1K6 b - - 0 1",
    "solution": [
      "e8e1"
    ],
    "hint": "La tour peut entrer sur la première rangée. Les pions enferment le roi.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "mate": true,
    "variantOf": "backrank",
    "side": "b"
  },
  {
    "id": "queen-mate-colors",
    "title": "La dame et son roi · autre camp",
    "theme": "Mat en 1",
    "level": 2,
    "fen": "8/8/8/8/8/5kq1/8/7K b - - 0 1",
    "solution": [
      "g3g2"
    ],
    "hint": "Approche ta dame du roi adverse, avec la protection de ton roi.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "mate": true,
    "variantOf": "queen-mate",
    "side": "b"
  },
  {
    "id": "queen-mate-both",
    "title": "La dame et son roi · autre perspective",
    "theme": "Mat en 1",
    "level": 2,
    "fen": "8/8/8/8/8/1qk5/8/K7 b - - 0 1",
    "solution": [
      "b3b2"
    ],
    "hint": "Approche ta dame du roi adverse, avec la protection de ton roi.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "mate": true,
    "variantOf": "queen-mate",
    "side": "b"
  },
  {
    "id": "scholar-mirror",
    "title": "La case fragile c7 · autre aile",
    "theme": "Mat en 1",
    "level": 2,
    "solution": [
      "a5c7"
    ],
    "hint": "Ton fou et ta dame visent tous les deux c7.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "mate": true,
    "variantOf": "scholar",
    "fen": "r1bkqb1r/ppp1pppp/2n2n2/Q2p4/3P1B2/8/PPP1PPPP/RN1K1BNR w - - 0 1",
    "side": "w"
  },
  {
    "id": "scholar-colors",
    "title": "La case fragile f2 · autre camp",
    "theme": "Mat en 1",
    "level": 2,
    "solution": [
      "h4f2"
    ],
    "hint": "Ton fou et ta dame visent tous les deux f2.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "mate": true,
    "variantOf": "scholar",
    "fen": "rnb1k1nr/pppp1ppp/8/2b1p3/4P2q/2N2N2/PPPP1PPP/R1BQKB1R b - - 0 1",
    "side": "b"
  },
  {
    "id": "scholar-both",
    "title": "La case fragile c2 · autre perspective",
    "theme": "Mat en 1",
    "level": 2,
    "solution": [
      "a4c2"
    ],
    "hint": "Ton fou et ta dame visent tous les deux c2.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "mate": true,
    "variantOf": "scholar",
    "fen": "rn1k1bnr/ppp1pppp/8/3p1b2/q2P4/2N2N2/PPP1PPPP/R1BKQB1R b - - 0 1",
    "side": "b"
  },
  {
    "id": "fork-mirror",
    "title": "Le roi et la dame · autre aile",
    "theme": "Fourchette",
    "level": 2,
    "fen": "8/k3q3/8/4N3/8/8/8/1K6 w - - 0 1",
    "solution": [
      "e5c6"
    ],
    "hint": "Cherche un échec de cavalier qui attaque aussi e7.",
    "why": "Même motif, nouvelle disposition. Une pièce attaque deux cibles ; après la réponse au roi, encaisse le gain.",
    "variantOf": "fork",
    "side": "w"
  },
  {
    "id": "fork-colors",
    "title": "Le roi et la dame · autre camp",
    "theme": "Fourchette",
    "level": 2,
    "fen": "6k1/8/8/8/3n4/8/3Q3K/8 b - - 0 1",
    "solution": [
      "d4f3"
    ],
    "hint": "Cherche un échec de cavalier qui attaque aussi d2.",
    "why": "Même motif, nouvelle disposition. Une pièce attaque deux cibles ; après la réponse au roi, encaisse le gain.",
    "variantOf": "fork",
    "side": "b"
  },
  {
    "id": "fork-both",
    "title": "Le roi et la dame · autre perspective",
    "theme": "Fourchette",
    "level": 2,
    "fen": "1k6/8/8/8/4n3/8/K3Q3/8 b - - 0 1",
    "solution": [
      "e4c3"
    ],
    "hint": "Cherche un échec de cavalier qui attaque aussi e2.",
    "why": "Même motif, nouvelle disposition. Une pièce attaque deux cibles ; après la réponse au roi, encaisse le gain.",
    "variantOf": "fork",
    "side": "b"
  },
  {
    "id": "pawn-fork-mirror",
    "title": "Petit pion, grande menace · autre aile",
    "theme": "Fourchette",
    "level": 2,
    "fen": "k7/8/3r1r2/8/4P3/8/8/1K6 w - - 0 1",
    "solution": [
      "e4e5"
    ],
    "hint": "Avance le pion pour attaquer deux tours à la fois.",
    "why": "Même motif, nouvelle disposition. Une pièce attaque deux cibles ; après la réponse au roi, encaisse le gain.",
    "variantOf": "pawn-fork",
    "side": "w"
  },
  {
    "id": "pawn-fork-colors",
    "title": "Petit pion, grande menace · autre camp",
    "theme": "Fourchette",
    "level": 2,
    "fen": "6k1/8/8/3p4/8/2R1R3/8/7K b - - 0 1",
    "solution": [
      "d5d4"
    ],
    "hint": "Avance le pion pour attaquer deux tours à la fois.",
    "why": "Même motif, nouvelle disposition. Une pièce attaque deux cibles ; après la réponse au roi, encaisse le gain.",
    "variantOf": "pawn-fork",
    "side": "b"
  },
  {
    "id": "pawn-fork-both",
    "title": "Petit pion, grande menace · autre perspective",
    "theme": "Fourchette",
    "level": 2,
    "fen": "1k6/8/8/4p3/8/3R1R2/8/K7 b - - 0 1",
    "solution": [
      "e5e4"
    ],
    "hint": "Avance le pion pour attaquer deux tours à la fois.",
    "why": "Même motif, nouvelle disposition. Une pièce attaque deux cibles ; après la réponse au roi, encaisse le gain.",
    "variantOf": "pawn-fork",
    "side": "b"
  },
  {
    "id": "promotion-mirror",
    "title": "Atteins la dernière rangée · autre aile",
    "theme": "Promotion",
    "level": 1,
    "fen": "8/k2P4/8/8/8/8/8/7K w - - 0 1",
    "solution": [
      "d7d8q"
    ],
    "hint": "Avance le pion et choisis la pièce la plus puissante.",
    "why": "Même motif, nouvelle disposition. d8=D transforme le pion en dame. Ici, cette promotion ne provoque pas de pat.",
    "variantOf": "promotion",
    "side": "w"
  },
  {
    "id": "promotion-colors",
    "title": "Atteins la dernière rangée · autre camp",
    "theme": "Promotion",
    "level": 1,
    "fen": "k7/8/8/8/8/8/4p2K/8 b - - 0 1",
    "solution": [
      "e2e1q"
    ],
    "hint": "Avance le pion et choisis la pièce la plus puissante.",
    "why": "Même motif, nouvelle disposition. e1=D transforme le pion en dame. Ici, cette promotion ne provoque pas de pat.",
    "variantOf": "promotion",
    "side": "b"
  },
  {
    "id": "promotion-both",
    "title": "Atteins la dernière rangée · autre perspective",
    "theme": "Promotion",
    "level": 1,
    "fen": "7k/8/8/8/8/8/K2p4/8 b - - 0 1",
    "solution": [
      "d2d1q"
    ],
    "hint": "Avance le pion et choisis la pièce la plus puissante.",
    "why": "Même motif, nouvelle disposition. d1=D transforme le pion en dame. Ici, cette promotion ne provoque pas de pat.",
    "variantOf": "promotion",
    "side": "b"
  },
  {
    "id": "remove-mirror",
    "title": "Échec sur la colonne · autre aile",
    "theme": "Défense",
    "level": 2,
    "fen": "k2r4/8/8/6B1/8/8/8/3K4 w - - 0 1",
    "solution": [
      "g5d8"
    ],
    "hint": "Ton roi est attaqué. Ton fou peut-il prendre la tour ?",
    "why": "Même motif, nouvelle disposition. Fxd8 élimine la tour qui donnait échec. Cherche les captures de l’attaquant avant de déplacer ton roi.",
    "variantOf": "remove",
    "side": "w"
  },
  {
    "id": "remove-colors",
    "title": "Échec sur la colonne · autre camp",
    "theme": "Défense",
    "level": 2,
    "fen": "4k3/8/8/8/1b6/8/8/4R2K b - - 0 1",
    "solution": [
      "b4e1"
    ],
    "hint": "Ton roi est attaqué. Ton fou peut-il prendre la tour ?",
    "why": "Même motif, nouvelle disposition. Fxe1 élimine la tour qui donnait échec. Cherche les captures de l’attaquant avant de déplacer ton roi.",
    "variantOf": "remove",
    "side": "b"
  },
  {
    "id": "remove-both",
    "title": "Échec sur la colonne · autre perspective",
    "theme": "Défense",
    "level": 2,
    "fen": "3k4/8/8/8/6b1/8/8/K2R4 b - - 0 1",
    "solution": [
      "g4d1"
    ],
    "hint": "Ton roi est attaqué. Ton fou peut-il prendre la tour ?",
    "why": "Même motif, nouvelle disposition. Fxd1 élimine la tour qui donnait échec. Cherche les captures de l’attaquant avant de déplacer ton roi.",
    "variantOf": "remove",
    "side": "b"
  },
  {
    "id": "ladder-mirror",
    "title": "Deux tours en escalier · autre aile",
    "theme": "Mat en 1",
    "level": 2,
    "fen": "k7/6R1/8/7R/8/8/8/7K w - - 0 1",
    "solution": [
      "h5h8"
    ],
    "hint": "La tour g7 ferme la septième rangée. L’autre doit fermer la huitième.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "mate": true,
    "variantOf": "ladder",
    "side": "w"
  },
  {
    "id": "ladder-colors",
    "title": "Deux tours en escalier · autre camp",
    "theme": "Mat en 1",
    "level": 2,
    "fen": "k7/8/8/8/r7/8/1r6/7K b - - 0 1",
    "solution": [
      "a4a1"
    ],
    "hint": "La tour b2 ferme la deuxième rangée. L’autre doit fermer la huitième.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "mate": true,
    "variantOf": "ladder",
    "side": "b"
  },
  {
    "id": "ladder-both",
    "title": "Deux tours en escalier · autre perspective",
    "theme": "Mat en 1",
    "level": 2,
    "fen": "7k/8/8/8/7r/8/6r1/K7 b - - 0 1",
    "solution": [
      "h4h1"
    ],
    "hint": "La tour g2 ferme la deuxième rangée. L’autre doit fermer la huitième.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "mate": true,
    "variantOf": "ladder",
    "side": "b"
  },
  {
    "id": "skewer-mirror",
    "title": "Le roi cache une dame · autre aile",
    "theme": "Enfilade",
    "level": 2,
    "fen": "3q4/3k4/8/8/8/8/8/1K5R w - - 0 1",
    "solution": [
      "h1d1"
    ],
    "line": [
      "h1d1",
      "d7e6",
      "d1d8"
    ],
    "hints": [
      "Aligne ta tour avec le roi et la dame.",
      "Le roi a quitté la colonne d."
    ],
    "why": "Même motif, nouvelle disposition. L’échec fait bouger le roi et découvre la pièce située derrière.",
    "objective": "Donne échec sur la colonne de la dame, puis capture-la.",
    "variantOf": "skewer",
    "side": "w"
  },
  {
    "id": "skewer-colors",
    "title": "Le roi cache une dame · autre camp",
    "theme": "Enfilade",
    "level": 2,
    "fen": "r5k1/8/8/8/8/8/4K3/4Q3 b - - 0 1",
    "solution": [
      "a8e8"
    ],
    "line": [
      "a8e8",
      "e2d3",
      "e8e1"
    ],
    "hints": [
      "Aligne ta tour avec le roi et la dame.",
      "Le roi a quitté la colonne e."
    ],
    "why": "Même motif, nouvelle disposition. L’échec fait bouger le roi et découvre la pièce située derrière.",
    "objective": "Donne échec sur la colonne de la dame, puis capture-la.",
    "variantOf": "skewer",
    "side": "b"
  },
  {
    "id": "skewer-both",
    "title": "Le roi cache une dame · autre perspective",
    "theme": "Enfilade",
    "level": 2,
    "fen": "1k5r/8/8/8/8/8/3K4/3Q4 b - - 0 1",
    "solution": [
      "h8d8"
    ],
    "line": [
      "h8d8",
      "d2e3",
      "d8d1"
    ],
    "hints": [
      "Aligne ta tour avec le roi et la dame.",
      "Le roi a quitté la colonne d."
    ],
    "why": "Même motif, nouvelle disposition. L’échec fait bouger le roi et découvre la pièce située derrière.",
    "objective": "Donne échec sur la colonne de la dame, puis capture-la.",
    "variantOf": "skewer",
    "side": "b"
  },
  {
    "id": "exchange-chain-mirror",
    "title": "Compte les reprises · autre aile",
    "theme": "Calcul en 2 coups",
    "level": 2,
    "fen": "k3q3/4r3/8/6B1/8/8/8/1K2R3 w - - 0 1",
    "solution": [
      "g5e7"
    ],
    "line": [
      "g5e7",
      "e8e7",
      "e1e7"
    ],
    "hints": [
      "Le fou peut prendre la tour. Que se passe-t-il si la dame reprend ?",
      "La dame vient sur la colonne de ta tour."
    ],
    "why": "Même motif, nouvelle disposition. Fxe7 gagne d’abord une tour. Dans la réponse illustrée …Dxe7, Txe7 gagne ensuite la dame. La reprise noire est une erreur : l’adversaire peut choisir une autre défense.",
    "objective": "Prends la tour avec le fou, puis exploite la reprise proposée.",
    "variantOf": "exchange-chain",
    "side": "w"
  },
  {
    "id": "exchange-chain-colors",
    "title": "Compte les reprises · autre camp",
    "theme": "Calcul en 2 coups",
    "level": 2,
    "fen": "3r2k1/8/8/8/1b6/8/3R4/3Q3K b - - 0 1",
    "solution": [
      "b4d2"
    ],
    "line": [
      "b4d2",
      "d1d2",
      "d8d2"
    ],
    "hints": [
      "Le fou peut prendre la tour. Que se passe-t-il si la dame reprend ?",
      "La dame vient sur la colonne de ta tour."
    ],
    "why": "Même motif, nouvelle disposition. Fxd2 gagne d’abord une tour. Dans la réponse illustrée …Dxd2, Txd2 gagne ensuite la dame. La reprise blanche est une erreur : l’adversaire peut choisir une autre défense.",
    "objective": "Prends la tour avec le fou, puis exploite la reprise proposée.",
    "variantOf": "exchange-chain",
    "side": "b"
  },
  {
    "id": "exchange-chain-both",
    "title": "Compte les reprises · autre perspective",
    "theme": "Calcul en 2 coups",
    "level": 2,
    "fen": "1k2r3/8/8/8/6b1/8/4R3/K3Q3 b - - 0 1",
    "solution": [
      "g4e2"
    ],
    "line": [
      "g4e2",
      "e1e2",
      "e8e2"
    ],
    "hints": [
      "Le fou peut prendre la tour. Que se passe-t-il si la dame reprend ?",
      "La dame vient sur la colonne de ta tour."
    ],
    "why": "Même motif, nouvelle disposition. Fxe2 gagne d’abord une tour. Dans la réponse illustrée …Dxe2, Txe2 gagne ensuite la dame. La reprise blanche est une erreur : l’adversaire peut choisir une autre défense.",
    "objective": "Prends la tour avec le fou, puis exploite la reprise proposée.",
    "variantOf": "exchange-chain",
    "side": "b"
  },
  {
    "id": "ladder-two-mirror",
    "title": "Construis le mat en escalier · autre aile",
    "theme": "Mat en 2",
    "level": 3,
    "fen": "k7/8/6R1/7R/8/8/8/7K w - - 0 1",
    "solution": [
      "g6g7"
    ],
    "line": [
      "g6g7",
      "a8b8",
      "h5h8"
    ],
    "hints": [
      "Coupe la septième rangée avec la tour g6.",
      "Le roi est sur la huitième rangée. Fais entrer ton autre tour."
    ],
    "why": "Même motif, nouvelle disposition. La première tour ferme les sorties ; la seconde donne mat.",
    "objective": "Ferme une rangée, puis donne mat avec ton autre tour.",
    "mateEnd": true,
    "variantOf": "ladder-two",
    "side": "w"
  },
  {
    "id": "ladder-two-colors",
    "title": "Construis le mat en escalier · autre camp",
    "theme": "Mat en 2",
    "level": 3,
    "fen": "k7/8/8/8/r7/1r6/8/7K b - - 0 1",
    "solution": [
      "b3b2"
    ],
    "line": [
      "b3b2",
      "h1g1",
      "a4a1"
    ],
    "hints": [
      "Coupe la deuxième rangée avec la tour b3.",
      "Le roi est sur la première rangée. Fais entrer ton autre tour."
    ],
    "why": "Même motif, nouvelle disposition. La première tour ferme les sorties ; la seconde donne mat.",
    "objective": "Ferme une rangée, puis donne mat avec ton autre tour.",
    "mateEnd": true,
    "variantOf": "ladder-two",
    "side": "b"
  },
  {
    "id": "ladder-two-both",
    "title": "Construis le mat en escalier · autre perspective",
    "theme": "Mat en 2",
    "level": 3,
    "fen": "7k/8/8/8/7r/6r1/8/K7 b - - 0 1",
    "solution": [
      "g3g2"
    ],
    "line": [
      "g3g2",
      "a1b1",
      "h4h1"
    ],
    "hints": [
      "Coupe la deuxième rangée avec la tour g3.",
      "Le roi est sur la première rangée. Fais entrer ton autre tour."
    ],
    "why": "Même motif, nouvelle disposition. La première tour ferme les sorties ; la seconde donne mat.",
    "objective": "Ferme une rangée, puis donne mat avec ton autre tour.",
    "mateEnd": true,
    "variantOf": "ladder-two",
    "side": "b"
  },
  {
    "id": "safe-capture-mirror",
    "title": "Une prise tentante, une meilleure capture · autre aile",
    "theme": "Captures et reprises",
    "level": 2,
    "fen": "k7/8/3p4/4r3/7q/8/5B2/1K2Q3 w - - 0 1",
    "solution": [
      "f2h4"
    ],
    "objective": "Gagne la dame noire sans offrir la tienne. Compare les deux captures possibles.",
    "hint": "La tour e5 est défendue par le pion d6. Qui défend la dame h4 ?",
    "why": "Même motif, nouvelle disposition. Fxh4 gagne la dame sans reprise possible. Dxe5? permettrait dxe5 : tu échangerais une dame contre une tour.",
    "mistakes": {
      "e1e5": "Après Dxe5?, le pion d6 peut jouer dxe5 : tu perds ta dame pour une tour. Regarde aussi ce que ton fou peut capturer."
    },
    "variantOf": "safe-capture",
    "side": "w"
  },
  {
    "id": "safe-capture-colors",
    "title": "Une prise tentante, une meilleure capture · autre camp",
    "theme": "Captures et reprises",
    "level": 2,
    "fen": "3q2k1/2b5/8/Q7/3R4/4P3/8/7K b - - 0 1",
    "solution": [
      "c7a5"
    ],
    "objective": "Gagne la dame blanche sans offrir la tienne. Compare les deux captures possibles.",
    "hint": "La tour d4 est défendue par le pion e3. Qui défend la dame a5 ?",
    "why": "Même motif, nouvelle disposition. Fxa5 gagne la dame sans reprise possible. Dxd4? permettrait exd4 : tu échangerais une dame contre une tour.",
    "mistakes": {
      "d8d4": "Après Dxd4?, le pion e3 peut jouer exd4 : tu perds ta dame pour une tour. Regarde aussi ce que ton fou peut capturer."
    },
    "variantOf": "safe-capture",
    "side": "b"
  },
  {
    "id": "safe-capture-both",
    "title": "Une prise tentante, une meilleure capture · autre perspective",
    "theme": "Captures et reprises",
    "level": 2,
    "fen": "1k2q3/5b2/8/7Q/4R3/3P4/8/K7 b - - 0 1",
    "solution": [
      "f7h5"
    ],
    "objective": "Gagne la dame blanche sans offrir la tienne. Compare les deux captures possibles.",
    "hint": "La tour e4 est défendue par le pion d3. Qui défend la dame h5 ?",
    "why": "Même motif, nouvelle disposition. Fxh5 gagne la dame sans reprise possible. Dxe4? permettrait dxe4 : tu échangerais une dame contre une tour.",
    "mistakes": {
      "e8e4": "Après Dxe4?, le pion d3 peut jouer dxe4 : tu perds ta dame pour une tour. Regarde aussi ce que ton fou peut capturer."
    },
    "variantOf": "safe-capture",
    "side": "b"
  },
  {
    "id": "pinned-defender-mirror",
    "title": "Un défenseur qui ne peut pas reprendre · autre aile",
    "theme": "Clouage",
    "level": 2,
    "fen": "3k4/3n4/8/4p3/8/8/8/1K1RQ3 w - - 0 1",
    "solution": [
      "e1e5"
    ],
    "objective": "Capture le pion e5 avec la dame. Vérifie pourquoi son défenseur ne peut pas reprendre.",
    "hint": "Le cavalier d7 masque son roi d8 devant la tour d1.",
    "why": "Même motif, nouvelle disposition. Dxe5 gagne le pion : ...Cxe5 serait illégal, car le cavalier découvrirait un échec de la tour d1 sur le roi d8. Ce défenseur est cloué.",
    "variantOf": "pinned-defender",
    "side": "w"
  },
  {
    "id": "pinned-defender-colors",
    "title": "Un défenseur qui ne peut pas reprendre · autre camp",
    "theme": "Clouage",
    "level": 2,
    "fen": "3qr1k1/8/8/8/3P4/8/4N3/4K3 b - - 0 1",
    "solution": [
      "d8d4"
    ],
    "objective": "Capture le pion d4 avec la dame. Vérifie pourquoi son défenseur ne peut pas reprendre.",
    "hint": "Le cavalier e2 masque son roi e1 devant la tour e8.",
    "why": "Même motif, nouvelle disposition. Dxd4 gagne le pion : ...Cxd4 serait illégal, car le cavalier découvrirait un échec de la tour e8 sur le roi e1. Ce défenseur est cloué.",
    "variantOf": "pinned-defender",
    "side": "b"
  },
  {
    "id": "pinned-defender-both",
    "title": "Un défenseur qui ne peut pas reprendre · autre perspective",
    "theme": "Clouage",
    "level": 2,
    "fen": "1k1rq3/8/8/8/4P3/8/3N4/3K4 b - - 0 1",
    "solution": [
      "e8e4"
    ],
    "objective": "Capture le pion e4 avec la dame. Vérifie pourquoi son défenseur ne peut pas reprendre.",
    "hint": "Le cavalier d2 masque son roi d1 devant la tour d8.",
    "why": "Même motif, nouvelle disposition. Dxe4 gagne le pion : ...Cxe4 serait illégal, car le cavalier découvrirait un échec de la tour d8 sur le roi d1. Ce défenseur est cloué.",
    "variantOf": "pinned-defender",
    "side": "b"
  },
  {
    "id": "fork-transfer-mirror",
    "title": "Reconnais la fourchette ailleurs · autre aile",
    "theme": "Fourchette",
    "level": 2,
    "fen": "8/2q3k1/8/2N5/8/8/8/1K6 w - - 0 1",
    "solution": [
      "c5e6"
    ],
    "line": [
      "c5e6",
      "g7g6",
      "e6c7"
    ],
    "hints": [
      "Cherche une case où le cavalier attaque à la fois g7 et c7.",
      "Le roi a répondu à l’échec. Prends maintenant la dame."
    ],
    "objective": "Joue une fourchette avec échec, puis gagne la dame dans la réponse illustrée.",
    "why": "Même motif, nouvelle disposition. Une pièce attaque deux cibles ; après la réponse au roi, encaisse le gain.",
    "variantOf": "fork-transfer",
    "side": "w"
  },
  {
    "id": "fork-transfer-colors",
    "title": "Reconnais la fourchette ailleurs · autre camp",
    "theme": "Fourchette",
    "level": 2,
    "fen": "6k1/8/8/8/5n2/8/1K3Q2/8 b - - 0 1",
    "solution": [
      "f4d3"
    ],
    "line": [
      "f4d3",
      "b2b3",
      "d3f2"
    ],
    "hints": [
      "Cherche une case où le cavalier attaque à la fois b2 et f2.",
      "Le roi a répondu à l’échec. Prends maintenant la dame."
    ],
    "objective": "Joue une fourchette avec échec, puis gagne la dame dans la réponse illustrée.",
    "why": "Même motif, nouvelle disposition. Une pièce attaque deux cibles ; après la réponse au roi, encaisse le gain.",
    "variantOf": "fork-transfer",
    "side": "b"
  },
  {
    "id": "fork-transfer-both",
    "title": "Reconnais la fourchette ailleurs · autre perspective",
    "theme": "Fourchette",
    "level": 2,
    "fen": "1k6/8/8/8/2n5/8/2Q3K1/8 b - - 0 1",
    "solution": [
      "c4e3"
    ],
    "line": [
      "c4e3",
      "g2g3",
      "e3c2"
    ],
    "hints": [
      "Cherche une case où le cavalier attaque à la fois g2 et c2.",
      "Le roi a répondu à l’échec. Prends maintenant la dame."
    ],
    "objective": "Joue une fourchette avec échec, puis gagne la dame dans la réponse illustrée.",
    "why": "Même motif, nouvelle disposition. Une pièce attaque deux cibles ; après la réponse au roi, encaisse le gain.",
    "variantOf": "fork-transfer",
    "side": "b"
  },
  {
    "id": "backrank-transfer-mirror",
    "title": "Même mat, autre colonne · autre aile",
    "theme": "Mat en 1",
    "level": 2,
    "fen": "1k6/ppp5/8/8/8/8/PPP5/1K5R w - - 0 1",
    "solution": [
      "h1h8"
    ],
    "mate": true,
    "hint": "Les pions c7, b7 et a7 enferment leur propre roi.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "variantOf": "backrank-transfer",
    "side": "w"
  },
  {
    "id": "backrank-transfer-colors",
    "title": "Même mat, autre colonne · autre camp",
    "theme": "Mat en 1",
    "level": 2,
    "fen": "r5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1",
    "solution": [
      "a8a1"
    ],
    "mate": true,
    "hint": "Les pions f2, g2 et h2 enferment leur propre roi.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "variantOf": "backrank-transfer",
    "side": "b"
  },
  {
    "id": "backrank-transfer-both",
    "title": "Même mat, autre colonne · autre perspective",
    "theme": "Mat en 1",
    "level": 2,
    "fen": "1k5r/ppp5/8/8/8/8/PPP5/1K6 b - - 0 1",
    "solution": [
      "h8h1"
    ],
    "mate": true,
    "hint": "Les pions c2, b2 et a2 enferment leur propre roi.",
    "why": "Même motif, nouvelle disposition. Le roi est attaqué et aucune défense légale ne reste.",
    "variantOf": "backrank-transfer",
    "side": "b"
  },
  {
    "id": "avoid-stalemate-colors",
    "title": "Une dame ferait pat ! · autre camp",
    "theme": "Finales",
    "level": 2,
    "fen": "8/8/8/8/8/2k5/K1p5/8 b - - 0 1",
    "solution": [
      "c2c1r"
    ],
    "objective": "Fais une promotion en tour pour conserver une finale gagnante sans provoquer le pat.",
    "hint": "Compare les cases a3 et a1 après une promotion en dame, puis en tour.",
    "why": "Même motif, nouvelle disposition. c1=T laisse la case a3 au roi blanc. c1=D? serait pat : le roi blanc ne serait pas en échec, mais n’aurait aucun coup légal. Roi et tour peuvent ensuite mater avec une bonne technique.",
    "mistakes": {
      "c2c1q": "Ta dame n’attaque pas le roi a2, mais elle ferme a1 et a3. Ton roi ferme b3 et b2 : aucun coup légal, donc pat. Essaie une promotion en tour."
    },
    "variantOf": "avoid-stalemate",
    "side": "b"
  },
  {
    "id": "avoid-stalemate-both",
    "title": "Une dame ferait pat ! · autre perspective",
    "theme": "Finales",
    "level": 2,
    "fen": "8/8/8/8/8/5k2/5p1K/8 b - - 0 1",
    "solution": [
      "f2f1r"
    ],
    "objective": "Fais une promotion en tour pour conserver une finale gagnante sans provoquer le pat.",
    "hint": "Compare les cases h3 et h1 après une promotion en dame, puis en tour.",
    "why": "Même motif, nouvelle disposition. f1=T laisse la case h3 au roi blanc. f1=D? serait pat : le roi blanc ne serait pas en échec, mais n’aurait aucun coup légal. Roi et tour peuvent ensuite mater avec une bonne technique.",
    "mistakes": {
      "f2f1q": "Ta dame n’attaque pas le roi h2, mais elle ferme h1 et h3. Ton roi ferme g3 et g2 : aucun coup légal, donc pat. Essaie une promotion en tour."
    },
    "variantOf": "avoid-stalemate",
    "side": "b"
  },
  {
    "id": "defend-f7-mirror",
    "title": "Défends-toi contre le mat du berger · autre aile",
    "theme": "Défense",
    "level": 2,
    "side": "b",
    "solution": [
      "b7b6"
    ],
    "objective": "Tu joues les noirs. Coupe la diagonale a5-c7 en attaquant la dame avec ton pion b.",
    "hint": "...b6 interrompt l’attaque de la dame sur c7.",
    "why": "Même motif, nouvelle disposition. ...b6 pare Dxc7 mat et attaque la dame. Le pion d5 reste défendu par Cf6. Il existe d’autres défenses ; nous travaillons ici ce plan précis.",
    "mistakes": {
      "b8c6": "...Cc6 attaque la dame, mais n’empêche pas Dxc7 mat. Il faut répondre à la menace sur c7 avant de gagner un temps."
    },
    "variantOf": "defend-f7",
    "fen": "rnbkqb1r/ppp1pppp/5n2/Q2p4/3P1B2/8/PPP1PPPP/RN1K1BNR b - - 0 1"
  },
  {
    "id": "defend-f7-colors",
    "title": "Défends-toi contre le mat du berger · autre camp",
    "theme": "Défense",
    "level": 2,
    "side": "w",
    "solution": [
      "g2g3"
    ],
    "objective": "Tu joues les blancs. Coupe la diagonale h4-f2 en attaquant la dame avec ton pion g.",
    "hint": "...g3 interrompt l’attaque de la dame sur f2.",
    "why": "Même motif, nouvelle disposition. ...g3 pare Dxf2 mat et attaque la dame. Le pion e4 reste défendu par Cc3. Il existe d’autres défenses ; nous travaillons ici ce plan précis.",
    "mistakes": {
      "g1f3": "...Cf3 attaque la dame, mais n’empêche pas Dxf2 mat. Il faut répondre à la menace sur f2 avant de gagner un temps."
    },
    "variantOf": "defend-f7",
    "fen": "rnb1k1nr/pppp1ppp/8/2b1p3/4P2q/2N5/PPPP1PPP/R1BQKBNR w - - 0 1"
  },
  {
    "id": "defend-f7-both",
    "title": "Défends-toi contre le mat du berger · autre perspective",
    "theme": "Défense",
    "level": 2,
    "side": "w",
    "solution": [
      "b2b3"
    ],
    "objective": "Tu joues les blancs. Coupe la diagonale a4-c2 en attaquant la dame avec ton pion b.",
    "hint": "...b3 interrompt l’attaque de la dame sur c2.",
    "why": "Même motif, nouvelle disposition. ...b3 pare Dxc2 mat et attaque la dame. Le pion d4 reste défendu par Cf3. Il existe d’autres défenses ; nous travaillons ici ce plan précis.",
    "mistakes": {
      "b1c3": "...Cc3 attaque la dame, mais n’empêche pas Dxc2 mat. Il faut répondre à la menace sur c2 avant de gagner un temps."
    },
    "variantOf": "defend-f7",
    "fen": "rn1k1bnr/ppp1pppp/8/3p1b2/q2P4/5N2/PPP1PPPP/RNBKQB1R w - - 0 1"
  },
  {
    "id": "open-file-mirror",
    "title": "Active ta tour · autre aile",
    "theme": "Activité des pièces",
    "level": 2,
    "fen": "1k5r/ppp3pp/5n2/8/8/5N2/PPP3PP/1K5R w - - 0 1",
    "solution": [
      "h1d1"
    ],
    "objective": "Place ta tour sur la colonne d, ouverte, pour augmenter son activité.",
    "hint": "La tour h1 peut traverser la première rangée jusqu’à d1.",
    "why": "Même motif, nouvelle disposition. Td1 utilise une colonne sans pion. La tour devient plus active qu’en h1, derrière son pion h2. C’est un exercice de plan ; d’autres coups peuvent aussi être jouables.",
    "variantOf": "open-file",
    "side": "w"
  },
  {
    "id": "open-file-colors",
    "title": "Active ta tour · autre camp",
    "theme": "Activité des pièces",
    "level": 2,
    "fen": "r5k1/pp3ppp/2n5/8/8/2N5/PP3PPP/R5K1 b - - 0 1",
    "solution": [
      "a8e8"
    ],
    "objective": "Place ta tour sur la colonne e, ouverte, pour augmenter son activité.",
    "hint": "La tour a8 peut traverser la huitième rangée jusqu’à e8.",
    "why": "Même motif, nouvelle disposition. Te8 utilise une colonne sans pion. La tour devient plus active qu’en a8, derrière son pion a7. C’est un exercice de plan ; d’autres coups peuvent aussi être jouables.",
    "variantOf": "open-file",
    "side": "b"
  },
  {
    "id": "open-file-both",
    "title": "Active ta tour · autre perspective",
    "theme": "Activité des pièces",
    "level": 2,
    "fen": "1k5r/ppp3pp/5n2/8/8/5N2/PPP3PP/1K5R b - - 0 1",
    "solution": [
      "h8d8"
    ],
    "objective": "Place ta tour sur la colonne d, ouverte, pour augmenter son activité.",
    "hint": "La tour h8 peut traverser la huitième rangée jusqu’à d8.",
    "why": "Même motif, nouvelle disposition. Td8 utilise une colonne sans pion. La tour devient plus active qu’en h8, derrière son pion h7. C’est un exercice de plan ; d’autres coups peuvent aussi être jouables.",
    "variantOf": "open-file",
    "side": "b"
  },
  {
    "id": "capture-new-mirror",
    "title": "Compare les reprises · autre aile",
    "theme": "Captures et reprises",
    "level": 2,
    "fen": "k7/8/5p2/4r3/1q6/8/3B4/4Q1K1 w - - 0 1",
    "solution": [
      "d2b4"
    ],
    "objective": "Trouve la capture qui gagne le plus de matériel sans reprise.",
    "hint": "Compare ce que peuvent prendre ta dame et ton fou. La tour e5 est défendue par f6.",
    "why": "Même motif, nouvelle disposition. Fxb4 gagne la dame. Dxe5? aurait permis fxe5 : ta dame serait échangée contre une tour.",
    "variantOf": "capture-new",
    "side": "w"
  },
  {
    "id": "capture-new-colors",
    "title": "Compare les reprises · autre camp",
    "theme": "Captures et reprises",
    "level": 2,
    "fen": "1k1q4/4b3/8/6Q1/3R4/2P5/8/7K b - - 0 1",
    "solution": [
      "e7g5"
    ],
    "objective": "Trouve la capture qui gagne le plus de matériel sans reprise.",
    "hint": "Compare ce que peuvent prendre ta dame et ton fou. La tour d4 est défendue par c3.",
    "why": "Même motif, nouvelle disposition. Fxg5 gagne la dame. Dxd4? aurait permis cxd4 : ta dame serait échangée contre une tour.",
    "variantOf": "capture-new",
    "side": "b"
  },
  {
    "id": "capture-new-both",
    "title": "Compare les reprises · autre perspective",
    "theme": "Captures et reprises",
    "level": 2,
    "fen": "4q1k1/3b4/8/1Q6/4R3/5P2/8/K7 b - - 0 1",
    "solution": [
      "d7b5"
    ],
    "objective": "Trouve la capture qui gagne le plus de matériel sans reprise.",
    "hint": "Compare ce que peuvent prendre ta dame et ton fou. La tour e4 est défendue par f3.",
    "why": "Même motif, nouvelle disposition. Fxb5 gagne la dame. Dxe4? aurait permis fxe4 : ta dame serait échangée contre une tour.",
    "variantOf": "capture-new",
    "side": "b"
  },
  {
    "id": "pin-new-mirror",
    "title": "Un clouage horizontal · autre aile",
    "theme": "Clouage",
    "level": 2,
    "fen": "R3n2k/2p5/8/B7/8/8/8/1K6 w - - 0 1",
    "solution": [
      "a5c7"
    ],
    "objective": "Gagne le pion avec ton fou en exploitant le clouage du cavalier.",
    "hint": "Le cavalier e8 protège c7, mais il masque son roi devant la tour a8.",
    "why": "Même motif, nouvelle disposition. Fxc7 gagne le pion. Le cavalier e8 ne peut pas reprendre : il exposerait le roi h8 à la tour a8.",
    "variantOf": "pin-new",
    "side": "w"
  },
  {
    "id": "pin-new-colors",
    "title": "Un clouage horizontal · autre camp",
    "theme": "Clouage",
    "level": 2,
    "fen": "6k1/8/8/8/7b/8/5P2/K2N3r b - - 0 1",
    "solution": [
      "h4f2"
    ],
    "objective": "Gagne le pion avec ton fou en exploitant le clouage du cavalier.",
    "hint": "Le cavalier d1 protège f2, mais il masque son roi devant la tour h1.",
    "why": "Même motif, nouvelle disposition. Fxf2 gagne le pion. Le cavalier d1 ne peut pas reprendre : il exposerait le roi a1 à la tour h1.",
    "variantOf": "pin-new",
    "side": "b"
  },
  {
    "id": "pin-new-both",
    "title": "Un clouage horizontal · autre perspective",
    "theme": "Clouage",
    "level": 2,
    "fen": "1k6/8/8/8/b7/8/2P5/r3N2K b - - 0 1",
    "solution": [
      "a4c2"
    ],
    "objective": "Gagne le pion avec ton fou en exploitant le clouage du cavalier.",
    "hint": "Le cavalier e1 protège c2, mais il masque son roi devant la tour a1.",
    "why": "Même motif, nouvelle disposition. Fxc2 gagne le pion. Le cavalier e1 ne peut pas reprendre : il exposerait le roi h1 à la tour a1.",
    "variantOf": "pin-new",
    "side": "b"
  },
  {
    "id": "defense-new-mirror",
    "title": "La menace arrive par une colonne · autre aile",
    "theme": "Défense",
    "side": "b",
    "level": 2,
    "solution": [
      "b8c6"
    ],
    "objective": "Les blancs menacent Dxc7 mat. Développe un cavalier en coupant la colonne c.",
    "hint": "Le cavalier b8 peut venir en c6, entre la dame et c7.",
    "why": "Même motif, nouvelle disposition. ...Cc6 interrompt l’attaque de la dame sur c7. Il développe une pièce tout en répondant à la menace. La partie continue.",
    "variantOf": "defense-new",
    "fen": "rnbkqb1r/ppp1pppp/5n2/3p4/3P1B2/2Q5/PPP1PPPP/RN1K1BNR b - - 0 1"
  },
  {
    "id": "defense-new-colors",
    "title": "La menace arrive par une colonne · autre camp",
    "theme": "Défense",
    "side": "w",
    "level": 2,
    "solution": [
      "g1f3"
    ],
    "objective": "Les noirs menacent Dxf2 mat. Développe un cavalier en coupant la colonne f.",
    "hint": "Le cavalier g1 peut venir en f3, entre la dame et f2.",
    "why": "Même motif, nouvelle disposition. ...Cf3 interrompt l’attaque de la dame sur f2. Il développe une pièce tout en répondant à la menace. La partie continue.",
    "variantOf": "defense-new",
    "fen": "rnb1k1nr/pppp1ppp/5q2/2b1p3/4P3/2N5/PPPP1PPP/R1BQKBNR w - - 0 1"
  },
  {
    "id": "defense-new-both",
    "title": "La menace arrive par une colonne · autre perspective",
    "theme": "Défense",
    "side": "w",
    "level": 2,
    "solution": [
      "b1c3"
    ],
    "objective": "Les noirs menacent Dxc2 mat. Développe un cavalier en coupant la colonne c.",
    "hint": "Le cavalier b1 peut venir en c3, entre la dame et c2.",
    "why": "Même motif, nouvelle disposition. ...Cc3 interrompt l’attaque de la dame sur c2. Il développe une pièce tout en répondant à la menace. La partie continue.",
    "variantOf": "defense-new",
    "fen": "rn1k1bnr/ppp1pppp/2q5/3p1b2/3P4/5N2/PPP1PPPP/RNBKQB1R w - - 0 1"
  }
];
