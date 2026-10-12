# Licences tierces

- **chess.js** : BSD-2-Clause, licence conservée dans `chess-LICENSE.txt`.
- **Positions Lichess** : CC0 1.0, https://database.lichess.org/#puzzles. Le manifeste documente les filtres et le SHA256 de la base source.
- **fzstd** : MIT, `scripts/vendor/fzstd.LICENSE`.
- **Stockfish.js 18.0.8**, build `stockfish-18-lite-single`, distribué sans modification dans `src/chess/vendor`. GPL-3.0, licence et auteurs dans `licenses/stockfish`. Sources correspondantes : commit `93c994592dcf3b4b21052ab925e9b534df9c0918`, archive fournie dans `licenses/stockfish/stockfish.js-18.0.8-source.zip`. Réseau NNUE de reconstruction `nn-9067e33176e8.nnue` inclus. Voir le README upstream fourni pour les instructions de construction. https://github.com/nmrugg/stockfish.js/tree/93c994592dcf3b4b21052ab925e9b534df9c0918

Le moteur est un Worker classique indépendant, chargé seulement à la demande. Il ne nécessite ni SharedArrayBuffer ni en-têtes COOP/COEP.
