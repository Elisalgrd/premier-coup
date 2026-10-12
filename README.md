# Premier coup

Application d’échecs en français, pensée pour l’iPhone et utilisable sur ordinateur. [Ouvrir l’app](https://elisalgrd.github.io/premier-coup/).

## Utilisation

Sur iPhone, ouvre le site dans Safari, puis **Partager → Sur l’écran d’accueil**. Aucun ordinateur allumé n’est nécessaire. La progression reste sur l’appareil ; utilise Réglages pour exporter une sauvegarde avant de changer d’appareil ou de navigateur.

- **Aujourd’hui** : séance de 15, 25 ou 45 minutes, révisions prioritaires et reprise de l’étape en cours.
- **Catalogue** : 71 fiches, recherche dans tout le texte, filtres et prérequis. Une fiche vue reste distincte d’une notion maîtrisée.
- **S’entraîner** : problèmes directs, révisions, erreurs de partie, six jeux de vision, pic-vert, partie et import.
- **Progrès** : classement de problèmes, thèmes, série, temps de pratique et erreurs récurrentes.

16 vidéos existantes sont conservées comme compléments des fiches, avec narration masculine et sous-titres. Les nouveaux écrans courts n’utilisent pas les anciens audios désynchronisés. Premier coup est indépendant de Julien Song ; ses conseils publics sont cités dans les fiches concernées.

## Développement

Node.js 24, sans dépendance applicative ni serveur de données.

```sh
npm test
npm run validate
npm run build
npm start
```

Le serveur local est sur `http://127.0.0.1:4180`. `dist/` est le site déployable. GitHub Actions valide puis publie ce dossier sur Pages depuis `main`.

```sh
npm run curriculum        # Extraction, exemples, médias et édition courte
npm run validate:puzzles  # Vérifie tous les shards présents
node scripts/build-puzzles.mjs --help
node scripts/benchmark-engine.mjs
```

L’extraction Lichess télécharge la base publique en streaming. Elle est réservée à la maintenance, jamais au téléphone. Le manifeste contient les paramètres, la provenance et les empreintes. La banque livrée contient 16 469 positions distinctes, réparties dans 51 fichiers (1,96 Mo).

## Vérification et limites mesurées

Voir `docs/VALIDATION.md`, `docs/performance.json` et `docs/engine-benchmark.json`. Les tests de navigateur utilisent des largeurs de 390 et 1280 pixels. Le benchmark moteur est réalisé sur cet ordinateur, pas sur un iPhone physique.

L’application n’attribue pas un Elo de compétition : ses estimations servent à adapter les problèmes. Les trois premiers adversaires ont des niveaux indicatifs. La classification des motifs d’erreur reste heuristique ; le moteur fournit l’évaluation et la variante.

## Données et licences

Aucun compte, backend ni suivi. Les parties et l’historique restent sur l’appareil. Un pseudo est envoyé uniquement à Lichess ou Chess.com lorsque tu demandes un import. Les liens d’analyse externe s’ouvrent seulement si tu les choisis.

Le code est sous GPL-3.0-only. Les problèmes Lichess sont CC0. Stockfish et ses sources correspondantes sont fournis avec leur licence. Voir `THIRD_PARTY_LICENSES.md`.

La banque de repérage stratégique contient aussi 1 440 exercices : 180 positions réelles pour huit thèmes. Elle se régénère avec `npm run build:drills`. Ces questions de cases et de pièces entraînent la reconnaissance, sans prétendre certifier le meilleur coup.
