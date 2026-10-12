# Architecture

## Choix

ES modules natifs, sans framework, transpilation ou backend. `npm run build` copie les fichiers utiles vers `dist` et injecte la version unique de `package.json`. Les activités chargent leurs modules à la demande. Stockfish est un Worker classique mono-thread ; aucun SharedArrayBuffer ni en-tête spécial n’est nécessaire sur Pages.

## Catalogue

`CURRICULUM.md` est conservé intégralement. La chaîne `npm run curriculum` extrait ses 71 fiches, ajoute les exemples légaux, les références média et découpe les textes. L’ordre du programme est conservé et testé. L’index est léger ; le texte de recherche est chargé seulement dans Catalogue. Toutes les fiches sont consultables même si leurs prérequis ne sont pas vus.

Le lecteur comporte dix étapes. Il enregistre étape et sous-page. Le défi d’entrée est sans pénalité ; le modèle guidé utilise des indices. La pratique utilise des problèmes Lichess ou des exercices spécialisés. La validation distingue « vue », « en pratique » et « maîtrisée ». Les exceptions illustrées explicitement sont dans `pitfall.fen`; ailleurs, le repère textuel accompagne le modèle principal.

Le validateur contrôle FEN, lignes UCI, mats, pats, prérequis et cycles. Il vérifie aussi les écrans de 60 mots, phrases de 20 mots et l’absence de tirets interdits. Les ajustements éditoriaux restent courts et ne modifient pas le programme source. Quelques formulations trop absolues, notamment l’opposition et l’attaque à la découverte, sont précisées.

## Banque et classement

Chaque problème : `[id, fenAvantCoupAdverse, uciSéparésParEspaces, rating, masqueThèmesHex]`. Le premier coup adverse est appliqué avant de rendre la main. La classe `PuzzleRun` traite la ligne, les réponses adverses, les indices et les mats alternatifs. Un instantané conserve la série, l’index et le problème terminé : le résultat n’est enregistré qu’une fois.

50 thèmes ont 300 positions chacun et le mélange en contient 2 000. Les tags sont encodés en BigInt pour préserver les 73 bits. Les filtres qualité sont dans le manifeste. Les notions sans tag adapté utilisent des exercices de règles, coordonnées, matériel, finales ou plans. Elles ne sont pas remplacées par des tactiques aléatoires.

Elo local : 800 au départ, K=40 sur les 30 premières positions puis 20. Résultat 1 sans aide, 0 sinon ; un indice vaut 0,5 dans la statistique de résultat. Sélection dans la bande cible, puis au plus proche si elle ne suffit pas. Aucune position vue depuis 30 jours n’est resélectionnée en pratique ordinaire. Le test optionnel de 15 problèmes fournit une estimation initiale par dichotomie.

Maîtrise tactique : 12 réussites parmi 15 premières rencontres distinctes sur deux jours. Une réussite antérieure est retrouvée dans l’historique ; moins de 65 % sur les 20 derniers résultats déclenche « à revoir ». Les exercices à petit nombre de variantes ne deviennent pas artificiellement maîtrisés après une seule démonstration.

## Séances et mémoire

Leitner à six boîtes : 1, 3, 7, 14, 30, 90 jours. Une erreur revient en boîte 1 ; une réussite monte d’une boîte. Cartes : principe, puzzle, erreur de partie et ouverture. Les erreurs de partie passent avant les puzzles puis les principes. L’ajout est idempotent par identifiant.

La séance consolide une notion en cours avant d’en ouvrir une autre. Sa pratique est incluse dans le lecteur, puis les thèmes connus sont mélangés en favorisant les faibles et les erreurs récurrentes. Le mode pic-vert conserve 100 identifiants fixes et compare temps et précision entre cycles.

## Jeu et analyse

Niveaux 1 à 3 : recherche locale courte et erreurs probabilistes. Niveaux 4 à 8 : Stockfish, Skill Level 0/3/6/10/15, temps borné. Cinq jetons permettent de voir les pièces exposées. Les coups, la pendule et le camp choisi sont sauvegardés.

Les imports publics sont explicites et bornés à 20 parties. Le PGN est validé par chess.js. L’analyse compare avant et après chaque coup de l’élève, avec score ramené à son point de vue et plafonné à ±1000 cp. Seuils : 50/100/200 cp ; les mats sont traités séparément. Cinq erreurs maximum sont conservées, trois moments présentés. Les motifs sont des heuristiques, pas une preuve tactique exhaustive. Des cartes de révision sont créées.

Après un mauvais coup de problème, une réponse légale est montrée immédiatement. Stockfish vérifie ensuite la réfutation et l’évaluation en local. S’il trouve une valeur proche, le texte explique qu’il s’agit d’une autre combinaison, sans prétendre que toute alternative perd.

## Persistance et hors ligne

IndexedDB `premier-coup` version 2, magasin `state`, écritures sérialisées. Copie de secours localStorage `premier-coup-v2`, préférences séparées. La copie la plus récente est restaurée. Une erreur de stockage visible invite à exporter. L’import JSON conserve une possibilité d’annulation dans le dialogue.

La migration lit `premier-coup-v1` sans effacement, préserve narrateur, objectif, jours et notes, et conserve l’objet source. Les anciens cours terminés deviennent des fiches vues, jamais des maîtrises inventées.

Le service worker précache seulement l’interface et le catalogue. Les problèmes, le moteur et les médias sont téléchargés à l’usage. Le cache de contenu persiste entre mises à jour du shell. Les vidéos sont mises en cache à la lecture et les requêtes Range sont servies depuis le fichier complet lorsque disponible. Aucun média lourd n’est précaché.

## Livraison

Six PR empilées, puis intégration ordonnée sur main. Le workflow publie uniquement `dist`. Une installation iPhone utilise la même origine et conserve donc sa sauvegarde lors d’une mise à jour. Changer de navigateur ou d’appareil requiert export/import.

La banque de repérage stratégique contient aussi 1 440 exercices : 180 positions réelles pour huit thèmes. Elle se régénère avec `npm run build:drills`. Ces questions de cases et de pièces entraînent la reconnaissance, sans prétendre certifier le meilleur coup.
