# BRIEF CODEX : coach en direct, pièces capturées, confirmations de progression

> Repo : `elisalgrd/premier-coup` (version 2.1.2). Lis `BRIEF_CODEX.md` et `ARCHITECTURE.md` avant de coder : les principes pédagogiques et l'architecture (ES modules vanilla, pas de build, PWA statique) restent la référence.
> Livre en 4 PR séparées, dans l'ordre ci-dessous. Chaque PR ajoute ses tests dans `tests/` et bump la version + le cache (comme la PR #9).

---

## PR 1. Bug : l'analyse automatique d'une partie peut se perdre définitivement

**Constat (reproduit sur les données réelles)** : une partie de 62 demi-coups terminée au temps est enregistrée avec `autoAnalyze: false` et `analysis: null`. Elle n'a jamais été analysée.

**Cause** : dans `src/play/import-view.js`, `pending.autoAnalyze = false` est posé **avant** `report(pending)`. Si l'utilisatrice quitte l'écran pendant l'analyse (ou si le moteur échoue), le drapeau est déjà consommé et l'analyse ne se relance jamais. Les erreurs de la partie ne partent donc jamais dans la répétition espacée.

**À faire** :

1. Ne remettre `autoAnalyze = false` qu'après succès de `analyzeGame` (au moment du `ctx.save()` qui suit).
2. Sur l'écran Aujourd'hui et sur `#train`, afficher une carte « 1 partie à analyser → » tant qu'une partie a `analysis == null`. L'analyse de ses propres parties est la boucle la plus rentable de l'app, elle ne doit jamais rester en plan.
3. Si l'analyse est interrompue, garder la progression partielle (moments déjà trouvés) ou au minimum afficher « Analyse interrompue, reprendre → ».

Tests : simuler une analyse annulée et vérifier que la partie reste marquée à analyser.

---

## PR 2. Confirmer clairement qu'une leçon est enregistrée

**Constat** : l'utilisatrice a fini la leçon « Fourchette » (15 problèmes, 13 réussis) et n'était pas sûre qu'elle ait été prise en compte. Les données sont bien sauvegardées, mais rien ne le dit à l'écran. Et le statut reste « En pratique » alors qu'elle a 13/15, parce que `entryStatus` exige 12 réussites sur 15 réparties sur **au moins 2 jours différents**. Cette règle est bonne pédagogiquement (preuve de rétention), mais elle est invisible.

**À faire** :

1. À la fin des problèmes d'une leçon (et sur l'étape « À retenir »), afficher un bloc de bilan :
   - « Leçon enregistrée ✓ »
   - score de la série : « 13 / 15 réussis du premier coup »
   - évolution du classement : « 903 → 938 »
   - statut actuel et ce qui manque, en clair : « Statut : En pratique. Pour la valider : refais une série demain (12 réussites sur 15, sur 2 jours différents). »
2. Dans le catalogue, sous chaque leçon en pratique, la même phrase courte « Encore 1 jour de révision pour la valider ».
3. Petit toast discret « Progression enregistrée » à chaque `ctx.save()` qui suit une fin de série (pas à chaque coup).

Tests : `entryStatus` inchangé ; nouvelle fonction pure `masteryHint(state, entry)` testée (texte de ce qui manque).

---

## PR 3. Pièces capturées et balance matérielle pendant la partie

**Constat** : en mode « Une partie à ton rythme » (`src/play/game.js`), on ne voit pas quelles pièces ont été prises de chaque côté.

**À faire** :

1. Nouvelle fonction pure `capturedPieces(game)` dans `src/chess/notation.js` (ou un nouveau `src/chess/material.js`), calculée à partir de `game.history({ verbose: true })` : chaque coup avec `captured` ajoute la pièce capturée au camp qui l'a prise. Fonctionne avec une position de départ personnalisée (`entryChallenge.fen`), car on ne compare pas avec la position initiale standard.
2. Retourne `{ w: [...], b: [...], diff }` où `diff` = différence de valeur matérielle (barème `value` déjà existant : pion 1, cavalier/fou 3, tour 5, dame 9).
3. Affichage : une rangée de petites pièces (via `pieceHtml`, taille ~18 px, triées par valeur décroissante, pions regroupés) **à côté de chaque horloge**, du côté du camp qui a capturé. Le camp en avance affiche « +3 ». Respecter le retournement de l'échiquier quand elle joue les noirs : sa rangée est toujours en bas.
4. Remplacer le `board-top` actuel (« Noirs 10:00 / Blancs 0:25 » sur une seule ligne) par deux bandeaux joueur : un au-dessus de l'échiquier (adversaire), un en dessous (elle), chacun avec nom, horloge, pièces capturées, avantage matériel.
5. Mettre à jour à chaque coup (dans `update()`).
6. Réutiliser le même composant dans le rapport d'analyse et dans la revue de parties importées.

Tests : captures simples, prise en passant, promotion puis capture de la pièce promue, position de départ non standard.

---

## PR 4. Coach en direct (le plus important)

**Objectif** : pendant une partie d'entraînement, dès qu'elle joue une erreur, un message apparaît pour expliquer **sur le coup** ce qu'elle risque et ce qu'elle a raté. Ça ne bloque jamais le jeu : l'adversaire continue de répondre normalement, elle continue de jouer.

### Réglage

À l'écran de lancement de partie, nouveau choix « Coach en direct » :

- **Gaffes et erreurs** (par défaut)
- Gaffes seulement
- Désactivé (mode partie sérieuse)

Sauvegardé dans `state.preferences.liveCoach` et dans `activeGame`.

### Moteur

1. Nouveau module `src/play/live-coach.js`, avec **sa propre instance** de `Engine` (distincte de celle de l'adversaire, pour que la file d'attente de l'adversaire ne soit jamais ralentie). Nécessaire aussi aux niveaux 1 à 3 qui n'utilisent pas Stockfish pour jouer.
2. Quand c'est son tour : lancer en avance `before = coach.search(fen, { depth: 12 })` pendant qu'elle réfléchit (mise en cache par FEN).
3. Après son coup : `after = coach.search(newFen, { depth: 12 })`, puis réutiliser **tel quel** ce qui existe déjà dans `src/chess/analysis.js` : `classify(before, after)` pour la gravité, `labelMistake(fen, coup, before.best, before, after)` pour le type d'erreur. Pas de nouvelle logique d'analyse, juste un branchement.
4. Sur mobile : plafonner à `movetime 700` si la profondeur 12 est trop lente. Si le moteur échoue, le coach se tait sans erreur visible.

### Ce qu'elle voit

Une carte qui apparaît sous l'échiquier (ou à droite sur desktop), sans pop-up modale :

> **⚠ Gaffe au coup 14 · Pièce laissée en prise**
> Risque : l'adversaire peut jouer **Fxb2** et gagner ton fou gratuitement (≈ une pièce perdue).
> Tu avais mieux : **Cxf7**, qui prenait un pion sans risque.
> [Voir sur l'échiquier] [Compris]

Règles de rédaction :

- Titre = gravité (`Gaffe` / `Erreur` / `Imprécision` discrète) + `friendlyMistake(label)` déjà existant.
- « Risque » = la meilleure réponse adverse (`after.line[0]`) traduite en français avec `describeMove` / `sanFr`, plus la conséquence en langage humain. Convertir la perte en matériel, pas en centipions : 80 à 150 ≈ « un pion », 250 à 400 ≈ « une pièce (cavalier ou fou) », 450 à 600 ≈ « une tour », 800+ ≈ « la dame », mat ≈ « tu peux te faire mater en N coups ».
- « Tu avais mieux » = `before.best` en français, avec une demi-phrase sur l'idée si le label le permet (capture gratuite, mat, parade de menace).
- **Opportunité ratée** : si l'adversaire vient de laisser une pièce en prise et qu'elle ne l'a pas prise, le message le dit explicitement (« L'adversaire t'offrait sa tour en d5 »). C'est le cas `Capture gratuite ratée`, à mettre en avant.
- Jamais de jargon moteur visible (pas de « +2.3 », pas de « centipions »).

« Voir sur l'échiquier » : ouvre un petit échiquier figé sur la position **avant** son coup, avec flèche rouge (style `danger-arrows` existant) pour la réponse adverse qui la punit et flèche verte pour le meilleur coup. Le grand échiquier de la partie reste jouable à côté.

### Option « Reprendre mon coup »

Bouton secondaire sur la carte, actif seulement en mode Gaffes et erreurs et seulement si l'adversaire n'a pas encore joué sa réponse suivante après le coup en question (sinon reprendre 2 demi-coups). Chaque reprise est notée dans le PGN en commentaire `{coup repris}` et comptée dans le bilan de partie. Limite : 3 reprises par partie. But : rejouer immédiatement le bon réflexe plutôt que subir la suite.

### Mémoire et répétition espacée

1. Chaque alerte Gaffe ou Erreur crée immédiatement une carte de révision, avec le même format que `analyzeGame` (`id: "mistake:" + gameId + ":" + ply`, `type: "mistake"`, `entryId` donné par `labelMistake`). Pas de doublon quand l'analyse de fin de partie repasse sur le même coup.
2. Historique des alertes dans le panneau latéral (« Coup 14 · Gaffe · Pièce laissée en prise »), cliquable pour revoir la position.
3. En fin de partie, le rapport commence par : « Le coach t'a signalé 4 erreurs pendant la partie, dont 2 du même type : Pièce laissée en prise → Revoir le principe ».

### Ce qui ne change pas

- Le bouton « Vérifier ma position (5) » reste : c'est l'aide **avant** de jouer (routine anti-gaffe), le coach en direct est le retour **après** le coup.
- L'adversaire joue au même rythme qu'avant.

### Tests

- Fonction pure `coachMessage(fen, played, before, after)` testée sur des positions fixes : pièce en prise, fourchette subie, mat raté, capture gratuite ratée, coup correct (aucun message).
- Pas de doublon de carte SRS entre coach en direct et analyse de fin.
- La partie continue si le moteur du coach plante.

---

## Bonus 20/80 (optionnel, après les 4 PR)

- **Incrément de temps** : ajouter des cadences 10+5 et 15+10. Avec 10 minutes sans incrément, les fins de partie se jouent à quelques secondes, ce qui empêche d'appliquer la routine anti-gaffe au moment où ça compte. Mettre 15+10 par défaut en mode entraînement.
- **Séance du jour** : quand une partie a été jouée la veille, commencer la séance par ses propres erreurs (cartes `mistake:`) avant les problèmes génériques.