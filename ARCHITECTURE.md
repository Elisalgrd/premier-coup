# Architecture de Premier coup

## Décision

ES modules natifs, sans framework ni transpilation. `npm run build` copie les fichiers nécessaires dans `dist/` et injecte l'unique version de `package.json` dans la page et le service worker. GitHub Pages sert uniquement ce résultat. Aucun backend, compte ou suivi publicitaire.

## Données et interface

`CURRICULUM.md` est conservé intégralement. `scripts/build-curriculum.mjs` extrait 71 fiches JSON ; le catalogue charge l'index puis la fiche sélectionnée. Les écrans du contenu font au maximum 60 mots. Les 40 positions explicites et leurs 104 demi-coups sont vérifiés par `validate-curriculum.mjs`. Les exemples absents du document seront ajoutés avec provenance dans la phase de pratique, jamais remplacés par une solution inventée.

Quatre destinations : Aujourd'hui, Catalogue, S'entraîner, Progrès. La fiche est une sous-route du catalogue. L'échiquier commun affiche les coordonnées dans les deux orientations, accepte sélection puis destination et glissement, propose les quatre promotions, dessine les flèches et respecte la préférence de mouvement réduit.

## Progression

IndexedDB `premier-coup`, version 2, enregistre un instantané transactionnel. Les écritures sont sérialisées. Une copie locale récente permet la reprise si IndexedDB est indisponible ; les préférences ont leur clé séparée. La migration lit `premier-coup-v1` sans le modifier, conserve la sauvegarde originale et marque les fiches correspondantes comme vues, jamais maîtrisées.

## Livraison par phases

Les six branches/PR sont empilées dans l'ordre du brief. Les phases intermédiaires restent en revue ; la version actuelle reste disponible jusqu'à l'intégration complète. Le premier lot ne promet pas encore la pratique interactive, le moteur ou l'analyse.

## Vérifications

Tests Node pour notation, migration, persistance et coordonnées. Vérification navigateur 390 px et 1280 px : recherche, lecture et animation, aucune erreur console. Le score Lighthouse PWA n'a pas été mesuré ; aucune mesure de performance sur un iPhone physique n'est revendiquée.
