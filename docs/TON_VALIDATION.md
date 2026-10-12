# Validation 2.1.0

## Contenu

- 72 fiches : 20 fournies et 52 réécrites.
- 368 écrans, 67 défis d’entrée et 75 exercices, soit 510 positions affichées et 433 demi-coups de lignes vérifiées.
- 73 définitions ; les définitions du tableau fourni sont conservées, avec apostrophes harmonisées.
- Validation des rois, lignes jouables, commentaires, mats/pats annoncés, prérequis, termes introduits et limite de 70 mots.
- Stockfish 18 lite single, profondeur 16, MultiPV 10 : 107 défis/exercices de coups vérifiés. Les questions de case et exercices de règle sont contrôlés par les règles. Une réponse absente des dix variantes est évaluée par recherche ciblée. Les alternatives conservées sont ajoutées à `alsoGood`.

## Non-régression

34 tests automatisés : sauvegarde/migration, catalogue, banques, classement, révisions, parties, lecteur V2, alternatives, reprise au milieu d’une ligne, vocabulaire et couverture de l’audit moteur. Les 16 vidéos existantes et leurs sous-titres sont présents.

Commandes : `npm test`, `npm run validate`, `npm run validate:engine`, `npm run build`. `npm run curriculum` reconstruit les fichiers puis contrôle que l’audit correspond encore aux positions.

## Navigateur

Contrôles dans le navigateur intégré, largeur 390 pixels : premier lancement, tutoriel terminé, séance suivante proposée, démonstration précédente/suivante, rechargement, exercice terminé, ligne de fourchette reprise après réponse adverse, réponse Stockfish avec flèche rouge, glossaire illustré, alternatives sans pénalité, indice à deux erreurs et solution à trois erreurs. Contrôle bureau à 1280 pixels, sans erreur console.

Les captures mobile et bureau sont jointes à la livraison. Il s’agit de tests de largeur d’écran dans Chromium, pas de tests sur un iPhone physique ou dans Safari iOS.

Les vidéos préexistantes restent des compléments. Les nouveaux textes ne sont pas présentés comme de nouveaux enregistrements vocaux ou de nouvelles vidéos.
