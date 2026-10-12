# BRIEF CODEX : refonte de « Premier coup »

> À placer à la racine du repo `elisalgrd/premier-coup` avec `CURRICULUM.md`.
> Lis les deux fichiers en entier avant d'écrire la moindre ligne de code.
> `CURRICULUM.md` est la source de vérité du contenu pédagogique. Ce brief est la source de vérité du produit et de l'architecture.

---

## 0. TL;DR pour Codex

Premier coup est une PWA statique (GitHub Pages, ES modules vanilla, pas de build) pour apprendre les échecs en français. Elle contient beaucoup de contenu, mais il est **éclaté en 9 systèmes parallèles qui se répètent**, les leçons sont **bavardes et passives**, les problèmes sont **peu nombreux et artificiels**, et il manque **la boucle qui fait vraiment progresser** : jouer, analyser ses propres erreurs, les retravailler en répétition espacée.

Ta mission, en 6 phases livrables séparément :

1. **Unifier** tout le contenu dans un seul catalogue de données (`/curriculum`), construit à partir de `CURRICULUM.md`.
2. **Réécrire le format de leçon** : court, actif (l'élève essaie avant qu'on lui explique), notation algébrique et coordonnées partout.
3. **Remplacer la banque de problèmes** par un sous-ensemble de la base Lichess (CC0, 6 M de problèmes notés et taggés), classé par thème du catalogue.
4. **Ajouter la répétition espacée** sur tout : principes, problèmes ratés, erreurs de partie.
5. **Ajouter la boucle de jeu** : jouer contre Stockfish à niveau réglable, importer ses parties Lichess/Chess.com, analyse automatique, génération de « mes erreurs » en problèmes.
6. **Refaire la navigation et le suivi de progression** autour du catalogue (arbre de compétences + classement par thème).

---

## 1. Contexte produit

**Utilisatrice cible** : adulte francophone débutante à intermédiaire (0 à ~1500 Elo Lichess), qui veut progresser vite avec peu de temps (20 à 45 min par jour), sur mobile et desktop.

**Promesse** : « Les 20 % de connaissances qui décident 80 % des parties, appris dans le bon ordre, pratiqués jusqu'au réflexe. »

**Principes pédagogiques non négociables** (ils dictent toutes les décisions de design) :

1. **Récupération active avant explication.** On montre la position, on demande « qu'est-ce que tu jouerais ? », l'élève essaie, puis on explique. Jamais l'inverse sur plus d'un écran.
2. **Pratique massive et variée.** Un principe compris sans 30 à 100 répétitions n'est pas acquis. Les problèmes sont le cœur de l'app, les leçons sont la porte d'entrée.
3. **Répétition espacée.** Tout ce qui a été raté revient (J+1, J+3, J+7, J+21...).
4. **Entrelacement.** Après la phase d'apprentissage d'un thème, les séances mélangent les thèmes, parce qu'en partie personne n'annonce le motif.
5. **Transfert en partie réelle.** Les erreurs de l'élève dans ses propres parties sont la meilleure source d'exercices.
6. **Hiérarchie 20/80.** Sous 1200, l'immense majorité des parties se décide sur une pièce laissée en prise ou une tactique en 1 à 2 coups. Donc : vision de l'échiquier et routine anti-gaffe d'abord, tactiques ensuite, finales essentielles, puis stratégie. Les ouvertures se limitent aux principes et à un mini-répertoire.
7. **Langage précis et court.** Notation algébrique (`Cf3`, `Fxf7+`) toujours accompagnée des flèches et cases surlignées. On n'évite jamais le nom des cases : savoir lire la notation est un prérequis pour progresser (livres, Lichess, analyses).

---

## 2. Audit de l'existant (ce que j'ai trouvé dans le repo)

### 2.1 Stack et structure

- Site statique, `index.html` + `app.js` (47 Ko, 137 lignes très longues) + ~35 modules ES.
- `chess.js` (règles) et `engine.js` (minimax maison profondeur 2 : trop faible dès que l'élève progresse, et mal calibré pour un vrai débutant car il ne fait pas d'erreurs « humaines » comme laisser une pièce en prise).
- `sw.js` : service worker qui précache tous les modules.
- Médias : ~370 Mo dans le repo (`coach-audio`, `coach-audio-male`, `coach-audio-male-neural`, `deep-audio`, `media`, `media-male`, `media-male-neural`, `observation-audio`, `videos`). Trois variantes de narrateur pour le même contenu.
- Sauvegarde dans `localStorage` clé `premier-coup-v1`.
- Versioning incohérent : URL en `?v=18`, assets en `?v=19`, cache SW en `premier-coup-v20`.

### 2.2 Contenu : 9 systèmes qui se recouvrent

| Module | Export | Volume | Sujets |
|---|---|---|---|
| `content.js` | `lessons` | 16 leçons texte (4 paragraphes + 1 QCM) | pièces, échec, valeur, réflexe, fourchette, clouage, mat du couloir, ouverture, finale, règles spéciales, calcul, plans blancs/noirs, conversion, amélioration, analyse |
| `content.js` | `puzzles` | 133 problèmes | 17 thèmes, niveaux 1 à 3 (seulement 5 au niveau 3) |
| `puzzle-bank.js` | `puzzleBank` | 79 variantes | mêmes thèmes |
| `academy.js` | `courses` | 14 cours « frames » | captures, fourchettes, clouages, mat du couloir, italienne, mat du berger, pat, D+R vs R, roi, centre, développement, dame, activité, roi en finale |
| `foundations.js` | `foundationCourses` | 6 | doublon de 6 cours d'`academy.js` |
| `essential-skills.js` | `essentialSkills` | 6 « idées 20/80 » | doublon de 6 cours d'`academy.js` |
| `deep-lessons.js` | `deepLessons` | 7 « grands cours » audio | doublon des mêmes thèmes |
| `advanced.js` | `advancedLessons`, `strategies`, `combinations` | 6 + 4 + 4 | doublon partiel de `content.js` |
| `training.js` | `trainingLessons` | 12 | doublon de `content.js` |
| `video-courses.js` | `videoCourses` | 16 vidéos (+9 dupliquées dans `extraVideoCourses`) | thèmes + 6 ouvertures + 3 stratégies |
| `song-method.js` | `songPrinciples` | 6 principes (Julien Song) | menace adverse, indices, recherche active, ouverture, calcul, révision |

**Conséquence** : le même thème « captures » existe sous 6 titres différents (« Prendre ce qui est vraiment gratuit », « Prendre sans se faire reprendre », « Voir le danger avant de chercher le beau coup », « Reconnais une bonne capture », « Voir les menaces et éviter les cadeaux »...). L'accueil annonce « 7 grands cours », le parcours « 6 idées », le classeur « 14 leçons ». L'utilisatrice ne sait pas où elle en est, et le code compte 17 vues (`today`, `learn`, `academy`, `coach`, `deep`, `essential`, `lesson-media`, `video`, `observation`, `method`, `reference`, `strategy`, `drills`, `puzzles`, `play`, `progress`, `settings`).

### 2.3 Problèmes pédagogiques

1. **Couverture trop étroite.** Tactiques couvertes : fourchette, clouage, enfilade (peu), mat du couloir, mat du berger. **Absents** : attaque à la découverte, échec double, élimination du défenseur, surcharge, déviation, attraction, pièce piégée, coup intermédiaire, rayon X, interception, dégagement, mat à l'étouffée, mat arabe, Anastasia, Boden, sacrifice grec, opposition, règle du carré, Lucena, Philidor, structures de pions, avant-postes, colonnes ouvertes, bon/mauvais fou, prophylaxie...
2. **Leçons passives et trop longues.** Exemple réel du cours 1, chapitre 1 : « Installe-toi. Dans ce cours, tu n'as aucun coup à deviner. [...] Tu n'as pas besoin de connaître les noms des cases. » Le premier écran fait 90 mots et ne contient aucune information d'échecs. Le principe réel tient en une phrase. Les cours affichent explicitement « tu n'as aucun coup à deviner » : c'est l'inverse de ce qui fait apprendre.
3. **Refus de la notation.** Les textes décrivent les pièces par leur position visuelle (« vers le coin en bas à droite », « un peu plus haut à gauche ») au lieu de « le roi en g1 ». L'échiquier de leçon n'affiche pas les coordonnées. Résultat : l'élève ne pourra jamais lire un livre, une analyse Lichess ou une vidéo YouTube.
4. **QCM triviaux.** Questions à 2 réponses dont une est évidemment fausse (« Le roi et une tour / Le roi et un fou »). Aucun QCM sur l'échiquier.
5. **Problèmes artificiels et trop peu nombreux.** 212 positions écrites à la main, souvent avec 3 ou 4 pièces sur l'échiquier (`7k/8/8/3q4/8/8/8/3R2K1`). Aucune position issue de vraies parties, donc aucun transfert. Pas de chronomètre, pas de classement par thème.
6. **Friction.** « Commencer les 5 problèmes » lance d'abord une leçon audio de 7 min (« La leçon vient toujours avant le problème »). On ne peut pas juste s'entraîner.
7. **Pas de vraie boucle de jeu.** La vue `play` existe mais n'est pas dans la navigation. Pas d'import de parties, pas d'analyse, pas d'exercices tirés de ses propres erreurs.
8. **Progression floue.** Pas de classement estimé, pas de maîtrise par thème, pas de file de révision visible.

### 2.4 Ce qui est bien et à garder

- Le ton bienveillant, le tutoiement, la logique « je prends, il reprend, qu'est-ce qui reste ? ».
- La routine « Avant chaque coup » (menace adverse, mes possibilités, sa réponse) : c'est le bon réflexe n°1, à garder et renforcer (voir `CURRICULUM.md` B1).
- Le rendu de l'échiquier, les flèches, les cases marquées, les pièces vectorielles.
- Le principe de niveaux adaptatifs (`adaptive.js`) : à remplacer par un vrai classement par thème, mais l'intention est bonne.
- La vidéothèque : à garder comme ressource optionnelle rattachée aux fiches du catalogue.
- Les références Julien Song : à intégrer comme « sources » dans les fiches concernées, pas comme un système séparé.

---

## 3. Produit cible

### 3.1 Navigation (4 onglets, pas plus)

| Onglet | Rôle |
|---|---|
| **Aujourd'hui** | La séance du jour générée automatiquement (voir 3.2). Un seul gros bouton « Commencer ». |
| **Catalogue** | L'arbre de compétences : tous les principes et stratégies de `CURRICULUM.md`, classés par palier et priorité, avec état de maîtrise. Recherche + filtres. Chaque entrée ouvre sa fiche. |
| **S'entraîner** | Accès direct sans leçon préalable : problèmes mélangés, problèmes par thème, révisions dues, « mes erreurs », exercices de vision, finales à jouer contre le moteur, partie contre le moteur, import de parties. |
| **Progrès** | Classement estimé global et par thème, série, temps passé, maîtrise par palier, historique des erreurs récurrentes. |

Réglages accessibles via l'icône en haut (voix, thème, taille d'échiquier, export/import de sauvegarde, pseudo Lichess/Chess.com).

Supprimer toutes les autres vues. Les « grands cours », « essentiels », « méthode », « académie », « classeur » deviennent tous des fiches du Catalogue.

### 3.2 La séance du jour (algorithme)

Durée cible paramétrable (15 / 25 / 45 min). Composition par défaut pour 25 min :

1. **Révisions dues** (max 8 min) : cartes de répétition espacée arrivées à échéance, en priorité les erreurs de partie, puis problèmes ratés, puis fiches de principes.
2. **Nouvelle notion** (5 min) : la prochaine fiche non vue du palier en cours, dans l'ordre de priorité du catalogue. Si une fiche est en état « compris » mais pas « maîtrisé », on la consolide au lieu d'en ouvrir une nouvelle (max 2 notions en cours simultanément).
3. **Pratique ciblée** (7 min) : 8 à 12 problèmes du thème de la notion du jour, à ton classement de thème.
4. **Pratique mélangée** (5 min) : 5 à 8 problèmes tirés de tous les thèmes déjà vus, pondérés vers les thèmes les plus faibles.
5. **Clôture** (30 s) : récap des 2 ou 3 erreurs du jour avec leur principe, et le prochain objectif.

Si l'utilisatrice a importé une partie récente non analysée, proposer en tête : « Ta partie d'hier : 3 moments clés à revoir (4 min) ».

### 3.3 Format d'une fiche du catalogue (remplace TOUS les formats de leçon actuels)

Chaque fiche suit **exactement** cette structure. Écrans courts (≤ 60 mots de texte par écran, hors notation). Audio optionnel, jamais requis.

1. **Défi d'entrée (prédiction).** Une position. « Trait aux blancs. Que joues-tu ? » L'élève joue un coup sur l'échiquier. Pas de pénalité. Ça crée la question que la leçon va résoudre.
2. **Le principe en une phrase.** En gros, mémorisable. Ex. : « Avant de prendre, compte qui reprend. »
3. **Pourquoi ça marche.** 2 à 4 phrases maximum, avec l'échiquier animé.
4. **Comment le reconnaître (signaux).** 2 à 4 indices visuels concrets qui doivent déclencher la recherche du motif en partie.
5. **La méthode.** 2 à 4 étapes actionnables.
6. **Exemple guidé interactif.** La position du défi d'entrée rejouée : l'élève trouve le coup avec indices progressifs (indice 1 : la pièce à bouger surlignée ; indice 2 : la case cible ; indice 3 : solution animée).
7. **Le piège / l'exception.** Le contre-exemple où le principe ne marche pas, en position.
8. **Pratique.** 10 problèmes du thème (base Lichess), difficulté croissante.
9. **Validation.** La fiche passe en « maîtrisée » quand l'élève réussit ≥ 80 % sur 15 problèmes inédits du thème, au premier essai, sur deux jours différents.
10. **Carte de révision** créée automatiquement : le principe + une position test.

Le texte de chaque fiche est dans `CURRICULUM.md`. Codex doit le **découper** dans ce format, pas le réécrire en plus long.

### 3.4 États de maîtrise d'une fiche

`verrouillée` (prérequis non vus, mais consultable quand même) → `nouvelle` → `vue` (fiche parcourue) → `en pratique` (≥ 10 problèmes tentés) → `maîtrisée` (critère 3.3.9) → `à revoir` (si le taux de réussite glissant sur les 20 derniers problèmes du thème passe sous 65 %).

Affichage : pastille de couleur + barre de progression dans le Catalogue.

---

## 4. Architecture technique cible

### 4.1 Contraintes

- **Rester déployable sur GitHub Pages sans serveur.** Pas de backend. Pas d'en-têtes COOP/COEP possibles, donc pas de `SharedArrayBuffer`.
- Tu peux introduire **Vite** comme outil de build si ça simplifie (hash de fichiers, découpage), à condition que `npm run build` produise un dossier `dist/` déployable par une GitHub Action. Sinon, rester en ES modules natifs avec une constante de version unique. Choisis et justifie dans `ARCHITECTURE.md`.
- Mobile-first. Échiquier jouable au doigt (tap-tap ET glisser).
- Hors ligne : l'app shell, le catalogue et les problèmes déjà téléchargés fonctionnent sans réseau.
- Aucune donnée personnelle envoyée ailleurs que vers les API publiques Lichess/Chess.com quand l'utilisatrice saisit son pseudo.

### 4.2 Arborescence proposée

```
/
├── index.html
├── src/
│   ├── main.js                  # bootstrap, routeur (4 routes + fiche + séance)
│   ├── state/
│   │   ├── store.js             # état + persistance IndexedDB (fallback localStorage)
│   │   ├── migrate.js           # migration depuis premier-coup-v1
│   │   └── schema.js            # validation
│   ├── chess/
│   │   ├── chess.js             # lib existante
│   │   ├── board.js             # composant échiquier unique (coordonnées, flèches, marques, drag, promotion)
│   │   ├── engine.js            # wrapper Stockfish (Web Worker) + moteur maison pour niveaux très bas
│   │   └── analysis.js          # analyse de partie, classification des erreurs
│   ├── learn/
│   │   ├── lesson-player.js     # joue une fiche selon le format 3.3
│   │   ├── puzzle-player.js     # joue un problème (format Lichess)
│   │   ├── session.js           # génère la séance du jour (3.2)
│   │   ├── srs.js               # répétition espacée
│   │   └── rating.js            # classement global + par thème
│   ├── play/
│   │   ├── game.js              # partie contre le moteur
│   │   └── import.js            # import Lichess / Chess.com / PGN
│   ├── views/                   # today.js, catalogue.js, train.js, progress.js, settings.js
│   └── ui/                      # composants partagés
├── curriculum/
│   ├── index.json               # liste ordonnée des fiches (id, palier, priorité, prérequis)
│   └── entries/<id>.json        # une fiche = un fichier
├── data/puzzles/<theme>.json    # shards générés par le script
├── scripts/
│   ├── build-puzzles.mjs        # extraction base Lichess
│   ├── validate-curriculum.mjs  # validation de toutes les positions
│   └── migrate-legacy.mjs       # aide à récupérer les bons textes existants
├── media/                       # audio/vidéo conservés (voir 4.7)
└── tests/
```

### 4.3 Schéma d'une fiche (`curriculum/entries/<id>.json`)

```json
{
  "id": "tac-fork",
  "title": "La fourchette",
  "tier": 2,
  "priority": "S",
  "domain": "tactique",
  "prerequisites": ["vis-attacked-squares", "proc-blunder-check"],
  "principle": "Une seule pièce attaque deux cibles : l'adversaire ne peut en sauver qu'une.",
  "why": ["...", "..."],
  "signals": ["...", "..."],
  "method": ["...", "..."],
  "pitfall": { "text": "...", "fen": "...", "line": ["..."] },
  "entryChallenge": { "fen": "4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1", "solution": ["e4d6", "e8d7", "d6b5"], "prompt": "Trait aux blancs. Gagne du matériel." },
  "guided": [
    { "fen": "...", "text": "...", "arrows": [["e4","d6"]], "marks": ["e8","b5"], "move": null }
  ],
  "lichessThemes": ["fork"],
  "ratingBand": [400, 1600],
  "mastery": { "attempts": 15, "accuracy": 0.8, "distinctDays": 2 },
  "sources": [{ "label": "...", "url": "..." }],
  "videoId": "course-forks",
  "glossary": ["fourchette", "échec"]
}
```

Règles :
- `id` préfixé par domaine : `vis-` vision, `proc-` processus de pensée, `tac-` tactique, `mat-` motifs de mat, `fin-` finales, `ouv-` ouvertures, `str-` stratégie, `meta-` méthode d'entraînement.
- Les coups dans les données sont en **UCI** (`e4d6`), affichés en **SAN français** (`Cd6+`). Écrire un utilitaire `sanFr()` : K→R, Q→D, R→T, B→F, N→C.
- Toutes les positions sont validées par `scripts/validate-curriculum.mjs` (voir 7).

### 4.4 Problèmes : base Lichess

Source : `https://database.lichess.org/lichess_db_puzzle.csv.zst` (licence CC0, ~6 M de problèmes).

Colonnes : `PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags,DailyDate`.

**Attention au format** : le `FEN` est la position **avant** le coup de l'adversaire. Le premier coup de `Moves` est le coup adverse, à animer (400 ms) avant de rendre la main à l'élève. La solution commence au deuxième coup. Coups en UCI. L'élève joue un coup sur deux, le moteur de l'app joue les réponses adverses de la ligne. Accepter aussi tout coup qui donne mat si le problème est un `mateIn*` (règle Lichess).

`scripts/build-puzzles.mjs` (exécuté en local ou en GitHub Action, pas dans le navigateur) :
1. Télécharge et décompresse en streaming (`zstd` ou package `fzstd`).
2. Filtre qualité : `Popularity >= 85`, `NbPlays >= 500`, `RatingDeviation <= 90`, `Rating` entre 400 et 2200.
3. Mappe les `Themes` Lichess vers les ids du catalogue (table de correspondance dans `CURRICULUM.md`, colonne « Tags Lichess »).
4. Pour chaque thème du catalogue, échantillonne **~300 problèmes** répartis sur 6 tranches de classement (400-700, 700-1000, 1000-1200, 1200-1400, 1400-1700, 1700-2200).
5. Ajoute un shard `mixed.json` de ~2 000 problèmes toutes thématiques pour la pratique mélangée.
6. Écrit `data/puzzles/<catalogueId>.json` au format compact : `[id, fen, moves, rating, themesBitmask]`. Objectif : < 15 Mo au total, chaque shard < 400 Ko.
7. Génère `data/puzzles/manifest.json` (thèmes, tailles, nombre par tranche, date de génération).

Les shards sont chargés à la demande et mis en cache par le service worker. Garder les 212 problèmes maison seulement s'ils servent d'exemples guidés dans les fiches ; sinon, les supprimer.

### 4.5 Classement et adaptation

- Implémenter un **Glicko-2 simplifié** (ou Elo avec K dégressif : 40 pour les 30 premiers problèmes, puis 20) côté élève, un classement **global** + un par **thème**.
- Le problème a son classement Lichess fixe. Résultat = 1 si résolu sans indice ni erreur, 0 sinon. Indice utilisé = 0,5 pour la stat de maîtrise mais 0 pour le classement.
- Sélection : problème dont le classement est dans `[classementThème - 150, classementThème + 100]`, jamais vu dans les 30 derniers jours (sauf révision SRS).
- Classement initial : test de placement optionnel de 15 problèmes au premier lancement (dichotomie), sinon 800.

### 4.6 Répétition espacée

- Implémenter **FSRS** via `ts-fsrs` (MIT) ou, plus simple, un **Leitner à 6 boîtes** (J+1, J+3, J+7, J+14, J+30, J+90). Choisis Leitner si pas de build.
- Types de cartes : `principle` (fiche : afficher la position test, l'élève doit jouer le coup), `puzzle` (problème raté : rejouer le même), `mistake` (erreur de partie : position avant l'erreur, trouver le meilleur coup), `opening` (trouver le coup suivant du mini-répertoire).
- Un problème raté crée automatiquement une carte. Une carte réussie monte d'une boîte, ratée revient en boîte 1.
- **Mode « pic-vert » (méthode Woodpecker)** dans S'entraîner : un set fixe de 100 problèmes d'un palier, à refaire en cycles de plus en plus rapides, avec chrono et comparaison entre cycles.

### 4.7 Moteur : Stockfish

- Package npm `stockfish` (projet nmrugg/stockfish.js, version 18). Utiliser le build **`stockfish-18-lite-single`** (~7 Mo, mono-thread, ne nécessite pas COOP/COEP, donc compatible GitHub Pages). Chargement paresseux, uniquement quand on joue ou analyse.
- **Licence GPL-3.0** : le repo étant public, publier le code de l'app sous licence compatible (GPL-3.0) ou isoler le moteur comme fichier tiers non modifié avec sa licence et un lien vers les sources. Ajouter `THIRD_PARTY_LICENSES.md`. Garder `chess-LICENSE.txt`.
- Niveaux de jeu (8 niveaux affichés en Elo approximatif) :
  - Niveaux 1 à 3 (~400, ~600, ~800) : moteur maison existant **avec erreurs humaines injectées** (probabilité de jouer un coup aléatoire parmi les 5 meilleurs, et de laisser en prise une pièce avec une probabilité décroissante). Les débutants ont besoin d'adversaires qui gaffent.
  - Niveaux 4 à 8 : Stockfish `Skill Level` 0, 3, 6, 10, 15 avec temps de réflexion limité (`movetime` 100 à 800 ms).
- Mode « coach » activable pendant la partie : après chaque coup adverse, un bouton « Vérifier ma position » surligne les pièces en prise des deux camps (aide qui disparaît progressivement : coût en « jetons » limités par partie).
- Finales à jouer : depuis chaque fiche `fin-*`, bouton « Jouer cette position contre le moteur » (ex. Lucena, Philidor, D+R contre R).

### 4.8 Analyse de parties et « mes erreurs »

1. **Import** :
   - Lichess : `GET https://lichess.org/api/games/user/{pseudo}?max=20&moves=true&opening=true&clocks=false` avec en-tête `Accept: application/x-ndjson`.
   - Chess.com : `GET https://api.chess.com/pub/player/{pseudo}/games/archives`, puis le dernier mois listé.
   - Coller un PGN.
   - Les parties jouées dans l'app contre le moteur sont analysées automatiquement.
2. **Analyse** dans un Web Worker Stockfish, profondeur 12 (mobile) à 16 (desktop), seulement sur les coups de l'élève.
3. **Classification** (en centipions du point de vue de l'élève, avec plafonnement à ±1000 et conversion des mats) : gaffe si perte ≥ 200 cp ou mat raté/subi, erreur si ≥ 100, imprécision si ≥ 50. Pour l'UI, ne montrer que gaffes et erreurs (max 5 par partie).
4. **Étiquetage automatique du thème de l'erreur** (heuristiques à coder, au moins) : pièce laissée en prise (une pièce de l'élève attaquée et insuffisamment défendue après son coup), fourchette subie, clouage subi, mat du couloir, menace adverse ignorée, capture gratuite ratée, mat en 1 ou 2 raté. Sinon : « autre ».
5. **Rapport de partie** : 3 moments clés max, chacun avec la position, le coup joué, le meilleur coup, la fiche du catalogue liée, et une carte `mistake` créée dans le SRS.
6. **Tableau « Mes erreurs récurrentes »** dans Progrès : histogramme par thème sur les 20 dernières parties. La séance du jour pondère les thèmes les plus fréquents dans ces erreurs.

### 4.9 Exercices de vision (palier 0, critiques pour le 20/80)

Mini-jeux chronométrés de 30 à 60 s, à intégrer dans S'entraîner et dans la séance du jour tant que le palier 0 n'est pas maîtrisé :
- **Trouve la case** : une case est annoncée (`e5`), toucher la bonne case. Version blancs en bas et noirs en bas. Objectif : 30 bonnes réponses en 30 s.
- **Nomme la case** : une case est surlignée, choisir son nom parmi 4.
- **Pièces en prise** : position aléatoire tirée d'une vraie partie, toucher toutes les pièces non défendues ou insuffisamment défendues des deux camps.
- **Compte les attaquants** : une case surlignée, combien de pièces blanches et noires l'attaquent ?
- **Chemin du cavalier** : amener un cavalier de A à B en un minimum de coups en évitant les cases attaquées.
- **Échecs disponibles** : toucher tous les coups qui donnent échec (pour les deux camps).

### 4.10 Médias existants

- Garder **une seule voix** (choisir la meilleure qualité, probablement `media-male-neural`) et supprimer les doublons du repo. Si les deux voix sont vraiment souhaitées, les déplacer hors du repo (GitHub Releases ou CDN) et les charger à la demande.
- Ne **jamais précacher** l'audio et la vidéo dans le service worker ; cache à la lecture.
- Rattacher chaque vidéo existante à une fiche via `videoId`. L'onglet vidéothèque disparaît ; la vidéo devient un bouton « Voir en vidéo » dans la fiche.
- Les textes audio existants ne correspondent plus au nouveau format court. L'audio est optionnel : mieux vaut pas d'audio qu'un audio désynchronisé du texte. Prévoir un champ `audio` par écran, vide pour l'instant.

### 4.11 Sauvegarde et migration

- Passer à **IndexedDB** (via un petit wrapper type `idb-keyval`) pour les cartes SRS, l'historique de problèmes et les parties importées ; garder `localStorage` pour les préférences.
- `migrate.js` : lire `premier-coup-v1`, conserver narrateur, objectif quotidien, série de jours, et marquer comme `vue` les fiches correspondant aux leçons déjà terminées (table de correspondance ancien id → nouvel id à écrire).
- Export/import de sauvegarde en JSON dans Réglages.

---

## 5. Règles d'écriture du contenu (pour tout texte affiché)

1. Tutoiement, français simple, phrases de 20 mots maximum.
2. **Zéro remplissage** : pas de « Installe-toi », « Tentant, non ? », « Ce petit effort change beaucoup de parties ». Chaque phrase contient une information d'échecs ou une consigne.
3. Toujours nommer les cases et les pièces en notation française : « le cavalier en e4 », « Cd6+ ». Les flèches et surlignages accompagnent, ils ne remplacent pas.
4. Abréviations françaises : R roi, D dame, T tour, F fou, C cavalier, pions sans lettre. Prises `x`, échec `+`, mat `#`, roques `O-O` et `O-O-O`.
5. Un écran = une idée = 60 mots maximum.
6. Toujours donner le « pourquoi » concret (ce qui est gagné, en points ou en mat), jamais de morale abstraite.
7. **Pas de tiret cadratin (—) ni demi-cadratin (–)** dans les textes affichés. Utiliser deux-points, virgules ou parenthèses.
8. Les QCM textuels sont interdits. Toute vérification se fait sur l'échiquier (jouer un coup, toucher une case, choisir entre 3 positions).

---

## 6. Plan de livraison (phases, critères d'acceptation)

Livrer chaque phase dans une PR séparée, avec captures d'écran mobile (390 px) et desktop (1280 px) dans la description.

### Phase 1 : Fondations techniques et catalogue unifié
- Nouvelle arborescence, routeur à 4 onglets + fiche + séance.
- Composant échiquier unique (`board.js`) avec **coordonnées affichées** (a-h, 1-8 sur les bords, inversées quand l'échiquier est retourné), flèches, marques, drag & drop + tap-tap, promotion, animation des coups, son optionnel.
- `curriculum/` rempli à partir de `CURRICULUM.md` (toutes les fiches, au format 4.3).
- `scripts/validate-curriculum.mjs` passe au vert.
- Vue Catalogue : arbre par palier, filtres (domaine, priorité, état), recherche plein texte, fiche consultable en lecture.
- Migration de sauvegarde.
- **Acceptation** : toutes les anciennes vues sont supprimées ; `grep -r "deepLessons\|essentialSkills\|foundationCourses\|trainingLessons\|advancedLessons" src/` ne renvoie rien ; Lighthouse PWA ≥ 90 ; aucune erreur console.

### Phase 2 : Lecteur de fiche + problèmes Lichess
- `lesson-player.js` au format 3.3 (10 étapes).
- `build-puzzles.mjs` + shards générés et commités.
- `puzzle-player.js` : animation du coup adverse initial, indices progressifs (3 niveaux), « Voir la solution », bouton « Analyser » (ouvre la position sur `https://lichess.org/analysis/<fen>`), chrono optionnel, retour immédiat (vert/rouge + flèche du bon coup).
- Classement global + par thème.
- **Acceptation** : chaque fiche `S` et `A` a au moins 150 problèmes disponibles ; un problème se joue entièrement au doigt sur mobile ; le classement converge (test unitaire : 50 résultats simulés à 1200 donnent un classement entre 1100 et 1300).

### Phase 3 : Séance du jour + répétition espacée
- `session.js` (algorithme 3.2), `srs.js` (4.6), mode Woodpecker.
- Vue Aujourd'hui.
- **Acceptation** : tests unitaires sur la planification SRS (dates de révision) et la composition de séance (durées, pas de doublon, priorité des erreurs de partie).

### Phase 4 : Vision
- Les 6 mini-jeux de 4.9 avec meilleurs scores.
- **Acceptation** : jouables à une main sur mobile, scores persistés.

### Phase 5 : Jeu et analyse
- Stockfish lite-single en worker, 8 niveaux, mode coach.
- Import Lichess / Chess.com / PGN, analyse, classification, étiquetage, rapport de partie, cartes `mistake`.
- « Jouer cette position » depuis les fiches de finales et d'ouvertures.
- **Acceptation** : une partie de 40 coups est analysée en moins de 60 s sur un iPhone récent en profondeur 12 ; au moins les étiquettes « pièce en prise » et « mat raté » sont détectées sur un jeu de 10 positions de test fournies dans `tests/fixtures`.

### Phase 6 : Progrès et finitions
- Vue Progrès : classement global (courbe), par thème (barres), maîtrise par palier, erreurs récurrentes, série, temps.
- Test de placement au premier lancement.
- Nettoyage médias (4.10), licences, `ARCHITECTURE.md`, `README.md` à jour.
- **Acceptation** : repo < 150 Mo ; temps de premier affichage < 2 s en 4G simulée.

---

## 7. Tests et validation automatique

`scripts/validate-curriculum.mjs` doit vérifier pour chaque fiche :
- Tous les FEN sont légaux (chess.js).
- Toutes les lignes `solution` / `line` / `move` sont jouables depuis leur FEN.
- Les positions annoncées « mat » donnent `isCheckmate() === true`, « pat » donnent `isStalemate() === true`.
- Les prérequis référencent des ids existants, pas de cycle.
- Chaque fiche `S`/`A` a `lichessThemes` non vide **ou** un champ `drill` (exercice de vision).
- Aucun texte ne dépasse 60 mots par écran, aucun texte ne contient `—` ou `–`.

Optionnel mais recommandé : vérifier avec Stockfish (profondeur 18, en local via `stockfish` npm en Node) que la solution des défis d'entrée est unique (écart ≥ 150 cp avec le 2e meilleur coup).

Tests unitaires (Vitest ou `node --test`) : `sanFr`, classement, SRS, séance, classification d'erreurs, parsing PGN/ndjson.

---

## 8. Ce que tu ne dois PAS faire

- Ne pas ajouter de backend, de compte utilisateur ou de tracking.
- Ne pas garder « par sécurité » les anciens systèmes de contenu en parallèle : on migre et on supprime.
- Ne pas inventer de positions sans les valider par script.
- Ne pas allonger les textes de `CURRICULUM.md` ; les découper.
- Ne pas exiger une leçon avant de pouvoir faire des problèmes.
- Ne pas cacher la notation algébrique.
- Ne pas précacher les médias lourds.
- Ne pas utiliser de build Stockfish multi-thread (incompatible GitHub Pages).

---

## 9. Livrables attendus à la fin

1. App refondue déployée sur GitHub Pages.
2. `ARCHITECTURE.md` (choix techniques, schémas de données, flux).
3. `curriculum/` complet et validé.
4. `data/puzzles/` + `scripts/build-puzzles.mjs` reproductible.
5. `THIRD_PARTY_LICENSES.md`.
6. Suite de tests verte.
7. Un `CHANGELOG.md` listant ce qui a été supprimé, migré, ajouté.