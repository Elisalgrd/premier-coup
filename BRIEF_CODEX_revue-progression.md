# BRIEF CODEX : alertes visibles sur mobile, revue vidéo commentée, boucle de progression

> Repo : `elisalgrd/premier-coup` (version 2.4.0). Lis `ARCHITECTURE.md`, `BRIEF_CODEX.md` et `BRIEF_CODEX_coach-en-direct.md` avant de coder. On reste en ES modules vanilla, sans backend, PWA statique, tout en local.
> Livre en 6 PR séparées, dans l'ordre. Chaque PR ajoute ses tests dans `tests/`, met à jour `CHANGELOG.md` et bump la version + le cache. Tests navigateur à 390 px et 1280 px.

## Objectif produit

L'utilisatrice veut progresser le plus vite possible. La boucle cible après chaque partie d'entraînement :

1. Jouer une partie 15+10 avec le coach (elle voit ses erreurs **sans avoir à chercher**).
2. Regarder la **revue vidéo commentée** de toutes ses erreurs (3 à 5 min).
3. Lire la **liste à puces** de ses erreurs et sa règle pour la prochaine partie.
4. **Corriger sa partie** : retrouver elle-même le bon coup dans chaque position ratée.
5. Faire une **série ciblée** sur son erreur la plus fréquente.

Principe pédagogique à respecter partout : regarder une explication aide à comprendre, mais c'est **retrouver soi-même** le bon coup qui fait progresser. La vidéo doit donc toujours déboucher sur un exercice actif.

---

## PR 1. Alerte du coach visible sans scroller (mobile)

**Constat** : sur iPhone, le panneau du coach (`#live-coach-panel`) est sous l'échiquier. Le lien `#coach-notification` est dans l'en-tête, souvent hors écran pendant la partie. Résultat : elle ne voit pas qu'une erreur a été signalée.

**À faire** :

1. **Badge sur l'échiquier** : après une alerte, afficher une pastille ronde sur la case d'arrivée du coup fautif (coin haut droit de la case, comme les badges « ?? » de Chess.com). Rouge + « ?? » pour une gaffe, orange + « ? » pour une erreur. Ajouter une option `badges: [{ square, kind }]` à `Board` (`src/chess/board.js`), rendue dans la case, qui respecte le retournement. Le badge reste jusqu'à son coup suivant. Tap sur le badge = ouvre la carte (point 3).
2. **Pastille flottante** : en `position: fixed` en bas de l'écran (au dessus de la safe area iOS), une pastille « ⚠ Gaffe au coup 14 · Pièce laissée en prise · Voir ». Après 4 s, elle se réduit à une icône ⚠ avec un compteur (« ⚠ 2 ») collée au bord droit, toujours visible, sans masquer l'échiquier. Jamais de modale, jamais de blocage du plateau.
3. **Feuille qui monte du bas (bottom sheet)** : tap sur la pastille ou le badge = la carte du coach (contenu actuel de `CoachPanel`) s'ouvre dans une feuille qui couvre au maximum 55 % de la hauteur, avec la poignée et ✕. L'échiquier reste visible et jouable au dessus. Fermeture par ✕, glissement vers le bas ou en jouant un coup.
4. Son discret optionnel à l'alerte si `preferences.sound` est actif (pas de vibration : l'API n'existe pas sur Safari iOS).
5. Desktop (> 700 px) : comportement actuel conservé (panneau à droite), badge sur l'échiquier ajouté aussi.
6. Supprimer l'ancien `#coach-notification` dans l'en-tête.

**Tests** : badge rendu sur la bonne case, y compris camp noir ; la pastille n'intercepte pas les taps sur l'échiquier ; la feuille ne bloque pas `onMove` ; aucun badge en mode coach désactivé.

---

## PR 2. Analyse complète : garder toutes les erreurs

**Constat** : `analyzeGame` (`src/chess/analysis.js`) ne garde que 5 moments triés par gravité, le rapport n'en montre que 3. Pour la revue, il faut **toutes** les gaffes et erreurs, dans l'ordre de la partie.

**À faire** :

1. Conserver `analysis.moments` (top 5, inchangé pour la compatibilité) et ajouter `analysis.allMoments` : toutes les gaffes et erreurs, triées par `ply` croissant. Les imprécisions sont stockées à part dans `analysis.inaccuracies` (non montrées par défaut).
2. Enrichir chaque moment avec les textes déjà produits par `coachMessage` (`title`, `risk`, `better`, `opportunity`, `reply`, `afterFen`). Extraire la construction de texte de `coachMessage` dans une fonction pure partagée pour ne pas dupliquer.
3. Fusionner avec `record.alerts` du coach en direct (même `ply` = même moment, pas de doublon, réutiliser l'identifiant `mistake:gameId:ply`).
4. Ajouter à chaque moment `question` : la question à se poser la prochaine fois, selon le label. Table dans un nouveau `src/chess/mistake-questions.js`, par exemple :
   - Pièce laissée en prise → « Après mon coup, quelle pièce n'est plus protégée ? »
   - Menace adverse ignorée → « Qu'attaque son dernier coup ? »
   - Capture gratuite ratée → « Est-ce qu'une de ses pièces n'est protégée par personne ? »
   - Fourchette subie → « Est-ce qu'une de ses pièces peut attaquer deux des miennes en un coup ? »
   - Mat raté → « Ai-je regardé tous les échecs avant de jouer ? »
   - Mat du couloir → « Mon roi a-t-il une case de fuite ? »
   - Clouage subi → « Cette pièce protège-t-elle mon roi ou ma dame derrière elle ? »
   - Autre décision à revoir → « Quels sont mes 2 meilleurs coups, et sa meilleure réponse à chacun ? »
   Reprendre si possible le texte `retenir` de la fiche liée (`entryId`) pour rester cohérent avec le catalogue.
5. Les anciennes parties analysées sans `allMoments` affichent un bouton « Relancer l'analyse complète ».

**Tests** : partie fixture avec 7 erreurs → `allMoments.length === 7`, ordre chronologique, `moments` inchangé ; pas de doublon avec les alertes ; migration des anciens rapports.

---

## PR 3. Revue vidéo commentée (le plus attendu)

**Objectif** : à la fin de la partie, un bouton « ▶ Revoir mes erreurs en vidéo ». Ce n'est pas un fichier mp4 : c'est un **lecteur animé** sur l'échiquier, avec narration vocale et sous-titres, généré en local à partir de l'analyse. Ça marche hors ligne, sans serveur, pour chaque partie.

### Déroulé d'une revue

1. **Intro** (1 écran) : « Dans cette partie, tu as fait 4 erreurs, dont 2 fois la même : pièce laissée en prise. On les revoit une par une. »
2. **Avance rapide** : la partie défile coup par coup sur `PlayerBoard` (0,6 s par coup, sans narration) jusqu'au coup avant la première erreur.
3. **Scène d'erreur** (pour chaque moment de `allMoments`) :
   - a. Arrêt sur la position avant son coup. Bandeau « Coup 14 · Gaffe ». Narration : « Ici, tu as joué ton fou en c4. »
   - b. Animation de son coup, puis de la réponse adverse avec flèche rouge. Narration = `risk` (« Il prend ton fou avec son cavalier, tu perds environ la valeur d'une pièce. »).
   - c. Retour à la position avant son coup. Animation du meilleur coup avec flèche verte, puis de la suite (`line`, 3 à 5 demi-coups max). Narration = `better`.
   - d. Carte « À retenir » : la `question` de la PR 2, lue à voix haute, affichée 3 s minimum.
4. **Reprise de l'avance rapide** jusqu'à l'erreur suivante.
5. **Fin** : récap vocal court (« Ta règle pour la prochaine partie : … ») puis enchaînement automatique sur la liste (PR 4) et le bouton « Corriger ma partie » (PR 5).

### Commandes

- Lecture / pause, erreur précédente ⏮, erreur suivante ⏭, rejouer la scène ↺.
- Vitesse 1× / 1,25× / 1,5× (narration et animations).
- Barre de progression découpée en chapitres (un repère par erreur, cliquable).
- Sous-titres toujours affichés sous l'échiquier (la narration ne doit jamais être la seule source d'info).
- Bouton « Passer l'avance rapide » (aller direct d'erreur en erreur).
- Sur mobile : échiquier en haut, sous-titres et commandes en bas, rien à scroller.

### Narration

- Web Speech API (`speechSynthesis`), langue `fr-FR`. Choisir la meilleure voix française disponible (préférer les voix « enhanced / premium » si présentes, sinon la première `fr-FR`). Ajouter dans Réglages : « Voix des revues : automatique / choisir une voix / muette (sous-titres seulement) ». Respecter `preferences.voice === "silent"`.
- Sur iOS, la synthèse doit démarrer dans un geste utilisateur : le premier `speak()` est déclenché par le tap sur « ▶ Revoir mes erreurs ».
- Synchronisation : chaque étape attend la fin de l'énoncé (`onend`) **et** la fin de l'animation avant de passer à la suivante. Si la synthèse échoue ou n'existe pas, durée par étape calculée sur la longueur du texte (≈ 15 caractères/s).
- Textes en langage humain, avec nom des pièces et des cases (`describeMove`, `sanFr`). Jamais de « +2.3 » ni de centipions.

### Architecture

- Fonction pure `buildReviewScript(record)` dans `src/play/review-script.js` : retourne une liste de scènes `{ kind: "intro" | "fast" | "before" | "played" | "reply" | "best" | "line" | "takeaway" | "outro", fen, move, arrows, text, minMs }`. Toute la logique de contenu est là et testée.
- `src/play/review-player.js` : le lecteur (timeline, contrôles, narration), réutilise `PlayerBoard` et `Board.animate`.
- Route `#train/review-video/<gameId>`. Accès depuis : fin de partie (bouton principal, au dessus de « Voir l'analyse »), rapport d'analyse, Mes parties, et cartes de révision `mistake:` (lecture de la seule scène concernée).
- Si l'analyse n'est pas finie : afficher la progression, puis lancer la revue automatiquement.

### Bonus optionnel

Export en vrai fichier vidéo : rendu de l'échiquier sur `<canvas>` + `MediaRecorder` (sans audio TTS, sous-titres incrustés). À faire seulement si simple et stable sur Safari iOS ; sinon ignorer.

**Tests** : `buildReviewScript` sur une partie fixture (nombre et ordre des scènes, textes non vides, flèches cohérentes, côté noir) ; partie sans erreur → script court « Aucune erreur importante, bravo » ; lecteur qui continue si `speechSynthesis` est absent ; pause / reprise sans désynchroniser l'échiquier.

---

## PR 4. Liste à puces des erreurs + règle de la prochaine partie

À la fin de la revue (et en haut du rapport d'analyse), un bloc « Tes erreurs dans cette partie » :

- Une puce par moment de `allMoments`, ordre chronologique : « **Coup 14 · Gaffe · Pièce laissée en prise.** Tu as joué Fc4, il fallait Cxf7. Question à te poser : après mon coup, quelle pièce n'est plus protégée ? »
- Chaque puce est cliquable : ouvre la scène correspondante dans le lecteur vidéo.
- Au dessus de la liste, encadré « **Ta règle pour la prochaine partie** » : la question liée au label le plus fréquent de la partie (en cas d'égalité, celui de la plus grosse perte). Cette règle est affichée sur l'écran de lancement de la partie suivante (« Rappel de ta dernière partie : … ») et dans la pastille du coach au premier coup.
- Bouton « Copier la liste » (texte brut, pour la garder dans ses notes).

**Tests** : fonction pure `mistakeList(record)` et `nextGameRule(record)` ; égalités ; partie sans erreur.

---

## PR 5. « Corrige ta partie » : retrouver le bon coup soi-même

**Pourquoi c'est la PR la plus rentable** : la vidéo explique, mais c'est l'effort de retrouver le coup qui ancre le réflexe. Le faire tout de suite après la partie, sur ses propres positions, est l'entraînement le plus efficace qui existe pour un débutant.

**À faire** :

1. Après la liste (PR 4), bouton principal « Corriger ma partie (4 positions) → ».
2. Chaque moment devient un exercice : position avant son coup, consigne « Trouve un meilleur coup que celui que tu as joué. » + rappel de la question (masquable).
3. Validation par le moteur (instance séparée, profondeur 12) : un coup est accepté s'il est à moins de 50 cp du meilleur, ou s'il mate. Les autres bons coups ne sont pas des erreurs (même règle que `LessonRun`).
4. Deux essais, puis indice (case de départ de la pièce à jouer), puis solution animée.
5. Le résultat met à jour la carte de révision `mistake:` existante (réussi du premier coup = monte d'une boîte Leitner, sinon boîte 1). Aucun doublon.
6. Bilan : « 3 / 4 retrouvées du premier coup ». Les positions ratées reviennent dans la séance du lendemain en priorité (déjà le cas pour les cartes `mistake:`, à vérifier).

**Tests** : alternative à moins de 50 cp acceptée ; coup perdant refusé ; mise à jour SRS sans doublon ; moteur indisponible → solution affichée sans bloquer.

---

## PR 6. Signaux avant le coup + série ciblée sur son erreur n°1

### 6a. Signaux avant le coup (petites roues d'entraînement)

Le coach actuel corrige **après** le coup. Pour apprendre à voir, il faut aussi un signal **avant**, qui dit qu'il y a quelque chose à trouver, sans dire quoi.

1. Nouveau réglage au lancement : « Signaux avant ton coup : activés / désactivés ». Activé par défaut aux niveaux 1 à 5.
2. Quand c'est son tour, à partir de la recherche déjà préparée par `coach.prepare(fen)` :
   - **⚠ Menace** : le dernier coup adverse crée une menace réelle (nouvelle pièce en prise via `endangeredPieces`, mat en 1 adverse possible, fourchette). Icône ⚠ près de son bandeau joueur, texte « Son dernier coup menace quelque chose. »
   - **💡 Occasion** : l'évaluation de sa position a gagné au moins 200 cp après le coup adverse, ou il existe une capture gratuite / un mat. Icône 💡 « Il y a une occasion à saisir. »
3. Ne jamais indiquer la case ni la pièce. Pas plus d'un signal à la fois.
4. Au bilan : « Signaux : 5 occasions, 3 saisies. 4 menaces, 4 parées. » (saisie / parée = son coup suivant n'est pas classé gaffe ou erreur).

### 6b. Série ciblée sur son erreur la plus fréquente

1. Dans Progrès : « Ton erreur n°1 sur tes 10 dernières parties : Pièce laissée en prise (6 fois) ».
2. Bouton « Série ciblée (10 positions) » : mélange ses propres positions ratées de ce type (cartes `mistake:`) et des problèmes de la banque Lichess du thème correspondant. Table de correspondance label → thèmes, par exemple : Pièce laissée en prise et Capture gratuite ratée → `hangingPiece` ; Fourchette subie → `fork` ; Clouage subi → `pin` ; Mat du couloir → `backRankMate` ; Mat raté → `mateIn1`, `mateIn2`.
3. Proposer aussi cette série à la fin de « Corriger ma partie ».

**Tests** : détection menace / occasion sur positions fixes (aucun signal sur position calme) ; calcul de l'erreur n°1 ; correspondance label → thème.

---

## Ce qui ne change pas

- « Vérifier ma position » (5 jetons) reste.
- Le coach ne bloque jamais la partie, l'adversaire joue au même rythme.
- Règles de maîtrise (`entryStatus`) inchangées.
- Aucun envoi de données hors de l'appareil.