# Validation de la version 2.0.0

## Résultats automatisés

- `npm test` : 25 tests, aucun échec. Migration de deux cours terminés, notation, couleurs, règles, reprise, classement, SRS, séances, vision, analyse et imports.
- `npm run validate` : 71 fiches, 284 positions, 378 demi-coups. Prérequis sans cycle, écrans de 60 mots et phrases de 20 mots maximum.
- `npm run validate:puzzles` : 51 fichiers, 17 000 lignes, 16 469 problèmes distincts. Rapport : `puzzle-validation.json`.
- Huit thèmes de stratégie : 180 positions réelles distinctes chacun, soit 1 440 questions de repérage. Positions et cibles vérifiées.
- Dix fixtures légales couvrent les pièces en prise et les mats ratés.
- Aucune référence aux cinq anciens systèmes de contenu dans `src`.

## Essais dans le navigateur

Interface inspectée à 390 et 1280 pixels, captures de chaque phase dans `screenshots/`.

- Défi joué au toucher, notation française, couleurs et coordonnées des deux camps.
- Navigation de fiche puis rechargement : étape restaurée.
- Problème : erreur, réfutation Stockfish, nouvel essai, ligne complète et résultat conservé après rechargement.
- Exercice de pion isolé : réponse puis rechargement conservés, passage à la deuxième position conservé.
- Vision : réponse et score actualisés.
- Partie : coup humain, réponse du Worker Stockfish, arrêt et rapport automatique.
- Hors ligne : après arrêt du serveur, accueil, catalogue et problème préalablement chargé accessibles ; réponse et indice fonctionnels.

## Performance

Lighthouse 13.0.1, Edge headless, localhost, mobile et 4G simulés : performance 99, accessibilité 100, bonnes pratiques 100. Premier affichage : 1,016 seconde. LCP : 1,999 seconde. Rapport condensé : `performance.json`.

Le score PWA a été [retiré de Lighthouse](https://github.com/GoogleChrome/lighthouse/issues/15535). Aucun score PWA fictif n’est annoncé. Le manifeste et le hors ligne sont vérifiés séparément.

Stockfish analyse 40 coups de l’élève à profondeur 12 en 5,44 secondes sur cet ordinateur. Cela ne valide pas le seuil demandé sur un iPhone physique. Rapport : `engine-benchmark.json`.

## Limites des critères d’acceptation

- Aucun iPhone physique n’était accessible. Installation Safari, lecture vidéo et vitesse Stockfish sur cet appareil restent à confirmer.
- 50 thèmes disposent de 300 problèmes Lichess, huit de 180 repérages stratégiques. Le seuil de 150 par fiche S/A n’est pas atteint pour Lucena, Philidor, les deux mats élémentaires, les trois fiches de méthode, les échanges, les coordonnées et les règles. Ces fiches ont des modèles ou exercices spécialisés ; le seuil n’est pas simulé avec des problèmes hors sujet.
- Les modèles à peu de variantes ne suffisent pas à obtenir artificiellement la maîtrise de 15 positions distinctes.
- Tous les contre-exemples ne possèdent pas encore leur propre diagramme. Les exceptions restent lisibles avec le modèle principal.
- Les vidéos conservées complètent les fiches. Les nouveaux écrans courts ont un champ audio vide, conformément au brief.
- La classification des motifs de partie utilise des heuristiques ; l’évaluation et la variante proviennent du moteur.

Les données personnelles restent locales. Aucune migration n’efface la sauvegarde v1.

Le contenu courant de l’application occupe environ 83 Mo. GitHub indique environ 190 Mo pour le dépôt avec son historique : le critère de 150 Mo n’est donc pas satisfait pour un clone complet. Les anciennes versions ne sont pas purgées.
