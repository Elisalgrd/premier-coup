# CURRICULUM V2 : les 20 fiches prioritaires, réécrites

> À placer à la racine du repo. Va avec `BRIEF_TON.md` et `curriculum-v2.json`.
> `curriculum-v2.json` est la **source de vérité** (données prêtes à intégrer). Ce fichier en est la version lisible.
> Toutes les positions ont été vérifiées : FEN légal, le camp qui ne joue pas n'est pas en échec, chaque coup des démonstrations est légal, les mats et pats annoncés sont confirmés, et les réponses acceptées des exercices ont été calculées avec Stockfish 18 (profondeur 16, 10 variantes).

## 1. Ce que Codex doit faire

### 1.1 Intégrer les 20 fiches

1. Ajouter la nouvelle fiche `vis-start` (« Avant de commencer ») en toute première position du catalogue, prérequis de `vis-rules`. Elle s'ouvre automatiquement au premier lancement et reste accessible dans Réglages > « Revoir le tutoriel ».
2. Pour les 19 autres ids, **remplacer** dans `curriculum/entries/<id>.json` les champs `entryChallenge`, `screens`, `guided`, `examples`, `pitfall` par le contenu de `curriculum-v2.json`. Garder les champs `tier`, `priority`, `prerequisites`, `lichessThemes`, `ratingBand`, `mastery`, `sources`, `videoId`.
3. Ajouter à chaque fiche les champs `introduces` (termes du glossaire introduits, voir `BRIEF_TON.md` §5) et `retenir` (phrase finale, devient le recto de la carte de révision).

### 1.2 Nouveau format d'une fiche (schéma)

```json
{
  "id": "tac-fork",
  "title": "La fourchette",
  "introduces": ["fourchette"],
  "challenge": { "kind": "move", "fen": "...", "prompt": "...", "solution": ["e4d6","e8d7","d6b5"], "check": "engine", "accept": ["e4d6"], "alsoGood": [], "hint": "..." },
  "screens": [
    { "step": "principe", "title": "...", "text": "...", "fen": "...", "arrows": [["d6","e8"]], "marks": ["e8"],
      "line": [ { "uci": "e4d6", "text": "commentaire du coup" } ] }
  ],
  "exercises": [ { "kind": "move|square", "fen": "...", "prompt": "...", "solution": [...], "accept": [...], "alsoGood": [...], "success": "...", "hint": "..." } ],
  "retenir": "..."
}
```

### 1.3 Changements du lecteur de fiche (`src/learn/lesson-player.js`)

1. **Chaque écran affiche sa propre position** (`fen`), avec ses flèches (`arrows`) et ses cases colorées (`marks`). Fini l'échiquier figé sur la position du défi.
2. **Démonstrations commentées** : si un écran a une `line`, afficher un bouton « Voir la démonstration ». Chaque coup s'anime (500 ms) et son `text` s'affiche sous l'échiquier. Contrôles : coup précédent, coup suivant, rejouer. Le texte de l'écran reste visible au-dessus.
3. **Ordre** : défi d'entrée (`challenge`) → écrans dans l'ordre du tableau → exercices un par un → pratique Lichess (inchangée) → carte « À retenir » (`retenir`). Les étapes absentes sont sautées : supprimer les textes de secours codés en dur dans `pages()`.
4. **Barre de progression** : nombre réel d'étapes de la fiche, pas « 10 » fixe.
5. **Le titre de l'écran** (`title`) s'affiche en titre. Le `step` sert seulement à la petite étiquette (Principe, Pourquoi, Quand y penser, Méthode, Exemple, Piège, À retenir).
6. **Qui joue** : afficher au-dessus de l'échiquier « Tu joues les blancs » / « Tu joues les noirs » et « C'est à toi » / « C'est aux noirs de jouer », déduit du FEN. Jamais « Trait aux ».
7. **Flèches sur le défi** : `challenge.arrows` montre le dernier coup adverse (ex. `proc-opponent-threat`).

### 1.4 Logique des exercices

- `kind: "square"` : l'élève touche une case. Bonne réponse si la case est dans `accept`.
- `kind: "move"` : l'élève joue un coup. Bonne réponse si le coup (UCI) est dans `accept`.
- Si le coup est dans `alsoGood` : « Bon coup, mais ce n'est pas l'idée de cette fiche. Essaie encore. » (pas compté comme une erreur).
- Si `solution` contient plusieurs coups : après la bonne réponse, l'app joue le coup adverse `solution[1]`, puis attend `solution[2]`, etc.
- **Mauvaise réponse** : lancer Stockfish (déjà embarqué) à profondeur 10 sur la position après le coup de l'élève, montrer la meilleure réponse adverse avec une flèche rouge et dire concrètement ce qui se passe (ex. « Après ton coup, son pion en e6 prend ta dame. »). Quand l'app ne sait pas décrire, au minimum : « Ce coup ne gagne rien. Regarde la réponse de l'adversaire (flèche rouge). » Puis l'élève réessaie. Après 2 erreurs, proposer l'indice (`hint`), après 3, montrer la solution animée.
- `success` s'affiche après la bonne réponse, avec l'échiquier dans la position finale.

### 1.5 Les 52 autres fiches

Les réécrire au même format, dans le style de `BRIEF_TON.md`, en prenant ces 20 fiches comme modèles. Règles de vérification à reproduire dans `scripts/validate-curriculum.mjs` :

1. FEN légal, et le camp qui ne joue pas n'est pas en échec (chess.js ne le vérifie pas : il faut inverser le trait et tester `inCheck()`).
2. Chaque coup de chaque `line` est légal et a un commentaire.
3. Exercices : Stockfish 18 lite (Node, via `scripts/engine-node.mjs`, mais en enregistrant les écouteurs **avant** d'envoyer `uci`/`isready`/`go`, sinon les réponses synchrones sont perdues), `MultiPV 10`, profondeur 16. Réponses acceptées = coups dont le score est au moins `meilleur - max(60, 15 % du meilleur)` centipions ; pour un mat, tous les coups qui matent. Si l'idée de la fiche impose un coup précis, mettre `check: "list"` avec la liste voulue et vérifier qu'elle est dans les bons coups.
4. Les annonces de mat ou de pat dans le texte sont vérifiées (`isCheckmate()`, `isStalemate()`).
5. 70 mots maximum par texte, aucun mot interdit (voir `BRIEF_TON.md` §7).

## 2. Les fiches

### `vis-start` · Avant de commencer

Mots introduits : échiquier, les blancs, les noirs, c'est aux blancs (aux noirs) de jouer, coup, échec et mat, mat

**Écran 1 · Découverte · L'échiquier**

Voici un échiquier : 64 cases, claires et foncées. Chaque joueur a 16 pièces. Un joueur a les pièces blanches, l'autre les pièces noires. On dit « les blancs » et « les noirs ». Ici, tu joues les blancs : tes pièces sont en bas, celles de ton adversaire en haut.

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)

**Écran 2 · Découverte · Chacun son tour**

On joue chacun son tour, un seul déplacement à la fois. Ce déplacement s'appelle un « coup ». Les blancs jouent toujours le premier coup de la partie. Quand l'app écrit « C'est aux blancs de jouer », ça veut dire que c'est le tour des blancs. Si tu as les blancs, c'est à toi.

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Cases colorées : e2, d2

**Écran 3 · Découverte · Bouger une pièce dans l'app**

Pour jouer, touche une de tes pièces : des points apparaissent sur les cases où elle peut aller. Touche ensuite la case d'arrivée. Tu peux aussi faire glisser la pièce avec le doigt ou la souris.

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Flèches : e2→e4

**Écran 4 · Découverte · Les flèches et les couleurs**

Quand une flèche ou une case colorée apparaît, c'est moi qui te montre quelque chose, comme si je pointais du doigt. Les flèches ne bougent pas les pièces : elles montrent une idée. Ici, la flèche montre un coup possible de ton cavalier.

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Flèches : g1→f3
- Cases colorées : f3

**Écran 5 · Découverte · Le but du jeu**

Le but du jeu, c'est d'attaquer le roi adverse de façon qu'il ne puisse plus s'échapper. On ne prend jamais le roi : la partie s'arrête juste avant. Regarde la démonstration.

- Position : `6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `a1a8` : La tour blanche monte tout en haut et attaque le roi noir. Le roi noir ne peut aller nulle part : ses propres pions lui bloquent le chemin. C'est « échec et mat », ou simplement « mat ». La partie est finie, les blancs ont gagné.

**Exercice 1** (jouer un coup)

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Consigne : C'est à toi, tu joues les blancs. Avance de deux cases le pion qui est devant ton roi (le pion en e2).
- Solution : e2e4
- Réponses acceptées : e2e4
- Si réussi : Parfait, tu sais jouer un coup. Maintenant ce serait aux noirs de jouer.
- Indice : Ton roi est la pièce avec une petite croix, en bas au milieu. Le pion juste devant lui peut avancer de deux cases au premier coup.

**À retenir** : Les blancs commencent. On joue chacun son tour. Le but : mettre le roi adverse échec et mat.

---

### `vis-rules` · Comment bougent les pièces

Mots introduits : prendre, capturer, échec, roque, petit roque, grand roque, promotion, prise en passant, pat, nulle

**Défi d'entrée** (jouer un coup)

- Position : `4k3/8/3p4/8/8/8/8/3RK3 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Tu joues les blancs, c'est à toi. Ta tour (la pièce en forme de petit château, en bas) peut prendre le pion noir. Essaie, ça ne compte pas si tu te trompes.
- Solution : d1d6
- Réponses acceptées : d1d6
- Indice : La tour avance tout droit. Le pion noir est sur la même colonne qu'elle.

**Écran 1 · Principe · La tour**

La tour avance en ligne droite : vers le haut, le bas, la gauche ou la droite, d'autant de cases qu'elle veut. Elle ne peut pas sauter par-dessus une pièce. Prendre une pièce adverse, c'est aller sur sa case : la pièce prise sort du jeu.

- Position : `4k3/8/8/8/3R4/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d4→d8, d4→d1, d4→a4, d4→h4

**Écran 2 · Principe · Le fou**

Le fou avance en diagonale, en biais, d'autant de cases qu'il veut. Un fou qui commence sur une case claire reste sur les cases claires toute la partie. C'est pour ça que chaque joueur a deux fous : un pour les cases claires, un pour les foncées.

- Position : `4k3/8/8/8/3B4/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d4→h8, d4→a1, d4→a7, d4→g1

**Écran 3 · Principe · La dame**

La dame (la pièce avec une couronne) combine la tour et le fou : elle va en ligne droite ET en diagonale, aussi loin qu'elle veut. C'est ta pièce la plus forte. Fais très attention à ne pas la perdre.

- Position : `4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d4→d7, d4→h4, d4→g7, d4→a1, d4→a7, d4→d1

**Écran 4 · Principe · Le cavalier**

Le cavalier (la tête de cheval) se déplace en L : deux cases tout droit, puis une case sur le côté. C'est la seule pièce qui peut sauter par-dessus les autres. Les cases colorées montrent toutes les cases qu'il peut atteindre depuis d4.

- Position : `4k3/8/8/8/3N4/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d4→e6
- Cases colorées : b3, b5, c2, c6, e2, e6, f3, f5

**Écran 5 · Principe · Le roi**

Le roi avance d'une seule case, dans n'importe quelle direction. Il n'a jamais le droit d'aller sur une case attaquée par une pièce adverse. C'est aussi pour ça que les deux rois ne peuvent jamais être collés l'un à l'autre.

- Position : `4k3/8/8/8/3K4/8/8/8 w - - 0 1` (C'est aux blancs de jouer)
- Cases colorées : c3, c4, c5, d3, d5, e3, e4, e5

**Écran 6 · Principe · Le pion**

Le pion avance tout droit d'une case. Depuis sa case de départ, il peut avancer de deux cases d'un coup (le pion en c2). Mais il prend en diagonale, vers l'avant (le pion en e4 peut prendre le pion noir en d5). Il ne recule jamais.

- Position : `4k3/8/8/3p4/4P3/8/2P5/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : c2→c4, e4→d5

**Écran 7 · Principe · L'échec**

Quand une pièce attaque le roi, on dit que le roi est « en échec ». Ici, la tour blanche attaque le roi noir. C'est aux noirs de jouer et ils DOIVENT sauver leur roi tout de suite : c'est obligatoire, ils ne peuvent rien jouer d'autre.

- Position : `4k3/8/8/8/8/8/8/4RK2 b - - 0 1` (C'est aux noirs de jouer)
- Flèches : e1→e8
- Cases colorées : e8

**Écran 8 · Principe · Le mat**

Si le roi est en échec et qu'aucun coup ne peut le sauver, c'est échec et mat. La partie s'arrête. On ne prend jamais vraiment le roi.

- Position : `6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `a1a8` : La tour donne échec sur la dernière rangée. Le roi noir ne peut pas fuir (ses pions bloquent), personne ne peut prendre la tour ni se mettre devant. Échec et mat : les blancs gagnent.

**Écran 9 · Principe · Le roque**

Une fois par partie, tu peux faire un coup spécial qui bouge deux pièces : ton roi et une de tes tours. Ça s'appelle le « roque ». Il sert à mettre ton roi à l'abri. Dans l'app, déplace ton roi de deux cases vers la tour : la tour suit toute seule.

- Position : `4k3/8/8/8/8/8/5PPP/4K2R w K - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `e1g1` : Le roi va de deux cases vers la tour, et la tour saute de l'autre côté du roi. En un seul coup, ton roi est à l'abri dans le coin et ta tour est prête à jouer.

**Écran 10 · Principe · Quand on ne peut pas roquer**

Tu ne peux pas roquer si ton roi ou cette tour ont déjà bougé, s'il y a une pièce entre eux, si ton roi est en échec, ou s'il doit passer par une case attaquée. Ici, le fou noir attaque f1 : le roi passerait par là, donc le roque est interdit.

- Position : `4k3/8/8/8/2b5/8/5PPP/4K2R w K - 0 1` (C'est aux blancs de jouer)
- Flèches : c4→f1
- Cases colorées : f1

**Écran 11 · Principe · Petit et grand roque**

Tu peux roquer de deux côtés. Côté droit (vers la tour la plus proche), c'est le « petit roque », le plus fréquent. Côté gauche (vers la tour du côté de la dame), c'est le « grand roque ». Dans les deux cas, le roi bouge de deux cases.

- Position : `r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1` (C'est aux blancs de jouer)
- Flèches : e1→g1, e1→c1

**Écran 12 · Principe · La promotion**

Quand un de tes pions arrive tout au bout de l'échiquier, il se transforme. Tu choisis : dame, tour, fou ou cavalier. Ça s'appelle la « promotion ». On choisit presque toujours une dame, la pièce la plus forte.

- Position : `4k3/1P6/8/8/8/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `b7b8q` : Le pion arrive sur la dernière rangée et devient une dame. En plus, cette nouvelle dame attaque déjà le roi noir sur la rangée : c'est échec.

**Écran 13 · Principe · La prise en passant**

Une règle rare mais réelle. Si un pion adverse avance de deux cases et se retrouve juste à côté de ton pion, ton pion peut le prendre « en passant ». Attention : seulement au coup juste après, sinon c'est trop tard.

- Position : `4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1` (C'est aux noirs de jouer)
- Démonstration :
  - `d7d5` : Le pion noir avance de deux cases d'un coup et arrive juste à côté de ton pion en e5.
  - `e5d6` : Ton pion le prend comme s'il n'avait avancé que d'une case : il va en d6 et le pion noir disparaît. C'est la prise en passant.

**Écran 14 · Piège · Le piège du pat**

C'est aux noirs de jouer. Le roi noir n'est pas en échec, mais toutes ses cases sont attaquées par la dame blanche. Il ne peut faire aucun coup. C'est le « pat » : la partie est nulle, personne ne gagne, même si les blancs ont beaucoup plus de pièces.

- Position : `k7/8/1Q6/8/8/8/8/7K b - - 0 1` (C'est aux noirs de jouer)
- Cases colorées : a7, b7, b8

**Écran 15 · À retenir · Les autres nulles**

Une partie « nulle », c'est une partie sans gagnant. Ça arrive aussi quand la même position revient trois fois, ou quand il ne reste pas assez de pièces pour faire mat, comme ici : un roi contre un roi.

- Position : `4k3/8/8/8/8/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)

**Exercice 1** (jouer un coup)

- Position : `4k3/8/8/5n2/8/8/2B5/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Tu joues les blancs. Prends le cavalier noir avec ton fou.
- Solution : c2f5
- Réponses acceptées : c2f5
- Si réussi : Oui : le fou a filé en diagonale jusqu'au cavalier.
- Indice : Le fou va en biais. Suis la diagonale qui monte vers la droite.

**Exercice 2** (jouer un coup)

- Position : `4k3/8/2r5/8/3N4/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Prends la tour noire avec ton cavalier.
- Solution : d4c6
- Réponses acceptées : d4c6
- Si réussi : Bien joué : deux cases vers le haut, une vers la gauche. Un L.
- Indice : Compte deux cases vers le haut, puis une sur le côté.

**Exercice 3** (jouer un coup)

- Position : `4k3/8/8/8/8/8/5PPP/4K2R w K - 0 1` (C'est aux blancs de jouer)
- Consigne : Fais le petit roque : mets ton roi à l'abri.
- Solution : e1g1
- Réponses acceptées : e1g1
- Si réussi : Ton roi est à l'abri derrière ses pions, et ta tour est sortie du coin.
- Indice : Déplace ton roi de deux cases vers la droite.

**Exercice 4** (jouer un coup)

- Position : `4k3/1P6/8/8/8/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Ton pion est presque au bout. Avance-le et transforme-le en dame.
- Solution : b7b8q
- Réponses acceptées : b7b8q
- Si réussi : Une nouvelle dame, et en plus elle met le roi noir en échec.
- Indice : Avance le pion d'une case, puis choisis la dame.

**Exercice 5** (jouer un coup)

- Position : `4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2` (C'est aux blancs de jouer)
- Consigne : Le pion noir vient d'avancer de deux cases, de d7 à d5. Prends-le en passant.
- Solution : e5d6
- Réponses acceptées : e5d6
- Si réussi : Exact : ton pion va en d6 et le pion noir disparaît.
- Indice : Ton pion va en diagonale, derrière le pion noir, sur la case d6.

**À retenir** : Tour en ligne droite, fou en diagonale, dame les deux, cavalier en L, roi d'une case, pion tout droit mais il prend en biais. Et méfie-toi du pat.

---

### `vis-notation` · Le nom des cases et des coups

Mots introduits : case, colonne, rangée, notation, R, D, T, F, C, x, +, #

**Défi d'entrée** (toucher une case)

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Consigne : Chaque case a un nom. Devine où est la case e4 et touche-la. Indice : les lettres sont en bas de l'échiquier, les chiffres sur le côté.
- Solution : e4
- Réponses acceptées : e4
- Indice : Trouve la lettre e en bas, puis monte jusqu'au chiffre 4.

**Écran 1 · Principe · Une lettre et un chiffre**

Chaque case a un nom, comme à la bataille navale. La lettre (de a à h) indique la colonne, de gauche à droite. Le chiffre (de 1 à 8) indique la rangée, de bas en haut quand tu as les blancs. La case colorée, c'est e4 : colonne e, rangée 4.

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Cases colorées : e4

**Écran 2 · Pourquoi · Pourquoi apprendre ça**

Parce que tout ce que tu liras ou regarderas sur les échecs utilise ces noms : les livres, les vidéos, les analyses sur Lichess. Et dans l'app, je te dirai « ton cavalier en g1 peut aller en f3 ». C'est beaucoup plus précis que « le cavalier en bas à droite ».

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Flèches : g1→f3
- Cases colorées : g1, f3

**Écran 3 · Principe · Écrire un coup**

Pour écrire un coup, on met la lettre de la pièce puis sa case d'arrivée. R = roi, D = dame, T = tour, F = fou, C = cavalier. Ici, le cavalier va en f3 : on écrit Cf3.

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Flèches : g1→f3

**Écran 4 · Principe · Les pions**

Les pions n'ont pas de lettre. Pour un pion, on écrit seulement la case d'arrivée. Le pion qui avance de e2 à e4 s'écrit simplement e4.

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Flèches : e2→e4

**Écran 5 · Principe · Prendre, échec, mat**

Trois petits signes à connaître. Le x veut dire « prend » : Fxf7 = le fou prend ce qui est en f7. Le + veut dire échec : Fxf7+ = le fou prend en f7 et met le roi en échec. Le # veut dire mat.

- Position : `r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3` (C'est aux blancs de jouer)
- Flèches : c4→f7

**Écran 6 · Principe · Le roque**

Le roque a son écriture spéciale : O-O pour le petit roque (côté droit), O-O-O pour le grand roque (côté gauche). Retiens : plus il y a de O, plus la tour vient de loin.

- Position : `r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1` (C'est aux blancs de jouer)
- Flèches : e1→g1, e1→c1

**Écran 7 · Méthode · Quand tu as les noirs**

Quand tu joues les noirs, l'échiquier est retourné : tes pièces sont en bas, et la case a1 se retrouve en haut à droite. Les noms des cases ne changent pas, seule ta façon de regarder change. Les lettres et chiffres sur les bords t'aident toujours.

- Position : `rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1` (C'est aux noirs de jouer)
- Cases colorées : a1, h8

**Écran 8 · Méthode · Comment t'entraîner**

Fais 2 minutes du jeu « Trouve la case » chaque jour, jusqu'à en trouver 30 en 30 secondes, côté blancs puis côté noirs. Commence par les 4 cases du milieu : d4, e4, d5, e5. Ce sont les plus importantes.

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Cases colorées : d4, e4, d5, e5

**Exercice 1** (toucher une case)

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Consigne : Touche la case d5.
- Solution : d5
- Réponses acceptées : d5
- Si réussi : Oui, d5 : colonne d, rangée 5.
- Indice : Colonne d (juste à gauche de e), rangée 5.

**Exercice 2** (toucher une case)

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Consigne : Touche la case où se trouve ta dame au début de la partie.
- Solution : d1
- Réponses acceptées : d1
- Si réussi : La dame blanche commence en d1. Petit truc : la dame se place sur une case de sa couleur.
- Indice : C'est la pièce avec une couronne, en bas.

**Exercice 3** (toucher une case)

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Consigne : Touche la case f7. Elle est célèbre : au début de la partie, seul le roi noir la protège.
- Solution : f7
- Réponses acceptées : f7
- Si réussi : f7, juste à côté du roi noir. On en reparlera.
- Indice : Colonne f, rangée 7 : c'est un pion noir.

**Exercice 4** (toucher une case)

- Position : `rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1` (C'est aux noirs de jouer)
- Consigne : Maintenant tu joues les noirs : l'échiquier est retourné. Touche la case f6.
- Solution : f6
- Réponses acceptées : f6
- Si réussi : Bravo. Tu sais te repérer même échiquier retourné.
- Indice : Regarde les lettres sur le bord : elles vont maintenant de h à a.

**À retenir** : Une case = une lettre (colonne) + un chiffre (rangée). Un coup = la lettre de la pièce + la case d'arrivée. x prend, + échec, # mat.

---

### `vis-values` · Combien vaut chaque pièce

Mots introduits : valeur des pièces, matériel

**Défi d'entrée** (jouer un coup)

- Position : `7k/8/8/3n4/p7/8/8/3Q2K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Tu joues les blancs. Ta dame en d1 peut prendre deux choses : le pion en a4 ou le cavalier en d5. Aucun des deux n'est protégé. Lequel prends-tu ?
- Solution : d1d5
- Réponses acceptées : d1d5
- Indice : Un cavalier vaut plus qu'un pion. Lequel est le plus précieux ?

**Écran 1 · Principe · Les points de chaque pièce**

Pour savoir si un échange est bon, on donne des points aux pièces. Pion : 1. Cavalier : 3. Fou : 3. Tour : 5. Dame : 9. Le roi n'a pas de prix : s'il est mat, la partie est perdue, peu importe le reste.

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)

**Écran 2 · Pourquoi · À quoi ça sert**

Ces points servent à comparer. Ici, ta dame peut prendre la tour noire (5 points), et ton fou peut prendre la dame noire (9 points). Avant de choisir, on regarde aussi ce que l'adversaire pourra reprendre. C'est le sujet d'une prochaine fiche.

- Position : `7k/8/4p3/3r4/q7/8/2B5/3Q2K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : c2→a4, d1→d5

**Écran 3 · Principe · Le matériel**

On appelle « matériel » l'ensemble de tes pièces, compté en points. « Gagner du matériel », c'est gagner des points sur l'adversaire. Entre débutants, gagner 3 points (un cavalier ou un fou) sans rien perdre suffit souvent pour gagner la partie.

- Position : `7k/8/8/8/8/8/5PPP/3R2K1 w - - 0 1` (C'est aux blancs de jouer)

**Écran 4 · Principe · L'échange de la qualité**

Quand on donne une tour (5) contre un cavalier ou un fou (3), on perd environ 2 points. Les joueurs appellent ça « perdre la qualité ». Évite-le, sauf si tu vois que ça te rapporte vite quelque chose de mieux, comme un mat.

- Position : `7k/8/8/3n4/8/8/8/3R2K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d1→d5

**Écran 5 · Piège · Les points ne font pas tout**

Les points sont des repères, pas une loi. Une pièce coincée vaut moins qu'une pièce active. Et un mat vaut plus que tout : ici, les noirs ont une dame (9) contre une tour (5), mais regarde ce qui arrive à leur roi.

- Position : `6k1/5ppp/8/8/8/8/q4PPP/4R1K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `e1e8` : La tour blanche arrive sur la dernière rangée. Le roi noir est coincé par ses pions : mat. La dame noire n'a servi à rien.

**Exercice 1** (jouer un coup)

- Position : `4k3/8/8/1b4r1/8/8/3Q4/1R2K3 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Tu peux prendre le fou en b5 avec ta tour, ou la tour en g5 avec ta dame. Rien n'est protégé. Choisis la prise qui rapporte le plus de points.
- Solution : d2g5
- Réponses acceptées : d2g5
- Si réussi : Exact : une tour vaut 5, un fou 3.
- Indice : Compare : un fou vaut 3, une tour vaut 5.

**À retenir** : Pion 1, cavalier 3, fou 3, tour 5, dame 9. Compare toujours ce que tu gagnes et ce que tu perds.

---

### `vis-attacked-squares` · Voir qui attaque quoi

Mots introduits : attaquer, défendre, protéger

**Défi d'entrée** (jouer un coup)

- Position : `r3k3/1p6/8/3n4/8/8/6B1/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Tu joues les blancs. Une pièce noire est attaquée par ton fou et personne ne la protège. Prends-la.
- Solution : g2d5
- Réponses acceptées : g2d5
- Indice : Suis la grande diagonale de ton fou, de g2 vers le haut à gauche.

**Écran 1 · Principe · Attaquer une case**

Une pièce « attaque » une case si elle pourrait y aller au prochain coup. Ta dame en d4 attaque toutes les cases sur ses lignes droites et ses diagonales, jusqu'à ce qu'une pièce lui bloque le chemin. Si une pièce adverse est sur l'une de ces cases, elle est attaquée.

- Position : `4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d4→d8, d4→h8, d4→a7, d4→h4, d4→a4, d4→a1, d4→g1, d4→d1

**Écran 2 · Principe · Protéger une pièce**

Une pièce en « protège » une autre si elle pourrait reprendre sur sa case. Ici, le pion noir en e4 protège le cavalier en d5 : si ton fou prenait le cavalier, le pion reprendrait ton fou. Et attention, le pion bloque aussi la diagonale de ton fou.

- Position : `4k3/8/8/3n4/4p3/8/6B1/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : e4→d5
- Cases colorées : d5

**Écran 3 · Pourquoi · Pourquoi c'est la base**

Presque toutes les erreurs de débutant viennent d'une attaque qu'on n'a pas vue : une pièce à soi qui se fait prendre, ou une pièce adverse gratuite qu'on oublie de prendre. Ici, ton fou attaque le cavalier en d5 et rien ne le protège : c'est un cadeau.

- Position : `r3k3/1p6/8/3n4/8/8/6B1/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : g2→d5
- Cases colorées : d5

**Écran 4 · Méthode · La méthode**

Pour chaque pièce, suis ses lignes avec les yeux. Commence par les pièces qui vont loin : dame, tours, fous. Ce sont elles qu'on oublie le plus, surtout quand elles sont de l'autre côté de l'échiquier, comme la tour noire en a8 qui surveille toute la colonne a.

- Position : `r3k3/1p6/8/3n4/8/8/6B1/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : g2→d5, a8→a1

**Écran 5 · Piège · Les cavaliers sont sournois**

Le cavalier attaque en L, et c'est la pièce qu'on voit le moins venir. Ici, le cavalier noir en d4 attaque ta dame en c2. Prends l'habitude de regarder les 8 cases de chaque cavalier adverse.

- Position : `4k3/8/8/8/3n4/8/2Q5/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d4→c2, d4→e2
- Cases colorées : c2

**Exercice 1** (jouer un coup)

- Position : `6k1/p4ppp/1p6/2b1n3/3Q4/8/5PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Ta dame en d4 attaque deux pièces noires : le fou en c5 et le cavalier en e5. Une seule n'est protégée par personne. Prends-la.
- Solution : d4e5
- Réponses acceptées : d4e5
- Si réussi : Oui. Le fou en c5, lui, était protégé par le pion en b6 : ta dame se serait fait prendre.
- Indice : Regarde les pions noirs : lequel pourrait reprendre ?

**À retenir** : Avant chaque coup, suis les lignes des pièces : qui attaque quoi, qui protège quoi.

---

### `vis-check-escape` · Sortir d'un échec

**Défi d'entrée** (jouer un coup)

- Position : `6k1/5ppp/8/8/8/8/4r1PP/R3K3 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Ton roi est en échec : la tour noire en e2 l'attaque. Trouve la meilleure façon de t'en sortir.
- Solution : e1e2
- Réponses acceptées : e1e2
- Indice : Personne ne protège la tour noire. Et ton roi est juste à côté d'elle.

**Écran 1 · Principe · Trois façons de répondre**

Quand ton roi est en échec, tu as trois façons de t'en sortir. Un : prendre la pièce qui attaque. Deux : mettre une pièce entre ton roi et l'attaquant. Trois : déplacer ton roi sur une case sûre. Regarde toujours les trois avant de choisir.

- Position : `6k1/5ppp/8/8/8/8/4r1PP/R3K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : e2→e1
- Cases colorées : e1

**Écran 2 · Pourquoi · Pourquoi ça compte**

Le choix de la réponse change tout. Ici, fuir serait une erreur : prendre la tour te la fait gagner gratuitement.

- Position : `6k1/5ppp/8/8/8/8/4r1PP/R3K3 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `e1e2` : Ton roi prend la tour : elle n'était protégée par aucune pièce noire. Tu gagnes 5 points en te sortant de l'échec.

**Écran 3 · Méthode · Se mettre devant**

Ici, la tour noire attaque ton roi sur toute la rangée du bas. Ton roi ne peut pas fuir : ses pions le bloquent. Tu peux mettre ton cavalier entre les deux, en f1. Là, ton roi protège le cavalier : si la tour le prend, ton roi la reprend.

- Position : `6k1/8/8/8/8/8/3N1PPP/r5K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : a1→g1, d2→f1

**Écran 4 · Piège · Se mettre devant, mais protégé**

Attention : une pièce que tu mets devant ton roi doit être protégée, sinon l'adversaire la prend et l'échec recommence. Regarde ce qui arrive si le cavalier va en b1.

- Position : `6k1/8/8/8/8/8/3N1PPP/r5K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `d2b1` : Le cavalier se met en b1. Mais en b1, personne ne le protège.
  - `a1b1` : La tour le prend, et c'est échec et mat : ton roi est toujours coincé.

**Écran 5 · Méthode · Fuir au bon endroit**

Si tu dois fuir, choisis une case qui n'est attaquée par aucune pièce adverse, et si possible pas sur la ligne d'une autre pièce dangereuse. Contre un échec de cavalier, on ne peut pas se mettre devant : le cavalier saute. Il faut le prendre ou fuir.

- Position : `6k1/8/8/8/8/8/8/r3K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : a1→e1
- Cases colorées : d2, e2, f2

**Exercice 1** (jouer un coup)

- Position : `6k1/8/8/8/8/8/3N1PPP/r5K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Ton roi est en échec et ne peut pas bouger. Mets une pièce devant lui, à un endroit où elle est protégée.
- Solution : d2f1
- Réponses acceptées : d2f1
- Si réussi : Ton cavalier en f1 bloque l'échec, et ton roi le protège.
- Indice : Ton cavalier peut aller sur une case juste à côté de ton roi.

**À retenir** : En échec : prendre l'attaquant, se mettre devant avec une pièce protégée, ou fuir sur une case sûre. Regarde les trois.

---

### `mat-basic-queen` · Faire mat avec la dame et le roi

**Défi d'entrée** (jouer un coup)

- Position : `k7/8/2K5/8/8/8/8/1Q6 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Tu as une dame et un roi, ton adversaire n'a plus que son roi, en a8. Fais mat en un coup. Attention, un coup ressemble au mat mais donne pat (partie nulle).
- Solution : b1b7
- Réponses acceptées : b1b7
- Indice : Ta dame peut se coller au roi noir si ton roi la protège.

**Écran 1 · Pourquoi · Pourquoi le savoir**

Il arrive souvent qu'on gagne toutes les pièces adverses et qu'il ne reste qu'un roi. Si tu ne sais pas faire mat, la partie peut finir nulle : par pat, ou parce que la règle des 50 coups (50 coups sans prise ni mouvement de pion) arrête la partie. Ce mat se fait en moins de 10 coups avec la bonne méthode.

- Position : `4k3/8/8/8/8/8/8/3QK3 w - - 0 1` (C'est aux blancs de jouer)

**Écran 2 · Principe · Le principe : la boîte**

Ta dame enferme le roi adverse dans une boîte de plus en plus petite. Ici, la dame en c4 l'empêche de passer sur la colonne c et sur la rangée 4 : le roi noir est enfermé dans le coin en haut à droite. Elle est à un « saut de cavalier » du roi : assez près pour l'enfermer, sans lui donner échec.

- Position : `8/8/8/4k3/2Q5/8/8/4K3 b - - 0 1` (C'est aux noirs de jouer)
- Flèches : c4→c8, c4→h4
- Cases colorées : e5

**Écran 3 · Méthode · Étape 1 : pousser vers le bord**

Chaque fois que le roi noir recule, ta dame le suit en restant à un saut de cavalier de lui. La boîte rétrécit à chaque coup, jusqu'à ce que le roi noir soit collé à un bord de l'échiquier.

- Position : `8/8/8/4k3/2Q5/8/8/4K3 b - - 0 1` (C'est aux noirs de jouer)
- Flèches : c4→d3

**Écran 4 · Méthode · Étape 2 : arrêter la dame, faire venir le roi**

Quand le roi noir est sur le bord, ARRÊTE de bouger ta dame. Fais monter ton roi. Ta dame seule ne peut pas faire mat : il lui faut l'aide de ton roi pour protéger la case du mat.

- Position : `4k3/8/8/2Q5/8/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : e1→e5
- Cases colorées : e8

**Écran 5 · Principe · La position de mat**

Voici un mat. La dame en b7 se colle au roi noir. Le roi noir ne peut pas la prendre, car ton roi en c6 la protège. Et toutes les cases autour sont attaquées. C'est fini.

- Position : `k7/1Q6/2K5/8/8/8/8/8 b - - 0 1` (C'est aux noirs de jouer)
- Cases colorées : a8, b7, c6

**Écran 6 · Piège · Attention au pat**

Voici le piège classique. C'est aux noirs de jouer, leur roi n'est pas en échec, mais toutes ses cases sont attaquées par la dame : il ne peut rien jouer. C'est pat, partie nulle. Avant chaque coup de dame près du bord, demande-toi : « Est-ce qu'il aura encore une case pour bouger ? »

- Position : `k7/8/1Q6/8/8/8/8/7K b - - 0 1` (C'est aux noirs de jouer)
- Cases colorées : a7, b7, b8

**Exercice 1** (jouer un coup)

- Position : `7k/5Q2/6K1/8/8/8/8/8 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Fais mat en un coup.
- Solution : f7g7
- Réponses acceptées : f7e8, f7f8, f7g7, f7h7
- Si réussi : Mat. Ta dame est collée au roi et protégée par ton roi (ou elle l'enferme sur la dernière rangée).
- Indice : Ta dame peut se coller au roi noir sur une case que ton roi protège.

**À retenir** : La dame enferme, le roi aide. Quand le roi adverse est au bord, arrête la dame et fais venir ton roi. Toujours vérifier : aura-t-il encore un coup ?

---

### `mat-two-rooks` · Le mat de l'escalier

**Défi d'entrée** (jouer un coup)

- Position : `6k1/R7/8/8/8/8/8/1R4K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Tu as deux tours. Ta tour en a7 empêche déjà le roi noir de descendre. Fais mat en un coup avec l'autre tour.
- Solution : b1b8
- Réponses acceptées : b1b8
- Indice : Ta tour en b1 peut monter tout en haut.

**Écran 1 · Principe · Deux tours qui montent un escalier**

Avec deux tours, pas besoin de ton roi. Une tour coupe la route au roi adverse (il ne peut pas traverser sa ligne), l'autre lui donne échec sur la ligne d'après. Elles avancent à tour de rôle, comme si elles montaient un escalier.

- Position : `6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1` (C'est aux blancs de jouer)

**Écran 2 · Exemple · La démonstration**

Regarde les tours travailler ensemble.

- Position : `6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `a2a7` : La tour monte en a7 : le roi noir ne peut plus descendre sur la 7e rangée.
  - `g8f8` : Le roi noir ne peut que se déplacer le long de la dernière rangée.
  - `b1b8` : L'autre tour monte en b8 : échec sur la dernière rangée, et la 7e rangée est déjà fermée. Échec et mat.

**Écran 3 · Piège · Garde tes tours loin du roi**

Si le roi adverse s'approche d'une de tes tours, il peut la prendre quand elle n'est pas protégée. Ici, le roi noir en c3 attaque la tour en b2. Dans ce cas, éloigne la tour à l'autre bout de sa ligne, puis reprends l'escalier.

- Position : `8/8/8/8/8/2k5/1R6/R5K1 b - - 0 1` (C'est aux noirs de jouer)
- Flèches : c3→b2
- Cases colorées : b2

**À retenir** : Une tour ferme une ligne, l'autre donne échec sur la suivante. Garde-les loin du roi adverse.

---

### `proc-blunder-check` · La vérification avant chaque coup

**Défi d'entrée** (jouer un coup)

- Position : `4r1k1/5ppp/8/8/8/n1Q5/5PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Tu joues les blancs. Le cavalier noir en a3 a l'air gratuit pour ta dame. Mais avant de le prendre, regarde ce que la tour noire en e8 pourrait faire juste après. Quel coup joues-tu ?
- Solution : g2g3
- Réponses acceptées : h2h3, g2g3, g1f1, f2f4, h2h4
- Indice : Si ta dame part en a3, qui surveille encore la case e1 ?

**Écran 1 · Pourquoi · Le réflexe qui sauve le plus de parties**

La plupart des parties perdues entre débutants le sont à cause d'un seul coup : on a joué sans regarder ce que l'adversaire pouvait faire juste après. La bonne nouvelle : une petite vérification de quelques secondes suffit à éviter la plupart de ces erreurs.

- Position : `4r1k1/5ppp/8/8/8/n1Q5/5PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)

**Écran 2 · Exemple · Ce qui arrive sans vérifier**

Regarde ce qui se passe si on prend le cavalier tout de suite.

- Position : `4r1k1/5ppp/8/8/8/n1Q5/5PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `c3a3` : La dame prend le cavalier. Tu as gagné 3 points... mais ta dame ne surveille plus la case e1.
  - `e8e1` : La tour noire descend en e1 : échec. Ton roi est coincé derrière ses pions, rien ne peut prendre la tour ni se mettre devant. Mat.

**Écran 3 · Méthode · Question 1 : que menace-t-il ?**

Avant de penser à ton coup, demande-toi : « Si je ne faisais rien, que pourrait-il me faire ? » Regarde ses échecs possibles, ses prises possibles, ses attaques. Ici, sa tour menace de descendre en e1 et de faire mat. Ta dame est la seule à empêcher ça.

- Position : `4r1k1/5ppp/8/8/8/n1Q5/5PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : e8→e1
- Cases colorées : e1

**Écran 4 · Méthode · Question 2 : quels sont mes coups forts ?**

Ensuite seulement, cherche tes coups intéressants : tes échecs, tes prises, tes attaques. Ici, tu peux prendre le cavalier en a3. Note-le comme une idée, pas encore comme une décision.

- Position : `4r1k1/5ppp/8/8/8/n1Q5/5PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : c3→a3

**Écran 5 · Méthode · Question 3 : et après mon coup ?**

Imagine ton coup joué, comme sur cette image. Puis pose-toi la question 1 à nouveau, de son point de vue : quels sont ses échecs, ses prises, ses menaces ? Ici, la tour en e1 fait mat. Donc on ne prend pas le cavalier tout de suite.

- Position : `4r1k1/5ppp/8/8/8/Q7/5PPP/6K1 b - - 0 1` (C'est aux noirs de jouer)
- Flèches : e8→e1
- Cases colorées : e1

**Écran 6 · Méthode · La bonne solution**

On règle d'abord le danger, ensuite on prend.

- Position : `4r1k1/5ppp/8/8/8/n1Q5/5PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `g2g3` : Le pion avance et libère la case g2 pour ton roi. Maintenant, si la tour noire descend en e1, ton roi peut s'échapper : ce n'est plus mat. Le cavalier en a3 ne va pas s'envoler, tu pourras le prendre au prochain coup.

**Écran 7 · Piège · Le piège : vérifier seulement quand on a peur**

On fait souvent cette vérification quand on sent un danger. Mais les erreurs arrivent surtout quand tout semble calme et qu'un coup paraît évident, comme prendre un cavalier gratuit. Fais-la à chaque coup, même quand tu es sûre de toi.

- Position : `4r1k1/5ppp/8/8/8/n1Q5/5PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)

**Exercice 1** (jouer un coup)

- Position : `7k/8/4p3/3r4/q7/8/2B5/3Q2K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Tu peux prendre la tour noire avec ta dame, ou la dame noire avec ton fou. Fais la vérification avant de choisir : après ta prise, qu'est-ce que l'adversaire peut reprendre ?
- Solution : c2a4
- Réponses acceptées : c2a4
- Si réussi : Exact. Si ta dame avait pris la tour en d5, le pion en e6 aurait repris ta dame. Ici, personne ne peut reprendre ton fou.
- Indice : Regarde le pion noir en e6 : quelle case surveille-t-il ?

**À retenir** : Avant chaque coup : 1. que menace-t-il ? 2. quels sont mes coups forts ? 3. après mon coup, que peut-il faire ?

---

### `proc-opponent-threat` · Que veut son dernier coup ?

Mots introduits : menace

**Défi d'entrée** (toucher une case)

- Position : `3q2k1/5ppp/8/n7/2B5/8/5PPP/4QRK1 w - - 1 2` (C'est aux blancs de jouer)
- Flèches : c6→a5
- Consigne : Les noirs viennent de jouer leur cavalier de c6 en a5 (la flèche). Une de tes pièces est maintenant attaquée. Touche-la.
- Solution : c4
- Réponses acceptées : c4
- Indice : Regarde les cases que le cavalier en a5 peut atteindre en L.

**Écran 1 · Principe · Chaque coup adverse a une raison**

Une « menace », c'est ce que l'adversaire pourrait faire de dangereux au prochain coup si tu ne réagis pas. Après chaque coup adverse, avant de penser à ton plan, demande-toi : « Pourquoi il a joué ça ? » Ici, son cavalier attaque ton fou en c4, que personne ne protège.

- Position : `3q2k1/5ppp/8/n7/2B5/8/5PPP/4QRK1 w - - 1 2` (C'est aux blancs de jouer)
- Flèches : a5→c4
- Cases colorées : c4

**Écran 2 · Méthode · Trois questions à poser**

Un : qu'attaque la pièce qui vient de bouger ? Deux : la pièce a-t-elle libéré une ligne pour une autre pièce derrière elle ? Trois : qu'est-ce que cette pièce ne protège plus, maintenant qu'elle est partie ?

- Position : `3q2k1/5ppp/8/n7/2B5/8/5PPP/4QRK1 w - - 1 2` (C'est aux blancs de jouer)
- Flèches : a5→c4

**Écran 3 · Méthode · Quatre façons de répondre**

Face à une menace, tu peux : déplacer la pièce attaquée (ton fou peut aller en d5), la protéger (ta dame peut aller en e4 pour la protéger), prendre la pièce qui attaque si c'est sans danger, ou créer une menace plus grosse encore. Compare avant de choisir.

- Position : `3q2k1/5ppp/8/n7/2B5/8/5PPP/4QRK1 w - - 1 2` (C'est aux blancs de jouer)
- Flèches : c4→d5, e1→e4

**Écran 4 · Piège · Prendre l'attaquant ? Vérifie d'abord**

Prendre la pièce qui attaque est souvent une bonne idée, mais seulement si personne ne la protège. Regarde.

- Position : `3q2k1/5ppp/8/n7/2B5/8/5PPP/4QRK1 w - - 1 2` (C'est aux blancs de jouer)
- Démonstration :
  - `e1a5` : Ta dame prend le cavalier en a5. Ça a l'air malin...
  - `d8a5` : ...mais la dame noire en d8 surveillait a5 par la diagonale. Elle reprend : tu as perdu ta dame (9 points) contre un cavalier (3).

**Exercice 1** (jouer un coup)

- Position : `3q2k1/5ppp/8/n7/2B5/8/5PPP/4QRK1 w - - 1 2` (C'est aux blancs de jouer)
- Consigne : Ton fou en c4 est attaqué par le cavalier. Mets-le à l'abri ou protège-le, sans rien perdre.
- Solution : c4d5
- Réponses acceptées : c4d5, c4a2, c4b5, e1e4, e1e2
- Si réussi : Ton fou n'est plus perdu. C'était exactement ce que la question « que veut son dernier coup ? » devait te faire voir.
- Indice : Ton fou peut reculer sur une case où rien ne l'attaque, ou ta dame peut venir le protéger.

**À retenir** : Après chaque coup adverse : qu'attaque-t-il, qu'a-t-il libéré, que ne protège-t-il plus ?

---

### `proc-hanging-pieces` · Les pièces que personne ne protège

Mots introduits : pièce en prise

**Défi d'entrée** (jouer un coup)

- Position : `6k1/pp3ppp/3b4/8/8/8/PP3PPP/3R2K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Tu joues les blancs. Une pièce noire n'est protégée par personne et ta tour peut l'atteindre. Prends-la.
- Solution : d1d6
- Réponses acceptées : d1d6
- Indice : Ta tour en d1 regarde toute la colonne d, vers le haut.

**Écran 1 · Principe · Une pièce en prise**

Une pièce « en prise », c'est une pièce que l'adversaire peut prendre sans rien perdre en échange. Ici, le fou noir en d6 est attaqué par ta tour et aucune pièce noire ne le protège. C'est 3 points gratuits.

- Position : `6k1/pp3ppp/3b4/8/8/8/PP3PPP/3R2K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d1→d6
- Cases colorées : d6

**Écran 2 · Pourquoi · Les pièces non protégées tombent**

Un grand joueur, John Nunn, résume : « les pièces non protégées finissent par tomber ». Ici, en début de partie, ton fou en c4 et le fou noir en c5 ne sont protégés par personne. Ce n'est pas grave tant que personne ne peut les attaquer, mais ce sont les premières cibles.

- Position : `r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5` (C'est aux blancs de jouer)
- Cases colorées : c4, c5

**Écran 3 · Méthode · Après chaque coup, compte**

Prends l'habitude, après chaque coup (le tien et le sien), de repérer tes pièces que personne ne protège. Moins tu en as, moins l'adversaire a d'occasions. Et chez lui, chaque pièce non protégée est une raison de chercher une attaque.

- Position : `r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5` (C'est aux blancs de jouer)
- Cases colorées : c4

**Écran 4 · Méthode · Protéger ou déplacer**

Quand une de tes pièces non protégée est attaquée, tu as deux choix : la déplacer sur une case sûre, ou la protéger avec une autre pièce. Ici, le fou noir en f6 attaque ton cavalier en c3. Il faut réagir maintenant.

- Position : `6k1/5ppp/5b2/8/8/2N5/P4PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : f6→c3
- Cases colorées : c3

**Écran 5 · Piège · Protégée ne veut pas dire sauvée**

Attention : une pièce protégée peut quand même se perdre si on l'attaque avec une pièce moins chère qu'elle. La tour noire en d5 est protégée par le pion en e6. Si ta dame la prend, le pion reprend ta dame. On en parle dans la fiche sur les échanges.

- Position : `7k/8/4p3/3r4/q7/8/2B5/3Q2K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : e6→d5
- Cases colorées : d5

**Exercice 1** (jouer un coup)

- Position : `6k1/5ppp/5b2/8/8/2N5/P4PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Le fou noir en f6 attaque ton cavalier en c3, que personne ne protège. Sauve ton cavalier.
- Solution : c3d5
- Réponses acceptées : c3d5, c3b5, c3e4, c3d1, c3b1
- Si réussi : Ton cavalier est à l'abri. Et s'il attaque le fou en retour, c'est encore mieux.
- Indice : Ton cavalier peut sauter sur une case où le fou ne l'atteint pas.

**À retenir** : Une pièce que personne ne protège est une cible. Prends celles de l'adversaire, protège les tiennes.

---

### `proc-exchange-count` · Compter avant de prendre

Mots introduits : échange

**Défi d'entrée** (jouer un coup)

- Position : `3q2k1/5ppp/3p4/4n3/5P2/5N2/4Q1PP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Le cavalier noir en e5 est attaqué par trois de tes pièces : ton pion, ton cavalier et ta dame. Il est protégé par le pion en d6. Avec quelle pièce le prends-tu ?
- Solution : f4e5
- Réponses acceptées : f4e5
- Indice : Le pion noir en d6 va reprendre. Qu'est-ce que tu préfères perdre : un pion, un cavalier ou ta dame ?

**Écran 1 · Principe · Ce qu'est un échange**

Un « échange », c'est : je prends une pièce, il reprend la mienne. Pour savoir si c'est bon, on compare les points de ce que chacun a perdu. Une pièce protégée n'est pas interdite à prendre, il faut juste compter.

- Position : `3q2k1/5ppp/3p4/4n3/5P2/5N2/4Q1PP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : f4→e5, d6→e5

**Écran 2 · Méthode · Compter attaquants et défenseurs**

Compte les pièces qui attaquent la case : ici, trois blanches (pion f4, cavalier f3, dame e2). Puis celles qui la protègent : une seule noire (le pion en d6). Si tu attaques plus de fois qu'il ne protège, tu peux souvent gagner la pièce.

- Position : `3q2k1/5ppp/3p4/4n3/5P2/5N2/4Q1PP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : f4→e5, f3→e5, e2→e5, d6→e5
- Cases colorées : e5

**Écran 3 · Méthode · Prends avec la pièce la moins chère**

Commence toujours par ta pièce la moins précieuse. Si l'adversaire reprend, tu perds peu. Regarde.

- Position : `3q2k1/5ppp/3p4/4n3/5P2/5N2/4Q1PP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `f4e5` : Ton pion (1 point) prend le cavalier (3 points).
  - `d6e5` : Le pion noir reprend ton pion.
  - `e2e5` : Ta dame reprend en e5. Bilan : tu as gagné un cavalier et un pion, tu n'as perdu qu'un pion.

**Écran 4 · Piège · La prise trop rapide**

Même cible, mauvaise pièce. Regarde ce qui arrive si ta dame prend la première.

- Position : `3q2k1/5ppp/3p4/4n3/5P2/5N2/4Q1PP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `e2e5` : Ta dame (9 points) prend le cavalier (3 points).
  - `d6e5` : Le pion reprend ta dame. Tu as donné 9 points pour en gagner 3.

**Écran 5 · Méthode · Jouer l'échange jusqu'au bout**

Joue la suite dans ta tête : je prends, il reprend, je reprends... Additionne les points perdus de chaque côté. Et souviens-toi qu'il n'est jamais obligé de reprendre : regarde aussi ce qui se passe s'il fait autre chose à la place.

- Position : `3q2k1/5ppp/3p4/4n3/5P2/5N2/4Q1PP/6K1 w - - 0 1` (C'est aux blancs de jouer)

**Exercice 1** (jouer un coup)

- Position : `7k/8/4p3/3r4/q7/8/2B5/3Q2K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Deux prises possibles : ta dame sur la tour en d5, ou ton fou sur la dame en a4. Compte ce que chacune te rapporte vraiment.
- Solution : c2a4
- Réponses acceptées : c2a4
- Si réussi : Exact. La dame noire n'était protégée par personne : +9 points. La tour, elle, était protégée par le pion en e6.
- Indice : Après chaque prise, qui peut reprendre ?

**À retenir** : Compte qui attaque et qui protège. Prends avec ta pièce la moins chère. Joue l'échange jusqu'au bout dans ta tête.

---

### `ouv-principles` · Bien commencer une partie

Mots introduits : développer, centre

**Défi d'entrée** (jouer un coup)

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Consigne : C'est le tout premier coup de la partie et tu joues les blancs. Joue un coup qui prend de la place au milieu de l'échiquier.
- Solution : e2e4
- Réponses acceptées : e2e4, d2d4, g1f3, c2c4
- Bons coups mais hors sujet : e2e3, g2g3, b1c3
- Indice : Les 4 cases du milieu sont d4, e4, d5 et e5. Un de tes pions peut y aller.

**Écran 1 · Principe · Trois objectifs pour les 10 premiers coups**

Au début de la partie, tu as trois objectifs. Un : prendre de la place au « centre », les 4 cases du milieu (d4, e4, d5, e5). Deux : sortir tes pièces de leur case de départ. Trois : mettre ton roi à l'abri en roquant. Ces trois idées marchent dans toutes les ouvertures.

- Position : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` (C'est aux blancs de jouer)
- Cases colorées : d4, e4, d5, e5

**Écran 2 · Pourquoi · Pourquoi le centre**

Une pièce au centre contrôle beaucoup plus de cases qu'une pièce au bord. Ce cavalier en d4 atteint 8 cases. Dans un coin, il n'en atteindrait que 2. Celui qui tient le centre a plus de place pour ses pièces.

- Position : `rnbqkbnr/pppppppp/8/8/3NP3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 1` (C'est aux blancs de jouer)
- Flèches : d4→c6, d4→e6, d4→f5, d4→b5, d4→f3, d4→b3, d4→c2, d4→e2

**Écran 3 · Principe · Sortir ses pièces**

« Développer » une pièce, c'est la sortir de sa case de départ pour qu'elle participe au jeu. Commence par les cavaliers et les fous, vers le centre. Chaque pièce qui reste chez elle, c'est un joueur de moins dans ton équipe.

- Position : `rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2` (C'est aux blancs de jouer)
- Flèches : g1→f3, b1→c3, f1→c4

**Écran 4 · Principe · Mettre son roi à l'abri**

Quand ton cavalier et ton fou côté roi sont sortis, la voie est libre pour roquer. Fais-le tôt, en général avant le 10e coup. Un roi qui reste au milieu se fait attaquer dès que des lignes s'ouvrent.

- Position : `r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5` (C'est aux blancs de jouer)
- Flèches : e1→g1

**Écran 5 · Méthode · Les règles pratiques**

Quelques règles simples. Ne bouge pas deux fois la même pièce sans raison. Ne sors pas ta dame trop tôt. Ne va pas chercher un pion loin sur le côté si ça retarde tes autres pièces. Et quand toutes tes pièces sont sorties, tes deux tours doivent pouvoir se voir sur la rangée du fond.

- Position : `rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2` (C'est aux blancs de jouer)

**Écran 6 · Piège · La dame sortie trop tôt**

Sortir la dame très tôt semble agressif, mais l'adversaire la chasse en sortant ses pièces. Regarde.

- Position : `rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2` (C'est aux blancs de jouer)
- Démonstration :
  - `d1h5` : Les blancs sortent leur dame dès le 2e coup. Elle menace le pion en e5 et la case f7.
  - `b8c6` : Les noirs protègent leur pion en sortant un cavalier. Une pièce de plus dans le jeu.
  - `f1c4` : Les blancs menacent maintenant Dxf7, qui serait mat.
  - `g7g6` : Le pion chasse la dame. Les noirs gagnent du temps.
  - `h5f3` : La dame revient, et menace encore f7.
  - `g8f6` : Le cavalier bloque la ligne de la dame vers f7, en se développant. Les noirs ont sorti deux pièces ; la dame blanche a bougé trois fois.

**Écran 7 · Piège · Les règles cèdent devant les menaces**

Une règle d'ouverture ne passe jamais avant une menace. Ici, la dame et le fou blancs visent f7 : si les noirs continuent à sortir tranquillement leurs pièces, Dxf7 est mat. On répond d'abord à la menace, puis on reprend le développement.

- Position : `r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3` (C'est aux noirs de jouer)
- Flèches : h5→f7, c4→f7
- Cases colorées : f7

**Exercice 1** (jouer un coup)

- Position : `rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2` (C'est aux blancs de jouer)
- Consigne : Après 1.e4 e5, sors une pièce vers le centre.
- Solution : g1f3
- Réponses acceptées : g1f3, b1c3, f1c4
- Bons coups mais hors sujet : d2d4, g1e2
- Si réussi : Une pièce de plus dans le jeu, vers le centre. Bien.
- Indice : Tes cavaliers et ton fou en f1 peuvent sortir.

**Exercice 2** (jouer un coup)

- Position : `r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3` (C'est aux noirs de jouer)
- Consigne : Tu joues les noirs. Les blancs menacent Dxf7, mat. Protège-toi.
- Solution : g7g6
- Réponses acceptées : g7g6, d8e7, d8f6, g8h6
- Si réussi : La menace est parée. Ensuite, tu pourras chasser cette dame en sortant tes pièces.
- Indice : Tu peux chasser la dame, ou protéger f7 avec ta dame.

**À retenir** : Centre, pièces dehors, roi à l'abri. Mais une menace passe toujours avant.

---

### `tac-fork` · La fourchette

Mots introduits : fourchette

**Défi d'entrée** (jouer un coup)

- Position : `4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Tu joues les blancs. Ton cavalier en e4 peut attaquer deux pièces noires en même temps. Trouve le coup. Ça ne compte pas si tu te trompes.
- Solution : e4d6 e8d7 d6b5
- Réponses acceptées : e4d6
- Indice : Cherche une case d'où ton cavalier attaque à la fois le roi et la dame.

**Écran 1 · Principe · Deux attaques d'un coup**

Une « fourchette », c'est une seule pièce qui attaque deux pièces adverses en même temps. Ici, le cavalier en d6 attaque le roi noir (c'est échec) et la dame noire. L'adversaire ne joue qu'un coup : il doit sauver son roi, et il perd sa dame.

- Position : `4k3/8/3N4/1q6/8/8/8/4K3 b - - 1 1` (C'est aux noirs de jouer)
- Flèches : d6→e8, d6→b5
- Cases colorées : e8, b5

**Écran 2 · Exemple · La suite**

Regarde la fourchette en entier.

- Position : `4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `e4d6` : Le cavalier saute en d6 : échec au roi en e8, et attaque de la dame en b5.
  - `e8d7` : Le roi noir est obligé de bouger, il n'a pas le temps de sauver sa dame.
  - `d6b5` : Le cavalier prend la dame. 9 points gagnés en un coup.

**Écran 3 · Pourquoi · Pourquoi ça marche**

On ne joue qu'un coup à la fois. Face à deux problèmes, l'adversaire ne peut en régler qu'un. Et quand l'une des deux cibles est le roi, il n'a même pas le choix : il doit d'abord sortir de l'échec.

- Position : `4k3/8/3N4/1q6/8/8/8/4K3 b - - 1 1` (C'est aux noirs de jouer)

**Écran 4 · Quand y penser · Quand chercher une fourchette**

Cherche une fourchette quand deux pièces adverses importantes (le roi, la dame, une tour) ou deux pièces non protégées sont à portée d'une même case. Le cavalier est le roi des fourchettes, parce que son L est difficile à voir venir. Ici, la case c7 touche le roi et la tour.

- Position : `r3k3/6pp/8/3N4/8/8/6PP/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d5→c7
- Cases colorées : e8, a8

**Écran 5 · Quand y penser · La fourchette de pion**

Un simple pion peut faire une fourchette. Quand deux pièces adverses sont côte à côte avec une case vide entre elles, un pion qui avance sur cette case les attaque toutes les deux. Ici, d4 attaque les deux cavaliers, et aucun ne peut prendre le pion.

- Position : `4k3/p5pp/8/2n1n3/8/3P4/P5PP/1R2K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d3→d4
- Cases colorées : c5, e5

**Écran 6 · Quand y penser · La fourchette de dame**

La dame fait souvent des fourchettes en donnant échec et en attaquant en même temps une pièce non protégée. Ici, Dh5 met le roi en échec et attaque le fou en h4.

- Position : `4k3/6pp/8/8/7b/8/6PP/3Q2K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d1→h5, h5→e8, h5→h4

**Écran 7 · Méthode · La méthode**

Un : repère les cibles (roi, dame, tours, pièces non protégées). Deux : cherche une case d'où une de tes pièces les touche toutes les deux. Trois : vérifie que ta pièce ne se fait pas prendre gratuitement sur cette case. Quatre : après sa réponse, prends la deuxième cible.

- Position : `r3k3/6pp/8/3N4/8/8/6PP/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d5→c7

**Écran 8 · Piège · La fourchette qui ne marche pas**

Attention : si l'adversaire peut prendre la pièce qui fait la fourchette, les deux menaces disparaissent d'un coup. Vérifie toujours la case d'arrivée.

- Position : `4k3/4p3/8/1q6/4N3/8/8/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `e4d6` : Le cavalier fait la même fourchette en d6...
  - `e7d6` : ...mais cette fois, le pion noir en e7 le prend. Plus de fourchette, et tu as perdu ton cavalier.

**Exercice 1** (jouer un coup)

- Position : `r3k3/6pp/8/3N4/8/8/6PP/4K3 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Trouve la fourchette de cavalier.
- Solution : d5c7 e8d7 c7a8
- Réponses acceptées : d5c7
- Si réussi : Le cavalier en c7 attaque le roi et la tour. Le roi doit bouger, et tu prends la tour.
- Indice : Cherche une case qui touche à la fois e8 et a8.

**Exercice 2** (jouer un coup)

- Position : `4k3/p5pp/8/2n1n3/8/3P4/P5PP/1R2K3 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Les deux cavaliers noirs sont côte à côte. Un de tes pions peut les attaquer tous les deux.
- Solution : d3d4
- Réponses acceptées : d3d4
- Si réussi : Le pion attaque les deux cavaliers. Un seul pourra s'enfuir.
- Indice : Quel pion peut avancer juste entre les deux ?

**Exercice 3** (jouer un coup)

- Position : `4k3/6pp/8/8/7b/8/6PP/3Q2K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Le fou noir en h4 n'est protégé par personne. Trouve un échec de ta dame qui l'attaque en même temps.
- Solution : d1h5
- Réponses acceptées : d1h5, d1a4
- Si réussi : Échec au roi, et le fou est attaqué. Au prochain coup, tu le prends.
- Indice : Cherche une case d'où ta dame voit le roi en e8 et le fou en h4.

**À retenir** : Une pièce, deux cibles. Vérifie que ta pièce ne peut pas être prise sur sa case d'arrivée.

---

### `tac-pin` · Le clouage

Mots introduits : clouage

**Défi d'entrée** (jouer un coup)

- Position : `4k3/8/8/8/4n3/8/5P2/4RK2 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Le cavalier noir en e4 est devant son roi, sur la même colonne que ta tour. Il ne peut pas bouger. Attaque-le avec un pion pour le gagner.
- Solution : f2f3
- Réponses acceptées : f2f3
- Indice : Ton pion en f2 peut avancer et attaquer e4 en diagonale.

**Écran 1 · Principe · La pièce qui ne peut plus bouger**

Un « clouage », c'est quand une pièce adverse ne peut pas bouger parce qu'elle protège une pièce plus importante derrière elle. Ici, ta tour en e1, le cavalier noir en e4 et le roi noir en e8 sont sur la même colonne. Si le cavalier bouge, le roi est en échec : c'est interdit.

- Position : `4k3/8/8/8/4n3/8/5P2/4RK2 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : e1→e8
- Cases colorées : e4, e8

**Écran 2 · Exemple · On l'attaque encore**

Une pièce clouée est une cible parfaite : attaque-la une deuxième fois, de préférence avec un pion.

- Position : `4k3/8/8/8/4n3/8/5P2/4RK2 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `f2f3` : Ton pion attaque le cavalier. Le cavalier ne peut pas fuir, il est cloué. Au prochain coup, tu le prends.

**Écran 3 · Principe · Le clouage sur la dame**

Quand la pièce de derrière est le roi, la pièce clouée n'a pas le droit de bouger. Quand c'est la dame (comme ici : fou blanc en g5, cavalier noir en f6, dame noire en d8), elle a le droit, mais si elle bouge, le fou prend la dame.

- Position : `rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4` (C'est aux noirs de jouer)
- Flèches : g5→d8
- Cases colorées : f6, d8

**Écran 4 · Quand y penser · Quand chercher un clouage**

Cherche un clouage quand une pièce adverse se trouve sur la même ligne que son roi ou sa dame, et qu'une de tes pièces qui vont loin (tour, fou, dame) peut atteindre cette ligne.

- Position : `4k3/8/8/8/4n3/8/5P2/4RK2 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : e1→e8

**Écran 5 · Méthode · Le faux défenseur**

Le clouage sert aussi à repérer les faux défenseurs. Le pion noir en d6 a l'air de protéger le cavalier en e5. Mais il est cloué par ta tour sur son roi : s'il quittait la colonne d pour reprendre, son roi serait en échec. Il ne protège donc rien.

- Position : `3k4/8/3p4/4n3/8/8/4Q3/3R2K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d1→d8, d6→e5
- Cases colorées : d6

**Écran 6 · Piège · Une pièce clouée peut parfois prendre**

Attention : une pièce clouée peut avancer le long de la ligne du clouage, et parfois prendre la pièce qui la cloue.

- Position : `4k3/4r3/8/8/8/8/8/4RK2 b - - 0 1` (C'est aux noirs de jouer)
- Démonstration :
  - `e7e1` : La tour noire est clouée sur son roi, mais elle a le droit de bouger le long de la ligne. Elle prend ta tour : échec.
  - `f1e1` : Ton roi reprend. Échange de tours, rien de gagné.

**Exercice 1** (jouer un coup)

- Position : `3k4/8/3p4/4n3/8/8/4Q3/3R2K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Prends le cavalier en e5 avec ta dame. Le pion en d6 peut-il vraiment reprendre ?
- Solution : e2e5
- Réponses acceptées : e2e5
- Si réussi : Le pion ne peut pas reprendre : il est cloué sur son roi par ta tour. Cavalier gratuit.
- Indice : Ta dame descend la colonne e jusqu'au cavalier.

**À retenir** : Une pièce clouée ne peut pas bouger (ou pas sans perte). Attaque-la encore. Et vérifie toujours qu'un défenseur n'est pas cloué.

---

### `tac-discovered` · L'attaque à la découverte

Mots introduits : attaque à la découverte

**Défi d'entrée** (jouer un coup)

- Position : `4k3/8/8/7q/8/8/4B3/4R1K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Ta tour en e1 vise le roi noir, mais ton propre fou en e2 la bloque. Si ton fou bouge, ta tour donne échec. Trouve le coup de fou qui gagne le plus.
- Solution : e2h5
- Réponses acceptées : e2h5
- Indice : Ton fou peut aller n'importe où, ce sera échec. Il peut même prendre quelque chose.

**Écran 1 · Principe · Ouvrir une ligne**

Une « attaque à la découverte », c'est quand tu bouges une pièce et que tu ouvres la ligne d'une autre de tes pièces, qui se met à attaquer. Ici, ton fou en e2 cache ta tour. Dès que le fou bouge, la tour attaque le roi noir.

- Position : `4k3/8/8/7q/8/8/4B3/4R1K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : e1→e8
- Cases colorées : e2

**Écran 2 · Exemple · Deux menaces en un coup**

Regarde : la pièce qui bouge attaque d'un côté, la pièce découverte de l'autre.

- Position : `4k3/8/8/7q/8/8/4B3/4R1K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `e2h5` : Le fou prend la dame en h5. En partant, il a découvert la tour : le roi noir est en échec. Les noirs doivent s'occuper de leur roi, ils ne peuvent pas reprendre le fou. Tu as gagné la dame.

**Écran 3 · Pourquoi · Pourquoi c'est si fort**

L'adversaire regarde la pièce qui bouge, et oublie celle qui était cachée derrière. Quand la pièce découverte donne échec, la pièce qui bouge est libre d'aller où elle veut, même sur une case protégée : l'adversaire n'a pas le temps de la prendre.

- Position : `4k3/8/8/7q/8/8/4B3/4R1K1 w - - 0 1` (C'est aux blancs de jouer)

**Écran 4 · Quand y penser · Quand la chercher**

Cherche-la quand une de tes pièces qui vont loin (tour, fou, dame) vise une pièce adverse importante, mais qu'une de tes propres pièces est devant. Ici, ton fou en b2 vise la dame noire en h8, et ton cavalier en d4 est sur le chemin.

- Position : `7q/pp2k3/8/8/3N4/8/1B3PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : b2→h8
- Cases colorées : d4

**Écran 5 · Méthode · Trouver le bon coup de la pièce de devant**

Le cavalier doit partir. Mais où ? Choisis une case où il crée une deuxième menace, idéalement un échec. Ici, en f5, il met le roi noir en échec : les noirs n'auront pas le temps de sauver leur dame.

- Position : `7q/pp2k3/8/8/3N4/8/1B3PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d4→f5, b2→h8

**Écran 6 · Piège · Attention aux découvertes contre toi**

Ça marche aussi contre toi. Quand une pièce adverse se trouve entre une de ses pièces longues et ton roi ou ta dame, attends-toi à ce qu'elle bouge avec une menace. Ici, avec les noirs, il fallait mettre la dame à l'abri avant que le fou ne bouge.

- Position : `4k3/8/8/7q/8/8/4B3/4R1K1 b - - 0 1` (C'est aux noirs de jouer)
- Flèches : e1→e8

**Exercice 1** (jouer un coup)

- Position : `7q/pp2k3/8/8/3N4/8/1B3PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Ton fou en b2 vise la dame noire en h8, mais ton cavalier en d4 le bloque. Bouge ton cavalier avec un échec pour gagner la dame.
- Solution : d4f5
- Réponses acceptées : d4c6, d4f5
- Si réussi : Échec au roi, et ton fou attaque maintenant la dame. Les noirs doivent sauver leur roi : la dame tombe.
- Indice : Cherche une case d'où ton cavalier attaque le roi en e7.

**À retenir** : Une pièce cachée derrière une autre attaque dès que la pièce de devant bouge. Fais bouger la pièce de devant avec une deuxième menace.

---

### `mat-back-rank` · Le mat du couloir

Mots introduits : mat du couloir, case de fuite

**Défi d'entrée** (jouer un coup)

- Position : `3r2k1/5ppp/8/8/8/8/5PPP/3RR1K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Le roi noir est coincé derrière ses trois pions. Fais mat en un coup.
- Solution : d1d8
- Réponses acceptées : d1d8
- Indice : La seule pièce qui protège la dernière rangée noire est la tour en d8.

**Écran 1 · Principe · Le roi coincé par ses propres pions**

Après le roque, le roi est souvent derrière trois pions. C'est un bon abri... sauf qu'il ne peut plus s'échapper vers l'avant. Une tour ou une dame qui arrive sur la dernière rangée le met en échec, et il n'a aucune case pour fuir : c'est le « mat du couloir ».

- Position : `6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1` (C'est aux blancs de jouer)
- Cases colorées : f7, g7, h7

**Écran 2 · Exemple · Le mat**

C'est le mat le plus fréquent dans les vraies parties, à presque tous les niveaux.

- Position : `6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `a1a8` : La tour arrive sur la dernière rangée : échec. Le roi ne peut ni avancer (ses pions), ni bouger sur la rangée (la tour la surveille). Mat.

**Écran 3 · Quand y penser · Quand le chercher**

Cherche-le quand le roi adverse est derrière ses pions intacts et que sa dernière rangée n'est protégée que par une seule pièce, ou aucune. Ici, seule la tour en d8 protège la rangée noire. Si tu la prends avec échec, plus personne ne protège.

- Position : `3r2k1/5ppp/8/8/8/8/5PPP/3RR1K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : d1→d8
- Cases colorées : d8

**Écran 4 · Méthode · Protège-toi : la case de fuite**

Le même danger existe pour ton roi. Pour t'en protéger, avance un des pions devant lui (souvent le pion h) au bon moment. Ça crée une « case de fuite » : une case libre où ton roi peut s'échapper en cas d'échec sur la dernière rangée.

- Position : `6k1/5ppp/8/8/8/7P/5PP1/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : g1→h2
- Cases colorées : h2

**Écran 5 · Piège · Ce n'est mat que s'il ne peut pas fuir**

Avant de jouer un échec sur la dernière rangée, vérifie que le roi n'a pas de case de fuite.

- Position : `6k1/5pp1/7p/8/8/8/8/R5K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `a1a8` : La tour donne échec sur la dernière rangée...
  - `g8h7` : ...mais le pion h a déjà avancé : le roi s'échappe en h7. Ce n'était qu'un échec.

**Exercice 1** (jouer un coup)

- Position : `6k1/5ppp/8/8/8/8/5PPP/r1R3K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : La tour noire en a1 attaque ta tour en c1. Attention : ta tour est la seule à protéger ta dernière rangée. Trouve le meilleur coup.
- Solution : c1a1
- Réponses acceptées : c1a1
- Si réussi : Tu prends sa tour. Si ta tour avait quitté ta dernière rangée, la sienne pouvait y descendre et faire mat.
- Indice : Que se passe-t-il si ta tour s'en va ailleurs ?

**À retenir** : Un roi derrière trois pions intacts craint le mat sur la dernière rangée. Attaque-la chez lui, crée une case de fuite chez toi.

---

### `tac-remove-defender` · Éliminer le défenseur

Mots introduits : défenseur

**Défi d'entrée** (jouer un coup)

- Position : `6k1/3r1ppp/5n2/1Q4B1/8/7P/5PP1/R5K1 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : La tour noire en d7 est attaquée par ta dame, mais le cavalier en f6 la protège. Trouve comment la gagner.
- Solution : g5f6
- Réponses acceptées : g5f6
- Indice : Et si le cavalier n'était plus là ?

**Écran 1 · Principe · Une seule pièce tient tout**

Le « défenseur », c'est la pièce qui protège une autre pièce. Quand une pièce adverse n'est protégée qu'une seule fois, il suffit de faire disparaître ce défenseur pour qu'elle devienne gratuite. Ici, la tour en d7 ne tient que grâce au cavalier en f6. Ta tour en a1 garde ta dernière rangée.

- Position : `6k1/3r1ppp/5n2/1Q4B1/8/7P/5PP1/R5K1 w - - 0 1` (C'est aux blancs de jouer)
- Flèches : b5→d7, f6→d7
- Cases colorées : f6

**Écran 2 · Exemple · On prend le défenseur**

Regarde comment on fait tomber la tour.

- Position : `6k1/3r1ppp/5n2/1Q4B1/8/7P/5PP1/R5K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `g5f6` : Ton fou prend le cavalier qui protégeait la tour.
  - `g7f6` : Le pion noir reprend ton fou. Fou contre cavalier : pour l'instant, c'est égal.
  - `b5d7` : Mais la tour n'a plus de défenseur : ta dame la prend. Tu as gagné 5 points.

**Écran 3 · Méthode · La méthode**

Un : pour chaque pièce adverse intéressante, cherche qui la protège. Deux : s'il n'y a qu'un défenseur, cherche à le prendre, à l'échanger ou à le chasser. Trois : prends la cible. Quatre : fais le compte des points de toute l'opération.

- Position : `6k1/3r1ppp/5n2/1Q4B1/8/7P/5PP1/R5K1 w - - 0 1` (C'est aux blancs de jouer)

**Écran 4 · Piège · Vérifie ta propre sécurité**

Avant de lancer l'opération, fais toujours la vérification : après mon coup, qu'est-ce qu'il peut faire ? Regarde la même idée dans une position un peu différente.

- Position : `6k1/3r1ppp/5n2/1Q4B1/8/8/5PPP/6K1 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `g5f6` : Même idée, mais ici ton roi n'a pas de case de fuite et aucune tour ne garde ta dernière rangée.
  - `d7d1` : La tour noire s'échappe en descendant en d1 : échec sur ta dernière rangée.
  - `b5f1` : Ta dame doit revenir se mettre devant pour éviter le mat...
  - `d1f1` : ...et la tour la prend, avec échec.
  - `g1f1` : Ton roi reprend la tour.
  - `g7f6` : Et le pion reprend ton fou. Bilan : tu as perdu ta dame et ton fou contre une tour et un cavalier.

**À retenir** : Si une pièce adverse n'est protégée qu'une fois, fais disparaître son défenseur. Mais vérifie d'abord ta propre sécurité.

---

### `fin-opposition` · Roi et pion contre roi

Mots introduits : finale, opposition

**Défi d'entrée** (jouer un coup)

- Position : `8/4k3/8/2K5/8/4P3/8/8 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Fin de partie : il ne reste que les rois et ton pion en e3. Un seul coup gagne. Lequel ? Indice : ton roi doit passer devant ton pion.
- Solution : c5d5
- Réponses acceptées : c5d5
- Indice : Ton roi doit aller vers le haut, juste devant le pion, avant le roi noir.

**Écran 1 · Pourquoi · La finale la plus fréquente**

La « finale », c'est la fin de partie, quand il reste peu de pièces. La plus fréquente : un roi et un pion contre un roi. Si tu la connais, ton pion devient une dame. Sinon, c'est souvent nulle. Le secret : c'est ton roi qui fait le travail, pas le pion.

- Position : `8/4k3/8/2K5/8/4P3/8/8 w - - 0 1` (C'est aux blancs de jouer)

**Écran 2 · Principe · Le roi passe devant**

Pour un pion encore sur sa moitié d'échiquier, il existe trois cases magiques : celles qui sont deux rangées devant lui. Pour ton pion en e3, ce sont d5, e5 et f5. Si ton roi atteint l'une d'elles, tu gagnes à coup sûr, quoi que fasse l'adversaire.

- Position : `8/4k3/8/2K5/8/4P3/8/8 w - - 0 1` (C'est aux blancs de jouer)
- Cases colorées : d5, e5, f5

**Écran 3 · Principe · L'opposition**

Quand les deux rois sont face à face avec une case vide entre eux, on parle d'« opposition ». Aucun ne peut avancer vers l'autre. Celui qui DOIT jouer est obligé de s'écarter et laisse passer l'autre. Ici, c'est aux noirs de jouer : leur roi doit céder la place, et les blancs gagnent.

- Position : `8/8/8/4k3/8/4K3/4P3/8 b - - 0 1` (C'est aux noirs de jouer)
- Cases colorées : e3, e5

**Écran 4 · Exemple · Roi sur la 6e rangée, devant son pion**

Une règle à retenir : si ton roi est devant ton pion sur la 6e rangée, tu gagnes toujours (sauf avec un pion sur le bord, a ou h).

- Position : `4k3/8/4K3/4P3/8/8/8/8 w - - 0 1` (C'est aux blancs de jouer)
- Démonstration :
  - `e6d6` : Le roi blanc se décale pour laisser avancer le pion.
  - `e8d8` : Le roi noir reste en face.
  - `e5e6` : Le pion avance, protégé par le roi.
  - `d8e8` : Le roi noir revient devant le pion.
  - `e6e7` : Le pion avance encore, avec échec.
  - `e8f7` : Le roi noir doit s'écarter.
  - `d6d7` : Le roi blanc protège la case e8 : au prochain coup, le pion devient une dame.

**Écran 5 · Piège · Le piège du pat**

Attention en poussant le pion. Ici, c'est aux noirs de jouer : leur roi n'est pas en échec mais il n'a aucune case libre. C'est pat, nulle. Pour l'éviter, garde ton roi à côté du pion, pas derrière.

- Position : `4k3/4P3/4K3/8/8/8/8/8 b - - 0 1` (C'est aux noirs de jouer)
- Cases colorées : d7, f7, d8, f8

**Écran 6 · Piège · Le pion du bord**

Exception importante : avec un pion sur le bord (colonne a ou h), si le roi adverse arrive dans le coin devant le pion, c'est nulle. Ton roi ne peut jamais le chasser du coin sans faire pat.

- Position : `7k/8/6K1/7P/8/8/8/8 w - - 0 1` (C'est aux blancs de jouer)
- Cases colorées : h8

**Exercice 1** (jouer un coup)

- Position : `8/8/3k4/8/8/2K1P3/8/8 w - - 0 1` (C'est aux blancs de jouer)
- Consigne : Un seul coup gagne. Fais avancer ton roi devant ton pion, face au roi noir.
- Solution : c3d4
- Réponses acceptées : c3d4
- Si réussi : Ton roi passe devant le pion. Le roi noir ne pourra plus l'arrêter.
- Indice : Ton roi doit monter vers le centre, devant le pion.

**À retenir** : En finale, le roi passe devant le pion. Vise les cases deux rangées devant ton pion. Méfie-toi du pat et du pion du bord.

---

### `str-worst-piece` · Quand il n'y a rien à faire : améliore ta pire pièce

Mots introduits : plan

**Défi d'entrée** (jouer un coup)

- Position : `r1bq1rk1/pp2bppp/2n1pn2/3p4/3P4/2PB1N2/PP3PPP/RNBQ1RK1 w - - 0 8` (C'est aux blancs de jouer)
- Consigne : Aucune menace, rien à prendre. Ton cavalier en b1 n'est jamais sorti. Fais-le entrer dans le jeu.
- Solution : b1d2
- Réponses acceptées : b1d2
- Bons coups mais hors sujet : f1e1, d1e2, f3e5, b2b4, c1f4, h2h3
- Indice : Le cavalier en b1 peut aller en d2, puis plus tard vers f1, g3 ou e5.

**Écran 1 · Principe · Le cas le plus fréquent**

Souvent, il n'y a rien à prendre et aucune attaque possible. Que jouer ? Un « plan », c'est une idée pour les prochains coups. Le plan le plus simple et le plus utile : trouve ta pièce qui joue le moins bien, et donne-lui une meilleure case.

- Position : `r1bq1rk1/pp2bppp/2n1pn2/3p4/3P4/2PB1N2/PP3PPP/RNBQ1RK1 w - - 0 8` (C'est aux blancs de jouer)

**Écran 2 · Méthode · Que fait chaque pièce ?**

Pour chacune de tes pièces, demande-toi : « Que fait-elle ? » Ton cavalier en b1 et ton fou en c1 n'ont jamais bougé : ils ne font rien. Ce sont tes pires pièces. Toutes les autres sont déjà sorties.

- Position : `r1bq1rk1/pp2bppp/2n1pn2/3p4/3P4/2PB1N2/PP3PPP/RNBQ1RK1 w - - 0 8` (C'est aux blancs de jouer)
- Cases colorées : b1, c1

**Écran 3 · Méthode · Trouve la meilleure case**

Cherche une case où la pièce surveille le centre ou s'approche du roi adverse. Parfois il faut plusieurs coups pour l'y amener. Ici, le cavalier va d'abord en d2. Plus tard, quand ta tour aura quitté f1, il pourra continuer vers f1 puis g3, près du roi noir.

- Position : `r1bq1rk1/pp2bppp/2n1pn2/3p4/3P4/2PB1N2/PP3PPP/RNBQ1RK1 w - - 0 8` (C'est aux blancs de jouer)
- Flèches : b1→d2

**Écran 4 · Piège · D'abord la vérification**

Améliorer une pièce, c'est ce qu'on fait quand il n'y a RIEN d'urgent. Avant, fais toujours la vérification : a-t-il une menace ? Ai-je une prise ou une attaque qui gagne quelque chose ? Si la réponse est non aux deux, alors seulement, améliore ta pire pièce.

- Position : `r1bq1rk1/pp2bppp/2n1pn2/3p4/3P4/2PB1N2/PP3PPP/RNBQ1RK1 w - - 0 8` (C'est aux blancs de jouer)

**À retenir** : Rien à prendre, rien à craindre ? Trouve ta pièce qui ne fait rien et donne-lui une meilleure case.

---
