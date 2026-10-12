# Problèmes Lichess pour Premier coup

Cette préparation contient des données publiques Lichess CC0, extraites depuis la [base officielle](https://database.lichess.org/#puzzles). La [liste officielle des thèmes](https://github.com/lichess-org/lila/blob/master/translation/source/puzzleTheme.xml) décrit les motifs. Les noms et les règles ne proviennent pas d'une source tierce.

## Reproduire

```powershell
node build-puzzles.mjs --curriculum CHEMIN/CURRICULUM.md --out CHEMIN/data/puzzles --chess CHEMIN/chess.js --max-mb 320 --timeout-sec 1200
```

Le script lit l'archive en streaming et ne l'enregistre pas. Il refuse plus de 320 Mio compressés et s'arrête après 20 minutes. Sur Windows il utilise curl, qui lit le magasin de certificats du système. Le décodeur embarqué `vendor/fzstd.mjs` est fzstd 0.1.1 (MIT, licence voisine), téléchargé depuis le paquet officiel publié sur npm. Node 24.15 s'arrêtait sur le premier bloc zstd ignoré de cette archive : le script utilise donc le décodeur fzstd multibloc. Aucun code n'est téléchargé lors d'une exécution normale.

Il filtre Popularity >= 85, NbPlays >= 500, RatingDeviation <= 90 et 400 <= Rating <= 2200. L'échantillonnage par réservoir utilise une graine fixe et six tranches. Les tranches rares sont complétées par les autres, sans dupliquer un problème. Le shard mélangé exclut equality. Les lignes retenues sont rejouées entièrement avec chess.js ; une ligne illégale ou un motif `mate` sans mat final est rejeté.

L'archive source change : même graine + même archive donnent les mêmes sélections ; la dernière archive ne donne pas nécessairement les mêmes sélections. Pour figer une génération, conserver son SHA-256 et/ou son archive hors du dépôt. `--source CHEMIN/archive.csv.zst` permet de relire une archive précise.

## Contrat des données

Chaque ligne est `[id, fen, moves, rating, themesBitmask]`. `moves` est une chaîne de coups UCI séparés par des espaces. `themesBitmask` est une chaîne hexadécimale (`0x...`), sans perte de précision au-delà de 53 bits. `manifest.themes[i]` correspond au bit `i` : `Boolean(BigInt(row[4]) & (1n << BigInt(i)))`.

Le FEN précède le coup adverse : animer `moves[0]`, puis donner la main à l'élève sur `moves[1]`. L'élève joue ensuite un coup sur deux. Accepter un autre mat légal dans les problèmes de mat en un.

Le manifeste donne la provenance, le SHA-256 de l'archive, les tailles/SHA-256 des shards, les volumes disponibles et sélectionnés par tranche, et les fiches S/A sous 150 problèmes. `examples.json` contient cinq candidats courts et proches de 850 par fiche, avec position avant/après le coup adverse, ligne, tags, popularité et partie d'origine.

## Limites pédagogiques à conserver visibles

- Les fiches sans tags (règles, coordonnées, valeurs, Lucena, Philidor, métacognition, certains plans) requièrent leurs propres exercices. Elles ne sont pas couvertes artificiellement par un tag sans rapport.
- Un tag générique ne prouve pas un motif précis : `mateIn2` ne veut pas dire escalier ; `pawnEndgame` ne veut pas dire opposition ; `endgame` ne veut pas dire pat ; `kingsideAttack` ne veut pas dire sacrifice grec. Ces shards offrent de la pratique liée. Les exemples guidés d'une fiche doivent être examinés pour correspondre exactement à son principe.
- L'Italienne est filtrée par `OpeningTags` Italian_Game. Les répertoires noirs filtrent les familles d'ouvertures pertinentes. Les positions d'une famille peuvent proposer de jouer l'un ou l'autre camp : filtrer l'orientation si un exercice impose un camp.
- Les problèmes Lichess ne sont pas des parties contre un moteur. Une ligne officielle est fournie ; une explication d'erreur hors de cette ligne requiert une analyse réelle ou une explication factuelle prudente.

Le manifeste est l'autorité sur la couverture réelle : aucune quantité manquante n'est masquée.
