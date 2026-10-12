# CURRICULUM : le catalogue complet de Premier coup

> Source de vérité du contenu pédagogique. Codex transforme chaque fiche en `curriculum/entries/<id>.json` (schéma dans `BRIEF_CODEX.md` §4.3) sans rallonger les textes.
> Toutes les positions marquées **[validé]** ont été vérifiées avec `chess.js` (FEN légal, ligne jouable, mat ou pat confirmé).
> Notation française : R roi, D dame, T tour, F fou, C cavalier. Dans les JSON, les coups sont stockés en UCI.

---

## 1. Comment ce catalogue est construit

### 1.1 La logique 20/80

Un joueur progresse quand il **perd moins de matériel bêtement** et **gagne celui que l'adversaire lui offre**. Sous 1200 Elo, la grande majorité des parties se décide sur une pièce laissée en prise ou une tactique en 1 ou 2 coups, pas sur la stratégie ni sur la théorie d'ouverture. D'où l'ordre :

1. **Voir** l'échiquier (coordonnées, qui attaque quoi).
2. **Ne plus rien donner** (routine anti-gaffe).
3. **Prendre ce qui est offert** et reconnaître les **tactiques** les plus fréquentes.
4. **Mater** avec les motifs qui reviennent tout le temps.
5. **Finir** les parties gagnées (finales essentielles, conversion).
6. **Planifier** quand il n'y a rien de tactique (stratégie).

Les ouvertures restent des **principes + un mini-répertoire de 6 à 8 coups** jusqu'à 1500.

### 1.2 Paliers

| Palier | Elo Lichess approx. | Objectif | Signe qu'on peut passer au suivant |
|---|---|---|---|
| 0 | 0 à 400 | Connaître les règles, lire l'échiquier | 30 cases trouvées en 30 s ; mat D+R contre R en moins de 15 coups |
| 1 | 400 à 800 | Ne plus laisser de pièce en prise | Moins d'une pièce donnée par partie sur les 10 dernières |
| 2 | 800 à 1200 | Gagner du matériel, mater | Classement problèmes ≥ 1300 sur fourchette, clouage, découverte, mat du couloir |
| 3 | 1200 à 1500 | Calculer, convertir, finales clés | Lucena et Philidor gagnés/annulés contre le moteur ; conversion d'une pièce d'avance 9 fois sur 10 |
| 4 | 1500 à 1800 | Penser en plans | Savoir formuler un plan en une phrase dans 8 positions sur 10 sans tactique |

### 1.3 Priorités

- **S** : indispensable, impact maximal. À maîtriser avant de passer au palier suivant.
- **A** : très rentable, à voir dans le palier.
- **B** : utile, à voir quand les S et A du palier sont maîtrisés.
- **C** : bonus, culture échiquéenne.

### 1.4 Le top 20/80 en un tableau

Si l'élève ne devait apprendre que 15 choses, ce serait celles-ci, dans cet ordre.

| Rang | Fiche | Pourquoi c'est dans le top |
|---|---|---|
| 1 | `vis-notation` Coordonnées et notation | Débloque tout le reste (lire, analyser, apprendre seul) |
| 2 | `vis-attacked-squares` Qui attaque quoi | La base de toute tactique et de toute défense |
| 3 | `proc-blunder-check` Échecs, captures, menaces | La routine qui élimine le plus de défaites |
| 4 | `proc-opponent-threat` Que veut son dernier coup ? | La moitié des gaffes vient d'une menace non vue |
| 5 | `proc-hanging-pieces` Pièces non défendues | « Les pièces non défendues tombent » |
| 6 | `proc-exchange-count` Compter les échanges | Évite les mauvaises captures, trouve les bonnes |
| 7 | `mat-basic-queen` + `mat-two-rooks` Mats élémentaires | Sans eux, les parties gagnées finissent nulles |
| 8 | `ouv-principles` Les 3 principes d'ouverture | Arriver au milieu de partie sans retard |
| 9 | `tac-fork` La fourchette | Tactique la plus fréquente chez les débutants |
| 10 | `tac-pin` Le clouage | Deuxième tactique la plus fréquente |
| 11 | `tac-discovered` Attaque à la découverte | Très fréquente, souvent ratée |
| 12 | `mat-back-rank` Mat du couloir | Le mat le plus fréquent en partie réelle |
| 13 | `tac-remove-defender` Éliminer le défenseur | Transforme une pièce défendue en pièce gratuite |
| 14 | `fin-opposition` Roi et pion contre roi | La finale qu'on rencontre le plus |
| 15 | `str-worst-piece` Améliorer la pire pièce | Que jouer quand il n'y a rien |

### 1.5 Format de chaque fiche ci-dessous

- **Méta** : palier, priorité, prérequis, tags Lichess (pour la pratique).
- **Principe** : la phrase à retenir.
- **Pourquoi** : le mécanisme.
- **Signaux** : ce qui doit déclencher la recherche en partie.
- **Méthode** : les étapes.
- **Piège / exception** : quand le principe ne marche pas.
- **Exemple** : position et solution (validées quand c'est indiqué).
- **Maîtrise** : critère de validation (par défaut : 80 % sur 15 problèmes inédits, sur 2 jours différents).

---

## PALIER 0 : LES BASES ET LA VISION (0 à 400)

### `vis-rules` · Les règles complètes
**Méta** : palier 0 · S · aucun prérequis · pratique : exercices de règles (pas de tag Lichess)
**Principe** : Le but est de mater le roi adverse : il est attaqué et aucun coup ne le sauve.
**Pourquoi** : Sans les règles exactes (roque, prise en passant, promotion, pat), on perd des parties gagnées et on joue des coups illégaux en ligne.
**Contenu à couvrir, un écran chacun** :
1. Déplacements : T en ligne droite, F en diagonale, D les deux, C en L (seule pièce qui saute), R d'une case, pion d'une case vers l'avant (deux depuis sa case de départ), prend en diagonale.
2. Échec : le roi est attaqué. On doit y répondre immédiatement.
3. Roque : roi et tour bougent ensemble. Conditions : ni le roi ni cette tour n'ont bougé, les cases entre eux sont vides, le roi n'est pas en échec, ne traverse pas et n'arrive pas sur une case attaquée. La tour, elle, peut traverser une case attaquée.
4. Prise en passant : un pion qui avance de deux cases et arrive à côté d'un pion adverse peut être pris comme s'il n'avait avancé que d'une case. Uniquement au coup immédiatement suivant.
5. Promotion : un pion arrivé sur la dernière rangée devient D, T, F ou C au choix. Presque toujours une dame, sauf si elle provoque un pat.
6. Pat : le joueur au trait n'est pas en échec mais n'a aucun coup légal. C'est nulle.
7. Autres nulles : répétition de la même position 3 fois, 50 coups sans prise ni mouvement de pion, matériel insuffisant (R contre R, R+F contre R, R+C contre R), accord.
**Exemple de pat [validé]** : `4k3/4P3/4K3/8/8/8/8/8 b - - 0 1`. Les noirs sont au trait, pas en échec, et n'ont aucun coup : pat.
**Maîtrise** : 20 questions sur l'échiquier (« ce coup est-il légal ? », « peut-on roquer ? ») à 95 %.

### `vis-notation` · Les coordonnées et la notation
**Méta** : palier 0 · S · `vis-rules` · pratique : jeux « Trouve la case » et « Nomme la case »
**Principe** : Chaque case a un nom (colonne a à h, rangée 1 à 8). Chaque coup s'écrit.
**Pourquoi** : C'est la langue des échecs. Sans elle, impossible de lire une analyse, un livre, un problème Lichess, de rejouer une partie ou de suivre un coach.
**Contenu** :
1. Les colonnes a à h de gauche à droite côté blancs. Les rangées 1 à 8 en partant des blancs.
2. Les blancs ont toujours une case claire en bas à droite (h1).
3. La dame se place sur sa couleur : D blanche en d1 (claire), D noire en d8 (foncée).
4. Lire un coup : `Cf3` (le cavalier va en f3), `exd5` (le pion e prend en d5), `Fxf7+` (le fou prend en f7 avec échec), `O-O` petit roque, `O-O-O` grand roque, `e8=D` promotion, `#` mat.
5. Repères à mémoriser : les cases centrales d4, e4, d5, e5. Les grandes diagonales a1-h8 et h1-a8. f7 et f2 (cases faibles au départ, défendues seulement par le roi).
6. Les deux orientations : savoir lire l'échiquier avec les noirs en bas.
**Signaux** : sans objet (compétence de base).
**Méthode d'entraînement** : 2 min par jour de « Trouve la case » jusqu'à 30 bonnes réponses en 30 s des deux côtés.
**Maîtrise** : 30/30 s côté blancs ET côté noirs, et 10 coups lus à voix haute sans erreur.

### `vis-values` · La valeur des pièces
**Méta** : palier 0 · S · `vis-rules` · pratique : exercices « quel échange est bon ? »
**Principe** : Pion 1, cavalier 3, fou 3, tour 5, dame 9. Le roi n'a pas de prix.
**Pourquoi** : C'est l'unité de mesure pour décider si une capture ou un échange est bon. Gagner 3 points sans contrepartie suffit à gagner une partie entre débutants.
**Nuances à donner** :
1. Ce sont des repères, pas des lois. Une pièce active vaut plus qu'une pièce enfermée.
2. La paire de fous vaut un peu plus que fou + cavalier dans les positions ouvertes (environ un demi-pion).
3. Tour contre fou ou cavalier = « la qualité » (environ 2 points).
4. Trois pièces mineures valent environ une dame. Deux tours valent un peu plus qu'une dame.
5. Un pion proche de la promotion peut valoir bien plus que 1.
6. Le mat compte plus que tout le matériel.
**Piège** : « gagner la qualité » n'est pas un gain si l'adversaire obtient une attaque de mat.
**Maîtrise** : 15 positions « qui est devant et de combien ? » à 90 %.

### `vis-attacked-squares` · Voir qui attaque quoi
**Méta** : palier 0 · S · `vis-notation` · pratique : jeux « Compte les attaquants », « Pièces en prise », « Échecs disponibles », tag Lichess `hangingPiece` (niveau bas)
**Principe** : Avant de penser à un plan, sache quelles cases et quelles pièces chaque camp attaque.
**Pourquoi** : Toute tactique repose sur une pièce attaquée plus souvent qu'elle n'est défendue. Ne pas voir une attaque = gaffe. Ne pas voir une pièce non défendue chez l'adversaire = occasion ratée.
**Signaux** : sans objet (compétence de base).
**Méthode** :
1. Pour chaque pièce adverse, imagine les lignes qu'elle contrôle (tours et dame : rangées et colonnes ; fous et dame : diagonales ; cavalier : les 8 sauts ; pions : les 2 diagonales avant).
2. Repère les pièces et cases attaquées par ces lignes.
3. Fais la même chose pour tes pièces.
4. Les pièces longues (D, T, F) sont les plus dangereuses à oublier, surtout quand elles sont loin.
**Piège** : une pièce qui défend « par derrière » (un rayon X à travers une autre pièce) ne compte pas tant que la pièce devant n'a pas bougé.
**Maîtrise** : jeu « Pièces en prise » : 10 positions de vraies parties, toutes les pièces non défendues trouvées en moins de 20 s chacune.

### `vis-check-escape` · Sortir d'un échec
**Méta** : palier 0 · S · `vis-attacked-squares` · tags `defensiveMove` (niveau bas)
**Principe** : Trois réponses à un échec : prendre la pièce qui attaque, s'interposer, fuir. Toujours examiner les trois.
**Pourquoi** : Le choix de la réponse change tout. Fuir vers la mauvaise case peut mener au mat ou à une fourchette.
**Méthode** :
1. Peut-on **prendre** l'attaquant sans danger ? (souvent le meilleur)
2. Peut-on **interposer** une pièce peu précieuse et défendue ?
3. Où **fuir** ? Préférer une case qui n'est pas sur la ligne d'une autre pièce adverse et pas à portée d'un cavalier.
**Piège** : interposer une pièce non défendue revient à la donner. Contre un échec de cavalier, on ne peut pas s'interposer.
**Maîtrise** : 15 positions d'échec, meilleure réponse trouvée à 85 %.

### `mat-basic-queen` · Mat avec roi et dame contre roi
**Méta** : palier 0 · S · `vis-rules` · pratique : « Jouer cette position contre le moteur » depuis 5 positions de départ aléatoires
**Principe** : La dame enferme le roi adverse dans une boîte de plus en plus petite. Ton roi vient l'aider pour le coup final.
**Pourquoi** : Sans cette technique, des parties gagnées finissent nulles par pat ou par la règle des 50 coups.
**Méthode** :
1. Place ta dame à un saut de cavalier du roi adverse : elle lui coupe une zone sans lui donner échec.
2. Chaque fois qu'il recule, recule la dame en gardant ce saut de cavalier. Le roi adverse est poussé vers un bord.
3. Quand il est sur le bord, **arrête la dame** et amène ton roi à côté (en face, à deux cases).
4. Mate avec la dame protégée par ton roi, ou sur la rangée du bord.
**Piège (pat)** : quand le roi adverse est dans un coin ou sur le bord, ne joue pas un coup de dame qui lui retire sa dernière case sans donner échec. Avant chaque coup de dame, demande-toi : « Aura-t-il encore un coup ? »
**Exemples [validés]** :
- Mat : `k7/1Q6/2K5/8/8/8/8/8 b - - 0 1` (D en b7 protégée par le R en c6).
- Pat à éviter : `k7/8/1Q6/8/8/8/8/7K b - - 0 1` (noirs au trait, aucun coup, pas d'échec).
**Maîtrise** : 5 mats en moins de 15 coups chacun, sans aucun pat, depuis des positions aléatoires.

### `mat-two-rooks` · Le mat de l'escalier (deux tours ou dame + tour)
**Méta** : palier 0 · S · `vis-rules` · tags `mateIn2`
**Principe** : Une tour coupe une rangée, l'autre donne échec sur la rangée suivante. On alterne jusqu'au bord.
**Pourquoi** : C'est le mat le plus simple, il n'a même pas besoin du roi. Il revient sans cesse en fin de partie.
**Méthode** :
1. Une tour contrôle la rangée (ou la colonne) devant le roi adverse.
2. L'autre donne échec sur la rangée où il se trouve : il doit reculer.
3. La première tour passe devant et donne échec à son tour.
4. Si le roi adverse s'approche d'une tour, éloigne-la sur l'autre côté de l'échiquier, puis reprends.
**Exemple [validé]** : `6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1`. 1.Ta7 (coupe la 7e rangée) Rf8 2.Tb8#.
**Maîtrise** : 5 mats depuis le centre de l'échiquier en moins de 10 coups.

### `mat-basic-rook` · Mat avec roi et tour contre roi
**Méta** : palier 0 · A · `mat-basic-queen` · pratique contre le moteur
**Principe** : La tour coupe le roi adverse, ton roi le fait reculer, la tour donne le mat sur le bord.
**Pourquoi** : Fréquent en finale de tours simplifiée. Plus long que le mat avec la dame (jusqu'à 16 coups), il faut une méthode.
**Méthode (« la boîte »)** :
1. Avec la tour, coupe une colonne ou une rangée pour enfermer le roi adverse dans un rectangle.
2. Amène ton roi face au roi adverse (opposition : une case entre eux).
3. Quand les rois sont face à face, donne échec avec la tour : il doit reculer d'une ligne. La boîte rétrécit.
4. S'il n'est pas en face, joue un coup d'attente avec la tour (sur la même ligne) pour le forcer à se mettre en face.
5. Répète jusqu'au bord, puis mat.
**Piège** : laisser la tour à portée du roi adverse sans protection. Garder la tour loin de lui.
**Exemple de position finale [validé]** : `k6R/8/1K6/8/8/8/8/8 b - - 0 1` (mat : la T en h8 contrôle la 8e rangée, le R en b6 contrôle a7 et b7).
**Maîtrise** : 3 mats en moins de 20 coups depuis des positions aléatoires.

### `vis-draws` · Les nulles qui sauvent et celles qui gâchent
**Méta** : palier 0 · A · `vis-rules` · tags `endgame` + positions maison
**Principe** : Devant au matériel, évite le pat et la répétition. Derrière, cherche-les.
**Pourquoi** : Un pat dans une position gagnée est la défaite la plus frustrante. Un pat ou un échec perpétuel peut sauver une position perdue.
**Méthode** :
1. Quand tu es largement devant : avant chaque coup, vérifie que l'adversaire aura encore un coup légal.
2. Quand tu es largement derrière : cherche à n'avoir plus aucun coup légal sauf de roi (sacrifier ses dernières pièces peut créer le pat), ou un échec perpétuel avec ta dame.
3. Répétition : si l'adversaire répète, change de plan si tu es devant.
**Maîtrise** : 10 positions « trouve le coup gagnant qui ne fait pas pat » à 90 %.

---

## PALIER 1 : NE PLUS RIEN DONNER (400 à 800)

### `proc-blunder-check` · La routine anti-gaffe : échecs, captures, menaces
**Méta** : palier 1 · S · `vis-attacked-squares` · pratique : mode coach en partie, tags `hangingPiece`
**Principe** : Avant de jouer, regarde les échecs, captures et menaces possibles. Pour l'adversaire d'abord, pour toi ensuite.
**Pourquoi** : C'est la routine qui supprime le plus de défaites. La plupart des parties perdues entre débutants le sont parce qu'un échec, une capture ou une menace évidente n'a pas été regardé.
**Signaux** : à faire à chaque coup, sans exception. Plus le coup est « évident », plus il faut vérifier.
**Méthode (à afficher en carte fixe pendant les parties)** :
1. **Sa menace** : après son dernier coup, que ferait-il si je passais mon tour ? (échecs, captures, menaces)
2. **Mes coups forçants** : ai-je un échec, une capture, une menace ? Lesquels gagnent quelque chose ?
3. **Mon coup choisi** : je le joue dans ma tête. Après, quels sont **ses** échecs, captures et menaces ? Ma pièce qui vient de bouger est-elle défendue ? Ai-je laissé une autre pièce sans défense ?
4. Si tout est sûr, je joue.
**Piège** : faire la routine seulement quand on se sent en danger. C'est quand on se sent en sécurité qu'on gaffe.
**Maîtrise** : en partie contre le moteur (niveau adapté), moins d'une pièce perdue sans compensation par partie sur 10 parties.

### `proc-opponent-threat` · Que veut son dernier coup ?
**Méta** : palier 1 · S · `proc-blunder-check` · tags `defensiveMove`, `hangingPiece`
**Principe** : Chaque coup adverse change quelque chose. Trouve quoi avant de penser à ton plan.
**Pourquoi** : On joue souvent « son » coup prévu sans voir que l'adversaire vient de créer une menace. Inspiré du principe de Julien Song « commencer par la menace adverse ».
**Signaux** : une pièce adverse vient d'arriver près de ton roi ; une ligne vient de s'ouvrir ; une de tes pièces vient de perdre un défenseur ; un pion adverse avance vers tes pièces.
**Méthode** :
1. Qu'attaque maintenant la pièce qui a bougé ?
2. Qu'attaque la pièce qui était **derrière** elle (découverte) ?
3. Qu'est-ce que cette pièce ne défend plus ?
4. Si une menace existe, compare quatre réponses : défendre la cible, prendre l'attaquant, s'interposer, déplacer la cible avec gain de temps (en créant soi-même une menace).
**Piège** : répondre à une menace en en créant une plus grosse (contre-attaque) est parfois meilleur. Mais seulement si ta menace est vraiment plus forte et forcée (échec, mat, gain de dame).
**Maîtrise** : 15 positions « quelle est sa menace ? » (toucher la pièce visée) à 90 %.

### `proc-hanging-pieces` · Les pièces non défendues tombent
**Méta** : palier 1 · S · `vis-attacked-squares` · tags `hangingPiece`
**Principe** : Une pièce non défendue est une cible. Chez l'adversaire, prends-la. Chez toi, protège-la.
**Pourquoi** : Le grand maître John Nunn résume : les pièces non défendues tombent. Presque toutes les tactiques (fourchettes, enfilades, découvertes) visent au moins une pièce non défendue.
**Signaux** : une pièce sans aucun défenseur ; une pièce défendue seulement par le roi ; une pièce défendue par une pièce qui a déjà un autre travail.
**Méthode** :
1. Après chaque coup (le tien et le sien), compte tes pièces non défendues. Moins tu en as, moins l'adversaire a de tactiques.
2. Pendant le développement, connecte tes pièces : chacune protégée par une autre.
3. Chez l'adversaire, chaque pièce non défendue est une raison de chercher une double attaque.
**Piège** : une pièce non défendue mais impossible à attaquer n'est pas un problème immédiat. Mais elle le deviendra.
**Maîtrise** : 20 problèmes `hangingPiece` à 90 %, temps moyen < 15 s.

### `proc-exchange-count` · Compter les échanges
**Méta** : palier 1 · S · `vis-values`, `vis-attacked-squares` · tags `hangingPiece`, `capturingDefender` (niveau bas), problèmes maison « Captures et reprises »
**Principe** : Avant de prendre, compte les attaquants et les défenseurs de la case, et joue l'échange dans ta tête jusqu'au bout.
**Pourquoi** : « Elle est défendue » ne veut pas dire « je ne peux pas la prendre ». Et « je peux la prendre » ne veut pas dire « je gagne ».
**Signaux** : une pièce adverse attaquée par l'une des tiennes.
**Méthode** :
1. Compte : combien de mes pièces attaquent la case ? Combien des siennes la défendent ?
2. Si je n'attaque pas plus de fois qu'il ne défend, je ne gagne pas la pièce (sauf si ma première pièce vaut moins que la cible).
3. Capture toujours avec la pièce **la moins précieuse** d'abord.
4. Joue la séquence complète : je prends, il reprend, je reprends... Additionne ce que chacun perd.
5. Il n'est jamais obligé de reprendre : vérifie aussi ce qui se passe s'il s'arrête en route.
**Piège** : prendre une pièce défendue par un pion avec ta dame. Exemple dans l'app actuelle (cours 1) : Dxd5 exd5 perd la dame contre une tour.
**Exemple** : position du cours actuel `7k/8/4p3/3r4/q7/8/2B5/3Q2K1 w - - 0 1`. Dxd5 ? exd5 perd 4 points. Fxa4 gagne la dame gratuitement.
**Maîtrise** : 20 problèmes « Captures et reprises » à 85 %.

### `proc-free-material` · Prendre ce qui est offert
**Méta** : palier 1 · A · `proc-exchange-count` · tags `hangingPiece`, `crushing` (niveau bas)
**Principe** : Si une pièce est gratuite et que la prendre ne te met pas en danger, prends-la.
**Pourquoi** : Les débutants laissent souvent passer du matériel gratuit par peur d'un piège. Entre débutants, 9 fois sur 10 ce n'est pas un piège, c'est une gaffe.
**Méthode** :
1. La pièce est-elle vraiment non défendue ? (compte)
2. Après ma prise, a-t-il un échec, une capture ou une menace grave (mat, gain de dame) ?
3. Si non : prends.
**Piège** : le « pion empoisonné » : un pion gratuit qui éloigne ta dame de la défense ou ouvre une ligne vers ton roi.
**Maîtrise** : 15 problèmes à 90 %, temps moyen < 10 s.

### `ouv-principles` · Les trois principes de l'ouverture
**Méta** : palier 1 · S · `vis-notation` · tags `opening` (niveau bas), parties contre le moteur
**Principe** : Dans les 10 premiers coups : prends le centre, sors tes pièces, mets ton roi à l'abri.
**Pourquoi** : Le centre donne de l'espace et des cases aux pièces. Chaque pièce sortie est une pièce qui joue. Un roi au centre se fait attaquer dès que les lignes s'ouvrent. Ces trois buts se soutiennent (idée reprise de Julien Song : comprendre le but des coups, pas les réciter).
**Méthode (règles pratiques)** :
1. Premier coup : e4 ou d4 (avec les noirs : répondre e5 ou d5, ou contester le centre autrement).
2. Sors les cavaliers avant les fous, vers le centre (Cf3, Cc3 / ...Cf6, ...Cc6).
3. Ne bouge pas deux fois la même pièce sans raison (capture, menace à parer).
4. Ne sors pas ta dame trop tôt : elle se fait chasser avec gain de temps.
5. Roque tôt, en général avant le 10e coup.
6. Connecte tes tours (plus aucune pièce entre elles), puis place-les sur les colonnes ouvertes ou centrales.
7. Ne pousse pas les pions devant ton roi roqué sans raison.
8. Ne prends pas des pions éloignés (a, b, g, h) au prix de ton développement.
**Piège / exceptions** : une règle cède devant une tactique. Si la dame peut prendre une pièce gratuite, ce n'est pas « sortir la dame trop tôt ». Si l'adversaire menace quelque chose, on y répond avant de développer.
**Maîtrise** : 5 parties contre le moteur où, au coup 10, le roi est roqué et au moins 3 pièces mineures sont développées.

### `ouv-early-traps` · Les pièges d'ouverture à connaître
**Méta** : palier 1 · A · `ouv-principles` · tags `attackingF2F7`, `opening`
**Principe** : f7 (et f2) est la case faible du début de partie : seul le roi la défend. Beaucoup de pièges la visent.
**Pourquoi** : Ces pièges décident énormément de parties rapides entre débutants. Les connaître permet de les éviter et de punir ceux qui les tentent.
**Contenu (une position et une ligne chacun)** :
1. **Mat du berger et sa défense [validé]** : 1.e4 e5 2.Dh5 Cc6 3.Fc4 Cf6?? 4.Dxf7#. Défense correcte : 1.e4 e5 2.Dh5 Cc6 3.Fc4 g6 4.Df3 Cf6 (le cavalier coupe la ligne de la dame vers f7). La dame blanche est sortie tôt : les noirs vont la chasser en développant.
2. **Mat de Légal [validé]** : 1.e4 e5 2.Cf3 d6 3.Fc4 Fg4 4.Cc3 g6? 5.Cxe5! Fxd1? 6.Fxf7+ Re7 7.Cd5#. Leçon : un clouage sur une dame n'est pas absolu (la dame peut être sacrifiée).
3. **Défense des deux cavaliers, attaque Cg5 sur f7 [validé]** : 1.e4 e5 2.Cf3 Cc6 3.Fc4 Cf6 4.Cg5 d5 5.exd5 Ca5! (et non 5...Cxd5?! 6.Cxf7, dangereux pour les noirs). Avec les noirs, connaître 5...Ca5.
4. **Le piège du pion « gratuit »** : les débutants prennent un pion avec leur dame en b2/b7 et se font enfermer la dame ou la tour en a1/a8.
**Maîtrise** : rejouer chaque ligne de mémoire des deux côtés (cartes SRS `opening`).

### `meta-play-slow` · Jouer lentement pour apprendre
**Méta** : palier 1 · S · aucun · pratique : réglage de cadence dans l'app, rappel hebdomadaire
**Principe** : Pour progresser, joue des parties avec assez de temps pour faire ta routine à chaque coup : 15 min + 10 s par coup minimum.
**Pourquoi** : En blitz (3 à 5 min), on répète ses mauvais réflexes. En partie lente, on installe les bons. Le blitz est un loisir, pas un entraînement à ce niveau.
**Méthode** :
1. 3 à 5 parties lentes par semaine (Lichess 15+10 ou 30+0, ou contre le moteur de l'app).
2. Chaque partie perdue est analysée (voir `meta-game-review`).
3. Garde le blitz pour après, quand la routine est automatique.
**Maîtrise** : 10 parties lentes jouées et analysées.

### `meta-game-review` · Transformer chaque partie en progrès
**Méta** : palier 1 · S · `vis-notation` · pratique : import + rapport de partie (brief §4.8)
**Principe** : Analyse d'abord seule, ensuite avec le moteur. Retiens une seule leçon par partie.
**Pourquoi** : Tes propres erreurs sont les exercices les plus utiles pour toi : elles montrent exactement ce que tu ne vois pas encore (idée de Julien Song : « retravailler l'erreur qui revient »).
**Méthode** :
1. Juste après la partie, sans moteur : où ai-je cru gagner ou perdre ? Note 1 à 3 moments.
2. Ensuite avec le moteur : trouve le premier gros changement d'évaluation.
3. Classe l'erreur : pièce en prise, menace pas vue, tactique ratée, finale mal jouée, plan absent.
4. Écris la leçon en une phrase (« Avant de jouer Fd3, je n'ai pas vu que mon cavalier en c3 n'était plus défendu »).
5. Ajoute la position aux révisions (fait automatiquement par l'app).
**Maîtrise** : 10 parties analysées avec une leçon écrite chacune.

---

## PALIER 2 : GAGNER DU MATÉRIEL ET MATER (800 à 1200)

### `proc-forcing-moves` · Les coups forçants d'abord
**Méta** : palier 2 · S · `proc-blunder-check` · tags `mix` (problèmes mélangés)
**Principe** : Cherche d'abord les échecs, puis les captures, puis les menaces. Pour toi et pour lui.
**Pourquoi** : Un coup forçant réduit les réponses de l'adversaire à quelques coups. C'est ce qui rend une combinaison calculable. Presque toutes les tactiques commencent par un coup forçant.
**Signaux** : roi adverse mal protégé, pièces non défendues, pièces alignées, pièce surchargée.
**Méthode** :
1. Liste **tous** tes échecs, même ceux qui semblent absurdes (un sacrifice de dame avec échec peut mater).
2. Liste toutes tes captures.
3. Liste tes menaces (attaques sur une pièce non défendue ou plus précieuse, menaces de mat).
4. Pour chacun, regarde sa meilleure réponse, pas celle que tu espères.
**Piège** : un échec « pour donner échec » qui chasse le roi vers une meilleure case. Un échec n'est utile que s'il gagne quelque chose ou prépare le mat.
**Maîtrise** : 30 problèmes mélangés au-dessus de ton classement actuel, 70 %.

### `tac-fork` · La fourchette (double attaque)
**Méta** : palier 2 · S · `proc-hanging-pieces` · tags `fork`
**Principe** : Une seule pièce attaque deux cibles en même temps. L'adversaire ne peut en sauver qu'une.
**Pourquoi** : L'adversaire n'a qu'un coup pour répondre à deux problèmes. Si l'une des cibles est le roi (échec), il doit s'occuper du roi et perd l'autre.
**Signaux** :
1. Le roi et la dame (ou une tour) adverses sont à un saut de cavalier d'une même case.
2. Deux pièces adverses non défendues.
3. Deux pièces adverses côte à côte sur la même rangée, avec un pion qui peut avancer entre elles (fourchette de pion).
4. Le roi et une pièce non défendue sur des lignes que ta dame peut croiser.
**Méthode** :
1. Repère les cibles (roi, dame, tours, pièces non défendues).
2. Cherche une case d'où une de tes pièces les attaque toutes les deux.
3. Vérifie que ta pièce n'est pas prise sur cette case (ou que la prise te coûte moins que ce que tu gagnes).
4. Après sa réponse, prends la seconde cible.
**Types à couvrir (un écran et 3 exemples chacun)** : fourchette de cavalier (la reine des fourchettes, souvent « royale » roi + dame), fourchette de pion, fourchette de dame (souvent échec + pièce non défendue), fourchette de roi (en finale), fourchette de fou ou tour (plus rare).
**Piège** : l'adversaire peut parfois répondre par un échec ou en protégeant une cible tout en sauvant l'autre. Et une fourchette sur deux pièces défendues ne gagne rien.
**Exemple [validé]** : `4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1`. 1.Cd6+ (échec au R en e8 et attaque de la D en b5) Rd7 2.Cxb5.
**Maîtrise** : 15 problèmes `fork` inédits à 80 %, sur 2 jours.

### `tac-pin` · Le clouage
**Méta** : palier 2 · S · `proc-hanging-pieces` · tags `pin`
**Principe** : Une pièce ne peut pas (ou ne doit pas) bouger parce qu'elle protège une pièce plus précieuse derrière elle.
**Pourquoi** : Une pièce clouée ne défend plus vraiment, et on peut l'attaquer à nouveau (souvent avec un pion) sans qu'elle puisse fuir.
**Deux types** :
1. **Clouage absolu** : derrière, c'est le roi. Bouger la pièce clouée est illégal.
2. **Clouage relatif** : derrière, c'est la dame ou une tour. Bouger est légal mais coûte cher.
**Signaux** : une pièce adverse sur la même ligne (colonne, rangée, diagonale) que son roi ou sa dame, avec une de tes pièces longues (F, T, D) qui peut atteindre cette ligne.
**Méthode** :
1. Repère les alignements roi / dame / tour adverses avec une pièce entre eux et toi.
2. Cloue avec ta pièce longue (de préférence de moindre valeur que la pièce clouée ou défendue).
3. Attaque la pièce clouée une seconde fois, idéalement avec un pion : elle ne peut pas fuir.
4. Avant de compter un défenseur adverse, vérifie qu'il n'est pas cloué.
**Piège** : une pièce clouée peut encore bouger **le long** de la ligne et parfois prendre ta pièce qui cloue. Un clouage relatif peut être rompu par un contre-coup plus fort (voir le mat de Légal).
**Exemple [validé]** : `4k3/8/8/8/4n3/8/5P2/4RK2 w - - 0 1`. Le C en e4 est cloué sur le R en e8 par la T en e1. 1.f3 attaque le cavalier, qui ne peut pas bouger : il est perdu.
**Maîtrise** : 15 problèmes `pin` inédits à 80 %.

### `tac-skewer` · L'enfilade
**Méta** : palier 2 · A · `tac-pin` · tags `skewer`
**Principe** : Le clouage à l'envers. On attaque la pièce précieuse devant ; quand elle bouge, on prend celle de derrière.
**Pourquoi** : La pièce de devant (souvent le roi en échec) est obligée de partir et découvre celle de derrière.
**Signaux** : roi et dame (ou roi et tour) adverses alignés sur une ligne qu'une de tes pièces longues peut atteindre, le roi devant.
**Méthode** :
1. Repère un alignement avec la pièce la plus précieuse devant.
2. Attaque-la (avec échec de préférence).
3. Après qu'elle se déplace, prends la pièce de derrière.
**Piège** : l'adversaire peut parfois s'interposer avec une pièce défendue, ou la pièce de derrière est défendue et l'échange ne gagne rien.
**Exemple [validé]** : `8/8/8/3k3q/8/8/8/R5K1 w - - 0 1`. 1.Ta5+ (le R en d5 doit quitter la 5e rangée) Rc4 2.Txh5.
**Maîtrise** : 15 problèmes `skewer` à 80 %.

### `tac-discovered` · L'attaque à la découverte
**Méta** : palier 2 · S · `tac-pin` · tags `discoveredAttack`, `discoveredCheck`
**Principe** : En déplaçant une pièce, tu ouvres la ligne d'une autre pièce qui attaque. Deux menaces d'un coup : celle de la pièce qui bouge et celle de la pièce qui est découverte.
**Pourquoi** : L'adversaire ne voit souvent que la pièce qui bouge. Si la découverte donne échec, la pièce qui bouge peut aller n'importe où, même prendre la dame.
**Signaux** : une de tes pièces longues (T, F, D) vise une cible adverse (roi, dame), mais une de tes propres pièces est devant.
**Méthode** :
1. Repère tes pièces longues « bloquées » par tes propres pièces.
2. Si derrière la ligne il y a le roi adverse : n'importe quel coup de la pièce de devant donne échec. Cherche le coup de cette pièce qui gagne le plus (capture, autre menace).
3. Sinon, cherche un coup de la pièce de devant qui crée une deuxième menace.
4. Défense : surveille les découvertes que l'adversaire prépare contre ton roi et ta dame.
**Piège** : la pièce qui bouge doit faire quelque chose d'utile. Si elle se place en prise et que l'adversaire peut parer l'attaque découverte en la prenant, il n'y a rien.
**Exemple [validé]** : `4k3/8/8/7q/8/8/4B3/4R1K1 w - - 0 1`. 1.Fxh5+ : le fou prend la dame et découvre l'échec de la T en e1.
**Maîtrise** : 15 problèmes `discoveredAttack` à 80 %.

### `tac-double-check` · L'échec double
**Méta** : palier 2 · A · `tac-discovered` · tags `doubleCheck`
**Principe** : Deux pièces donnent échec en même temps. Seul le roi peut répondre, en fuyant.
**Pourquoi** : On ne peut ni prendre deux attaquants ni s'interposer sur deux lignes. C'est l'échec le plus puissant ; il mène souvent au mat.
**Signaux** : une découverte vers le roi adverse où la pièce qui bouge peut, elle aussi, donner échec.
**Méthode** : cherche une découverte où la pièce qui bouge donne aussi échec, puis regarde les cases de fuite restantes.
**Piège** : si le roi a des cases de fuite sûres, l'échec double ne gagne pas forcément.
**Maîtrise** : 10 problèmes `doubleCheck` à 80 %.

### `tac-remove-defender` · Éliminer le défenseur
**Méta** : palier 2 · S · `proc-exchange-count` · tags `capturingDefender`
**Principe** : Si une pièce adverse n'est défendue qu'une fois, prends ou chasse son défenseur. La pièce devient gratuite.
**Pourquoi** : Beaucoup de pièces « défendues » ne tiennent que par un seul fil. Couper ce fil, même en sacrifiant de la valeur, peut rapporter plus.
**Signaux** : une cible attaquée par toi et défendue une seule fois ; le défenseur peut être pris, échangé ou attaqué par un pion.
**Méthode** :
1. Pour chaque pièce adverse intéressante, liste ses défenseurs.
2. S'il n'y en a qu'un, cherche à le prendre, l'échanger, le chasser ou le clouer.
3. Puis prends la cible.
4. Compte le bilan total de l'opération.
**Piège** : le défenseur que tu prends est peut-être repris par une autre pièce qui défend aussi la cible.
**Maîtrise** : 15 problèmes `capturingDefender` à 80 %.

### `tac-overload` · La surcharge
**Méta** : palier 2 · A · `tac-remove-defender` · tags `deflection`, `capturingDefender` (pas de tag Lichess dédié)
**Principe** : Une pièce adverse défend deux choses à la fois. Attaque l'une : en la défendant, elle abandonne l'autre.
**Pourquoi** : Une pièce ne peut être qu'à un endroit. Si elle a deux missions, elle en rate forcément une.
**Signaux** : une pièce adverse qui est l'unique défenseur de deux cibles (deux pièces, ou une pièce et une case de mat).
**Méthode** : repère les défenseurs à double emploi ; force-les à choisir avec une capture ou un échec.
**Maîtrise** : 10 problèmes à 75 %.

### `tac-deflection` · La déviation
**Méta** : palier 2 · A · `tac-overload` · tags `deflection`
**Principe** : Force une pièce adverse à quitter une case ou une ligne qu'elle doit garder.
**Pourquoi** : Le défenseur d'une case clé (case de mat, pièce, case de promotion) est souvent unique. L'attirer ailleurs avec un échec ou une offre impossible à refuser ouvre la porte.
**Signaux** : une pièce adverse empêche un mat ou une promotion ; on peut l'attaquer ou lui offrir quelque chose qu'elle doit prendre.
**Méthode** : identifie la mission du défenseur ; trouve un coup forçant qui l'oblige à l'abandonner ; vérifie le coup final.
**Maîtrise** : 15 problèmes `deflection` à 75 %.

### `tac-attraction` · L'attraction (le leurre)
**Méta** : palier 2 · A · `tac-deflection` · tags `attraction`
**Principe** : Force une pièce adverse (souvent le roi) à venir sur une case où elle subira une tactique.
**Pourquoi** : On sacrifie pour amener le roi ou la dame sur une case de fourchette, de clouage ou de mat.
**Signaux** : une case où une fourchette ou un mat marcherait « si le roi (ou la dame) y était ».
**Méthode** : trouve la case cible ; cherche un sacrifice avec échec ou capture qui oblige la pièce à y aller ; vérifie la suite.
**Maîtrise** : 10 problèmes `attraction` à 75 %.

### `tac-trapped-piece` · La pièce piégée
**Méta** : palier 2 · A · `vis-attacked-squares` · tags `trappedPiece`
**Principe** : Une pièce qui n'a plus de case sûre peut être gagnée simplement en l'attaquant.
**Pourquoi** : Classique avec un fou en a7/h7 après avoir pris un pion (piégé par b6/g6), une dame qui va chercher le pion b2, un cavalier sur le bord.
**Signaux** : une pièce adverse au bord ou dans ton camp, avec peu de cases de retraite.
**Méthode** : compte ses cases de fuite ; contrôle-les ; attaque-la (avec un pion si possible).
**Maîtrise** : 10 problèmes `trappedPiece` à 75 %.

### `tac-promotion` · Les pions qui deviennent des dames
**Méta** : palier 2 · A · `proc-forcing-moves` · tags `advancedPawn`, `promotion`, `underPromotion`
**Principe** : Un pion sur la 7e rangée (2e pour les noirs) vaut presque une dame. Tout sacrifice qui le fait promouvoir est à examiner.
**Pourquoi** : Le défenseur doit garder la case de promotion en permanence ; cela crée surcharges et déviations.
**Signaux** : pion passé avancé, une seule pièce adverse qui contrôle la case de promotion.
**Méthode** : contrôle la case de promotion une fois de plus que l'adversaire ; dévie ou élimine son défenseur ; pense à la sous-promotion en cavalier si elle donne échec ou fourchette, ou en tour si la dame fait pat.
**Maîtrise** : 10 problèmes `promotion`/`advancedPawn` à 80 %.

### `mat-back-rank` · Le mat du couloir
**Méta** : palier 2 · S · `mat-two-rooks` · tags `backRankMate`
**Principe** : Un roi roqué derrière ses pions non avancés peut être maté par une tour ou une dame sur la dernière rangée.
**Pourquoi** : C'est le mat le plus fréquent en partie réelle, à tous les niveaux jusqu'à 1800.
**Signaux** : roi adverse en g8 (ou g1) avec pions f7, g7, h7 intacts ; dernière rangée défendue par une seule pièce (ou aucune) ; tu as une tour ou dame qui peut y arriver.
**Méthode** :
1. Compte les défenseurs de la dernière rangée adverse.
2. Si un seul : dévie-le ou surcharge-le (`tac-deflection`, `tac-overload`).
3. Entre avec ta tour ou dame, vérifie qu'il n'y a ni interposition ni capture.
4. Pour ton roi : au bon moment (souvent après le roque et quand rien ne presse), crée une « case de fuite » avec h3 ou g3 (h6 ou g6 avec les noirs).
**Piège** : créer la case de fuite trop tôt, quand l'adversaire attaque déjà ce côté, peut affaiblir le roi.
**Exemple [validé]** : `6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1`. 1.Ta8#.
**Maîtrise** : 15 problèmes `backRankMate` à 85 %.

### `mat-queen-support` · Le mat du baiser (dame soutenue)
**Méta** : palier 2 · S · `mat-basic-queen` · tags `mateIn1`, `mateIn2`, `kingsideAttack`
**Principe** : La dame se colle au roi adverse, protégée par une autre pièce : le roi ne peut pas la prendre.
**Pourquoi** : C'est le mat le plus courant dans les attaques sur le roi roqué (dame en g7, h7, f7 soutenue par un fou, un cavalier ou un pion).
**Signaux** : ta dame peut atteindre une case collée au roi adverse ; cette case est aussi attaquée par une autre de tes pièces ; aucune pièce adverse ne la défend.
**Méthode** : compte attaquants contre défenseurs de la case collée au roi ; si tu en as plus, la dame entre.
**Exemple [validé]** : `6k1/5pQp/6pB/8/8/8/8/6K1 b - - 0 1`. Position de mat : D en g7 soutenue par le F en h6.
**Maîtrise** : 20 problèmes `mateIn1` à 95 % et 15 `mateIn2` à 75 %.

### `mat-smothered` · Le mat à l'étouffée
**Méta** : palier 2 · A · `tac-fork` · tags `smotheredMate`
**Principe** : Le roi est entouré de ses propres pièces ; un cavalier donne échec et le mate, car rien ne peut fuir ni s'interposer.
**Pourquoi** : Spectaculaire et fréquent quand le roi roqué est encombré (T en g8 / f8, pions g7 h7).
**Signaux** : roi adverse dans le coin, cases voisines occupées par ses pièces, ton cavalier peut atteindre f7 (ou f2), ta dame peut donner échec en g8.
**Méthode (le « legs de Philidor »)** : échec de cavalier qui chasse le roi dans le coin, sacrifice de dame en g8 qui oblige la tour à la prendre, mat de cavalier en f7.
**Exemple de position finale [validé]** : `6rk/5Npp/8/8/8/8/8/6K1 b - - 0 1` (mat).
**Maîtrise** : 10 problèmes `smotheredMate` à 80 %.

### `mat-arabian` · Le mat arabe
**Méta** : palier 2 · B · `mat-back-rank` · tags `arabianMate`
**Principe** : Tour et cavalier coopèrent : le cavalier protège la tour collée au roi dans le coin et contrôle une case de fuite.
**Exemple de position finale [validé]** : `7k/7R/5N2/8/8/8/8/6K1 b - - 0 1` (la T en h7 est protégée par le C en f6, qui contrôle aussi g8).
**Maîtrise** : 10 problèmes `arabianMate` à 80 %.

### `mat-anastasia` · Le mat d'Anastasia
**Méta** : palier 2 · B · `mat-arabian` · tags `anastasiaMate`
**Principe** : Un cavalier en e7 (ou e2) bloque les cases de fuite, une tour ou une dame mate sur la colonne h.
**Exemple [validé]** : `8/4N1pk/8/8/8/R7/8/6K1 w - - 0 1`. 1.Th3# (le C en e7 contrôle g8 et g6).
**Maîtrise** : 10 problèmes `anastasiaMate` à 80 %.

### `mat-boden` · Le mat de Boden
**Méta** : palier 2 · B · `tac-pin` · tags `bodenMate`
**Principe** : Deux fous sur des diagonales qui se croisent matent un roi roqué côté dame, bloqué par ses propres pièces.
**Exemple [validé]** : `2kr4/3p4/8/8/5B2/8/4B3/6K1 w - - 0 1`. 1.Fa6# (le F en f4 contrôle b8 et c7, le F en a6 donne échec par b7).
**Maîtrise** : 10 problèmes `bodenMate` à 80 %.

### `mat-patterns-misc` · Les autres motifs de mat à reconnaître
**Méta** : palier 2 (à voir après les S et A) · C · `mat-queen-support` · tags `hookMate`, `doubleBishopMate`, `dovetailMate`, `epauletteMate`, `cornerMate`, `killBoxMate`, `operaMate`, `pillsburysMate`, `morphysMate`, `swallowstailMate`, `triangleMate`, `vukovicMate`, `balestraMate`, `blindSwineMate`
**Principe** : Chaque motif est une « image » de mat. Plus tu en connais, plus vite tu les vois.
**Contenu** : un écran par motif avec la position finale typique et 5 problèmes. Priorité dans l'ordre : mat du crochet (`hookMate`), mat des deux fous, mat de l'épaulette, mat en queue d'aronde, mat de l'opéra, mat de Morphy, mat de Pillsbury, les autres.
**Maîtrise** : reconnaissance de la position finale (« quel motif ? ») à 80 % sur 20 images.

---

## PALIER 3 : CALCULER, CONVERTIR, FINIR (1200 à 1500)

### `proc-candidates-calc` · Coups candidats et calcul
**Méta** : palier 3 · S · `proc-forcing-moves` · tags `short`, `long`, `mateIn3`
**Principe** : Choisis 2 ou 3 coups candidats, calcule pour chacun la meilleure réponse adverse, compare les positions finales.
**Pourquoi** : On perd souvent en calculant très loin une seule ligne en oubliant une réponse gênante dès le premier coup (idée de Julien Song : « vérifier les réponses, pas seulement la profondeur »).
**Méthode** :
1. Liste les candidats : coups forçants d'abord, puis les coups qui améliorent ta pire pièce.
2. Pour chacun, liste **toutes** les réponses adverses forçantes (échecs, captures, menaces).
3. Calcule 3 demi-coups (moi, lui, moi) proprement avant d'aller plus loin.
4. Évalue la position finale : matériel, sécurité des rois, activité.
5. Arrête le calcul quand la position est calme ; ne calcule pas sans but.
6. Avant de jouer, refais la routine anti-gaffe sur le coup choisi.
**Exercices spécifiques** : problèmes `long` (3 coups et plus) sans déplacer les pièces (option « calcul à l'aveugle » : l'échiquier se fige, l'élève saisit la ligne entière).
**Maîtrise** : 15 problèmes `long` à 70 %.

### `tac-intermezzo` · Le coup intermédiaire
**Méta** : palier 3 · A · `proc-candidates-calc` · tags `intermezzo`
**Principe** : Avant de reprendre « automatiquement », regarde s'il existe un coup plus fort (échec, menace plus grosse), puis reprends ensuite.
**Pourquoi** : Dans un échange, tout le monde suppose la reprise. Un coup intercalé forçant change le bilan.
**Signaux** : un échange en cours ; tu as un échec ou une menace sur une pièce plus précieuse.
**Maîtrise** : 10 problèmes `intermezzo` à 70 %.

### `tac-xray` · Le rayon X
**Méta** : palier 3 · B · `tac-skewer` · tags `xRayAttack`
**Principe** : Une pièce longue agit à travers une autre pièce (amie ou ennemie) sur la même ligne.
**Pourquoi** : Deux tours doublées, ou une dame derrière un fou, contrôlent une case même si la pièce de devant est échangée.
**Maîtrise** : 10 problèmes `xRayAttack` à 70 %.

### `tac-interference-clearance` · Interception et dégagement
**Méta** : palier 3 · B · `tac-deflection` · tags `interference`, `clearance`
**Principe** : **Interception** : place une pièce entre un défenseur et ce qu'il défend. **Dégagement** : libère une case ou une ligne pour une autre de tes pièces, souvent avec gain de temps.
**Maîtrise** : 10 problèmes de chaque à 70 %.

### `tac-quiet-move` · Le coup calme décisif
**Méta** : palier 3 · B · `proc-candidates-calc` · tags `quietMove`, `defensiveMove`
**Principe** : Parfois le coup gagnant n'est ni un échec ni une capture : il crée une menace imparable ou enlève la seule défense.
**Pourquoi** : Après avoir appris à chercher les coups forçants, il faut savoir que ce n'est pas toujours le cas.
**Maîtrise** : 10 problèmes `quietMove` à 65 %.

### `mat-greek-gift` · Le sacrifice grec (Fxh7+)
**Méta** : palier 3 · B · `mat-queen-support` · tags `kingsideAttack`, `sacrifice`
**Principe** : Sacrifier le fou en h7 avec échec pour exposer le roi roqué, puis Cg5+ et Dh5 menacent le mat.
**Conditions à vérifier (toutes)** : fou sur la diagonale b1-h7 ; cavalier pouvant aller en g5 sans être pris utilement ; dame pouvant aller en h5 rapidement ; pas de cavalier noir en f6 (souvent chassé par e5) ; pas de défense rapide par ...Ff5 ou ...Dxg5.
**Maîtrise** : 8 positions « le sacrifice marche-t-il ? » (oui / non + coup) à 75 %.

### `fin-active-king` · En finale, le roi attaque
**Méta** : palier 3 · S · `vis-values` · tags `endgame`, `pawnEndgame`
**Principe** : Quand les dames sont échangées, ton roi devient une pièce forte : amène-le au centre et vers les pions.
**Pourquoi** : En finale le mat n'est plus une menace sérieuse. Le roi vaut alors environ une pièce mineure en attaque et en défense.
**Méthode** : dès l'échange des dames (et si aucun mat n'est possible), avance le roi vers le centre ; vise les pions faibles adverses ; place-le devant les pions passés adverses.
**Piège** : tant qu'il reste des tours et dame, vérifie quand même les échecs et les attaques sur la dernière rangée.
**Maîtrise** : 10 problèmes `pawnEndgame` à 75 %.

### `fin-square` · La règle du carré
**Méta** : palier 3 · A · `fin-active-king` · tags `pawnEndgame`, `advancedPawn`
**Principe** : Trace le carré entre le pion et sa case de promotion. Si le roi adverse peut y entrer, il rattrape le pion.
**Pourquoi** : Permet de savoir en une seconde si un pion passé file à dame, sans calculer.
**Méthode** : côté du carré = distance du pion à la promotion (compter depuis la case actuelle, ou depuis la case d'arrivée du double pas si le pion n'a pas bougé). Si c'est au roi de jouer, il peut faire un pas pour y entrer.
**Exemples [validés]** :
- `7k/8/8/p7/8/8/8/5K2 w - - 0 1` trait aux blancs : 1.Re2 entre dans le carré, et le R rattrape le pion (1...a4 2.Rd2 a3 3.Rc2 a2 4.Rb2).
- Même position, trait aux noirs (`... b - - 0 1`) : 1...a4 et le pion promeut (2.Re2 a3 3.Rd2 a2 4.Rc2 a1=D).
**Maîtrise** : 15 positions « rattrape ou pas ? » à 95 % en moins de 5 s.

### `fin-opposition` · Roi et pion contre roi, l'opposition
**Méta** : palier 3 · S · `fin-active-king` · tags `pawnEndgame`, `zugzwang`
**Principe** : Dans une finale de rois, celui qui n'a pas le trait quand les rois se font face (une case entre eux) « a l'opposition » et gagne le duel.
**Pourquoi** : C'est la finale la plus fréquente. Elle décide si une partie avec un pion de plus est gagnée ou nulle.
**Règles à enseigner** :
1. **Opposition** : rois face à face sur une même colonne ou rangée, une case entre eux. Le joueur qui n'a **pas** le trait a l'opposition.
2. **Cases clés** : pour un pion sur la 2e, 3e ou 4e rangée, si ton roi atteint l'une des trois cases deux rangées devant le pion, tu gagnes (pion e4 : d6, e6, f6).
3. **Roi devant son pion sur la 6e rangée** : gain quel que soit le trait (sauf pion de tour).
4. **Pion de tour (a ou h)** : si le roi défenseur atteint le coin de promotion, c'est nulle.
5. **Défense** : le roi défenseur se place devant le pion et prend l'opposition.
**Exemple [validé]** : `4k3/8/4K3/4P3/8/8/8/8 w - - 0 1`. 1.Rd6 Rd8 2.e6 Re8 3.e7 Rf7 4.Rd7, le pion promeut.
**Exemple de pat à éviter [validé]** : `4k3/4P3/4K3/8/8/8/8/8 b - - 0 1` (si le pion arrive en e7 avec le roi en e6 et le roi noir en e8, trait aux noirs : pat).
**Maîtrise** : gagner R+P contre R contre le moteur depuis 5 positions et annuler en défense depuis 5 positions.

### `fin-passed-pawn` · Le pion passé
**Méta** : palier 3 · A · `fin-square` · tags `advancedPawn`, `endgame`
**Principe** : Un pion qu'aucun pion adverse ne peut arrêter est un atout majeur : pousse-le, soutiens-le, et bloque ceux de l'adversaire.
**Contenu** : pion passé protégé (défendu par un pion), pion passé éloigné (il attire le roi adverse loin du reste), bloquer un pion passé adverse avec une pièce (idéalement un cavalier), créer un pion passé par une majorité de pions.
**Maîtrise** : 10 problèmes `advancedPawn` + `endgame` à 75 %.

### `fin-lucena` · La position de Lucena (gagner une finale de tours)
**Méta** : palier 3 · A · `fin-opposition`, `tac-skewer` · pratique contre le moteur
**Principe** : Roi devant son pion sur la 7e, roi adverse coupé : construis un « pont » avec ta tour sur la 4e rangée pour stopper les échecs latéraux.
**Pourquoi** : C'est la position gagnante de référence des finales de tours, les plus fréquentes de toutes les finales.
**Exemple [validé]** : `1K6/1P2k3/8/8/8/8/2r5/3R4 w - - 0 1`. 1.Td4 (prépare le pont) Tc1 2.Ra7 Ta1+ 3.Rb6 Tb1+ 4.Rc6 Tc1+ 5.Rb5 Tb1+ 6.Tb4, plus d'échecs : le pion promeut.
**Maîtrise** : gagner la position 3 fois sur 3 contre le moteur.

### `fin-philidor` · La position de Philidor (sauver une finale de tours)
**Méta** : palier 3 · A · `fin-lucena` · pratique contre le moteur
**Principe** : En défense, roi devant le pion, tour sur ta 3e rangée (6e pour les noirs) tant que le pion n'a pas avancé ; dès qu'il avance, ta tour descend sur la 1re rangée et donne des échecs par derrière.
**Pourquoi** : Le roi attaquant ne peut plus s'abriter derrière son pion une fois celui-ci avancé.
**Exemple [validé]** : `4k3/7R/1r6/3KP3/8/8/8/8 b - - 0 1`. 1...Ta6 (la tour garde la 6e rangée) 2.e6 Ta1 et les échecs par derrière commencent.
**Maîtrise** : annuler la position 3 fois sur 3 contre le moteur.

### `fin-rook-behind` · Les tours derrière les pions passés
**Méta** : palier 3 · A · `fin-passed-pawn` · tags `rookEndgame`
**Principe** : Place ta tour derrière les pions passés : derrière les tiens pour les pousser, derrière ceux de l'adversaire pour les freiner (règle de Tarrasch).
**Pourquoi** : Derrière un pion, l'activité de la tour augmente à chaque pas du pion. Devant, elle diminue.
**Maîtrise** : 10 problèmes `rookEndgame` à 70 %.

### `fin-convert` · Convertir un avantage matériel
**Méta** : palier 3 · S · `proc-blunder-check` · tags `crushing`, `endgame`
**Principe** : Avec du matériel en plus : échange les pièces, pas les pions ; garde ton roi en sécurité ; supprime le contre-jeu avant d'attaquer.
**Pourquoi** : Chaque échange de pièces augmente proportionnellement ton avantage (5 contre 2 vaut mieux que 39 contre 36). Les pions sont ce qui te permettra de promouvoir.
**Méthode** :
1. Vérifie la sécurité de ton roi et les menaces adverses.
2. Propose des échanges de pièces, surtout de la pièce adverse la plus active.
3. Crée un pion passé et pousse-le avec l'aide du roi.
4. Pas de complications inutiles : le coup simple et sûr suffit.
**Piège** : pressé de gagner, on laisse une pièce en prise ou on autorise un échec perpétuel.
**Maîtrise** : contre le moteur, depuis 10 positions avec une pièce d'avance, gagner 9 fois.

### `fin-opposite-bishops` · Fous de couleurs opposées
**Méta** : palier 3 · B · `fin-convert` · tags `bishopEndgame`
**Principe** : En finale pure, les fous de couleurs opposées font souvent nulle même avec un ou deux pions de moins. En milieu de partie, ils favorisent l'attaquant.
**Pourquoi** : Le défenseur bloque les pions sur les cases de la couleur de son fou ; l'autre fou ne peut jamais les attaquer.
**Maîtrise** : 6 positions « gagné ou nulle ? » à 80 %.

### `fin-queen-vs-pawn` · Dame contre pion sur la 7e
**Méta** : palier 3 · C · `mat-basic-queen` · tags `queenEndgame`
**Principe** : La dame gagne contre un pion central ou de cavalier sur la 7e (échecs puis rapprochement du roi), mais un pion de fou ou de tour fait souvent nulle si le roi attaquant est loin (ressource de pat).
**Maîtrise** : 4 positions contre le moteur.

### `meta-time-management` · Gérer son temps
**Méta** : palier 3 · A · `meta-play-slow`
**Principe** : Joue vite les coups évidents et les ouvertures connues, réfléchis longtemps aux moments critiques (une capture, un sacrifice, la fin de l'ouverture, une décision d'échange).
**Méthode** : en 15+10, viser environ 20 % du temps sur les 10 premiers coups ; jamais moins de 2 min à la pendule sans raison ; en zeitnot, simplifier.
**Maîtrise** : sur 10 parties, aucune perdue au temps dans une position gagnante ou égale.

### `meta-woodpecker` · La méthode pic-vert
**Méta** : palier 3 · B · `proc-forcing-moves`
**Principe** : Résoudre le même set de problèmes en cycles de plus en plus rapides grave les motifs dans la reconnaissance automatique.
**Méthode** : set de 100 à 300 problèmes de ton niveau ; premier cycle lent et juste ; puis refaire le set entier en moitié moins de temps, plusieurs fois.
**Maîtrise** : 3 cycles terminés avec ≥ 90 % de réussite au dernier.

---

## OUVERTURES : LE MINI-RÉPERTOIRE (paliers 2 et 3)

> Règle d'or jusqu'à 1500 : pas plus de 6 à 8 coups par ligne. On apprend **les plans et les pièges**, pas des listes de coups. Chaque ligne devient des cartes SRS `opening` (« trouve le coup suivant ») et une position « Jouer contre le moteur » à la fin de la ligne.

### `ouv-white-italian` · Avec les blancs : l'Italienne tranquille
**Méta** : palier 2 · A · `ouv-principles` · tags `opening` filtrés sur `OpeningTags` contenant `Italian_Game`
**Principe** : Développer vite, roquer, préparer d4 avec c3. Une structure simple qui marche contre presque tout après 1.e4 e5.
**Ligne de base [validé]** : 1.e4 e5 2.Cf3 Cc6 3.Fc4 Fc5 4.c3 Cf6 5.d3 d6 6.O-O O-O 7.Te1 a6 8.Fb3 Fa7 9.h3.
**Plans** : Cbd2-f1-g3 pour attaquer à l'aile roi ; d4 au bon moment pour ouvrir le centre ; a4 si les noirs jouent ...b5. h3 empêche ...Fg4 qui clouerait le Cf3.
**Ce que les noirs jouent souvent à petit niveau** : 3...Cf6 (défense des deux cavaliers, voir `ouv-early-traps`), 3...d6, 3...Fe7. Pour tous : même schéma c3, d3, O-O, Te1.
**Piège à éviter** : jouer d4 trop tôt sans avoir calculé ...exd4 et la reprise.
**Maîtrise** : jouer la ligne de mémoire et 3 parties contre le moteur depuis la position du 9e coup.

### `ouv-black-e5` · Avec les noirs contre 1.e4 : 1...e5
**Méta** : palier 2 · A · `ouv-principles` · tags `opening`
**Principe** : Répondre symétriquement au centre, développer Cc6, Cf6, Fc5 ou Fe7, roquer.
**Contenu** : contre l'Italienne, le même schéma que les blancs (...Fc5, ...d6, ...O-O, ...a6). Contre 2.Dh5, voir le mat du berger. Contre 3.Fc4 Cf6 4.Cg5, connaître 4...d5 5.exd5 Ca5. Contre l'écossaise (3.d4), 3...exd4 4.Cxd4 Fc5 ou Cf6.
**Maîtrise** : 3 parties contre le moteur avec un roque avant le 10e coup.

### `ouv-black-d5` · Avec les noirs contre 1.d4 : la structure d5-e6
**Méta** : palier 2 · A · `ouv-principles` · tags `opening`
**Principe** : d5, e6, Cf6, Fe7, O-O, puis ...c5 ou ...b6 et ...Fb7. Une base solide qui marche contre presque tous les systèmes avec d4.
**Lignes de base [validées]** :
- Contre le gambit dame : 1.d4 d5 2.c4 e6 3.Cc3 Cf6 4.Fg5 Fe7 5.e3 O-O 6.Cf3 h6 7.Fh4 b6.
- Contre le Londres : 1.d4 d5 2.Ff4 Cf6 3.e3 c5 4.c3 Cc6 5.Cd2 e6 6.Cgf3 Fd6 (on échange le fou f4 qui est la meilleure pièce blanche).
**Plans** : ...c5 pour attaquer le centre blanc ; le fou c8 est la pièce difficile, le sortir par b7 (après ...b6) ou f5 (avant ...e6).
**Maîtrise** : 3 parties contre le moteur depuis 1.d4.

### `ouv-gambits` · Gambits : accepter ou décliner ?
**Méta** : palier 3 · B · `ouv-principles`
**Principe** : Accepte un pion de gambit si tu peux continuer à développer. Si le garder te coûte plusieurs tempos ou ta sécurité, rends-le.
**Méthode** : après avoir pris, compte tes pièces développées contre les siennes ; si tu es en retard de 2 tempos ou plus, donne la priorité au développement et au roque.

---

## PALIER 4 : PENSER EN PLANS (1500 à 1800)

> Ces fiches se pratiquent moins avec des problèmes tactiques et plus avec des **positions à évaluer** : « Quel est le plan ? » avec 3 propositions sur l'échiquier (flèches), puis « Jouer cette position contre le moteur ». Codex doit prévoir un type d'exercice `plan-choice` : une position + 3 plans illustrés par des flèches + l'explication de chaque. Les positions viennent de parties de maîtres du domaine public (à sélectionner via la base Lichess `masterVsMaster` ou des parties classiques).

### `str-worst-piece` · Améliore ta pire pièce
**Méta** : palier 4 (introduit dès le palier 2) · S · `ouv-principles` · exercices `plan-choice`
**Principe** : Sans tactique ni menace, trouve ta pièce la moins active et donne-lui une meilleure case.
**Pourquoi** : Une position se gagne souvent par accumulation de petits avantages. Une pièce passive est un joueur de moins.
**Signaux** : un fou bloqué par ses propres pions, un cavalier au bord, une tour sur une colonne fermée, une dame qui ne fait rien.
**Méthode** :
1. Vérifie la routine anti-gaffe : rien d'urgent ?
2. Pour chaque pièce, demande-toi : « Que fait-elle ? »
3. Choisis la pire ; trouve une case où elle attaque quelque chose ou contrôle le centre.
4. Trouve le chemin (parfois 2 ou 3 coups).
**Maîtrise** : 10 positions `plan-choice` à 80 %.

### `str-open-files` · Colonnes ouvertes et 7e rangée
**Méta** : palier 4 · A · `str-worst-piece` · tags `rookEndgame`, exercices `plan-choice`
**Principe** : Les tours veulent les colonnes ouvertes (aucun pion) ou semi-ouvertes (pas de pion à toi). Une tour sur la 7e rangée attaque les pions et enferme le roi.
**Méthode** : repère la colonne qui va s'ouvrir ; mets-y une tour (ou double tes tours) ; entre sur la 7e quand c'est possible.
**Maîtrise** : 10 positions à 80 %.

### `str-outposts` · Les avant-postes
**Méta** : palier 4 · A · `str-worst-piece`
**Principe** : Une case dans le camp adverse qu'aucun pion adverse ne peut attaquer, défendue par un de tes pions, est idéale pour un cavalier.
**Pourquoi** : Un cavalier installé sur un avant-poste (souvent d5, e5, c5, f5) ne peut être chassé que par un échange et domine la position.
**Maîtrise** : 10 positions « trouve l'avant-poste » à 80 %.

### `str-good-bad-bishop` · Bon et mauvais fou
**Méta** : palier 4 · B · `str-pawn-structure`
**Principe** : Un fou est « mauvais » quand tes pions sont bloqués sur des cases de sa couleur. Place tes pions sur la couleur opposée à ton fou restant, ou échange ton mauvais fou.
**Maîtrise** : 6 positions à 80 %.

### `str-pawn-structure` · Les structures de pions
**Méta** : palier 4 · A · `vis-values`
**Principe** : Les pions ne reculent pas : chaque poussée crée des forces et des faiblesses permanentes.
**Contenu (un écran + une position chacun)** :
1. **Pion isolé** : aucun pion ami sur les colonnes voisines. Faible en finale, mais donne de l'activité en milieu de partie.
2. **Pions doublés** : deux pions sur la même colonne. Souvent faibles, mais ouvrent une colonne.
3. **Pion arriéré** : ne peut plus être soutenu par un pion voisin, sur une colonne semi-ouverte : cible.
4. **Chaîne de pions** : attaque la base de la chaîne adverse ; joue du côté où pointent tes pions.
5. **Majorité** : plus de pions sur une aile : peut créer un pion passé.
6. **Îlots de pions** : moins d'îlots = structure plus saine.
**Maîtrise** : 12 positions « nomme la faiblesse et la cible » à 80 %.

### `str-weak-squares` · Cases faibles et trous
**Méta** : palier 4 · B · `str-pawn-structure`
**Principe** : Une case qu'aucun pion ne peut plus défendre est une case faible ; si elle est près du roi ou au centre, installe-toi dessus.
**Maîtrise** : 6 positions à 75 %.

### `str-king-safety-middlegame` · Sécurité du roi en milieu de partie
**Méta** : palier 4 · A · `ouv-principles`, `mat-queen-support` · tags `kingsideAttack`, `queensideAttack`, `exposedKing`
**Principe** : Les pions devant ton roi roqué sont son toit : ne les pousse pas sans raison. Quand les roques sont opposés, la course commence : pousse tes pions vers le roi adverse.
**Méthode** : compte attaquants contre défenseurs autour de chaque roi ; ouvre des lignes vers le roi adverse le moins protégé ; en roques opposés, chaque tempo compte, n'hésite pas à sacrifier un pion pour ouvrir une colonne.
**Maîtrise** : 10 problèmes `kingsideAttack` à 70 %.

### `str-exchanges` · Quand échanger ?
**Méta** : palier 4 · A · `fin-convert`
**Principe** : Échange quand tu es devant au matériel, quand tu manques de place, ou pour éliminer une pièce adverse très active ou un défenseur clé. Évite d'échanger quand tu attaques ou quand tu es derrière.
**Maîtrise** : 10 positions « échanger ou pas ? » à 80 %.

### `str-prophylaxis` · La prophylaxie
**Méta** : palier 4 · A · `proc-opponent-threat` · tags `defensiveMove`
**Principe** : Avant ton plan, demande-toi quel est le sien. Le meilleur coup est parfois celui qui l'empêche.
**Pourquoi** : C'est l'extension stratégique de « que veut son dernier coup ? ».
**Maîtrise** : 8 positions `plan-choice` à 75 %.

### `str-initiative` · Développement et initiative
**Méta** : palier 4 · B · `ouv-principles`
**Principe** : Si tu as plus de pièces développées, ouvre le jeu (échanges de pions au centre) : l'avance se transforme en attaque. Si tu es en retard, garde le jeu fermé.
**Maîtrise** : 6 positions à 75 %.

### `str-bishop-pair-space` · Paire de fous et espace
**Méta** : palier 4 · C · `str-good-bad-bishop`
**Principe** : La paire de fous est forte dans les positions ouvertes ; ouvre le jeu si tu l'as. Avec plus d'espace, évite les échanges pour garder l'adversaire à l'étroit.

### `str-plan-making` · Construire un plan
**Méta** : palier 4 · A · toutes les fiches `str-*` de priorité A
**Principe** : Un plan naît des déséquilibres : matériel, structure de pions, pièces bonnes et mauvaises, colonnes, espace, sécurité des rois, développement.
**Méthode** :
1. Liste les déséquilibres (qui a quoi de mieux).
2. Choisis l'aile ou la cible où tu es plus fort.
3. Formule le plan en une phrase (« J'installe mon cavalier en d5 puis je double mes tours sur la colonne c »).
4. Trouve le premier coup qui sert ce plan sans rien laisser en prise.
**Maîtrise** : 10 positions où la phrase du plan est jugée correcte (QCM de 3 plans illustrés) à 80 %.

---

## ANNEXE A : correspondance thèmes Lichess → fiches

| Tag Lichess | Fiche(s) |
|---|---|
| `hangingPiece` | `proc-hanging-pieces`, `proc-free-material`, `vis-attacked-squares` |
| `fork` | `tac-fork` |
| `pin` | `tac-pin` |
| `skewer` | `tac-skewer` |
| `discoveredAttack`, `discoveredCheck` | `tac-discovered` |
| `doubleCheck` | `tac-double-check` |
| `capturingDefender` | `tac-remove-defender`, `tac-overload` |
| `deflection` | `tac-deflection`, `tac-overload` |
| `attraction` | `tac-attraction` |
| `trappedPiece` | `tac-trapped-piece` |
| `advancedPawn`, `promotion`, `underPromotion` | `tac-promotion`, `fin-passed-pawn` |
| `intermezzo` | `tac-intermezzo` |
| `xRayAttack` | `tac-xray` |
| `interference`, `clearance` | `tac-interference-clearance` |
| `quietMove` | `tac-quiet-move` |
| `defensiveMove` | `vis-check-escape`, `proc-opponent-threat`, `str-prophylaxis` |
| `backRankMate` | `mat-back-rank` |
| `mateIn1`, `mateIn2` | `mat-queen-support`, `mat-two-rooks` |
| `mateIn3`, `mateIn4`, `mateIn5`, `long`, `veryLong` | `proc-candidates-calc` |
| `smotheredMate` | `mat-smothered` |
| `arabianMate` | `mat-arabian` |
| `anastasiaMate` | `mat-anastasia` |
| `bodenMate` | `mat-boden` |
| `hookMate`, `doubleBishopMate`, `dovetailMate`, `epauletteMate`, `cornerMate`, `killBoxMate`, `operaMate`, `pillsburysMate`, `morphysMate`, `swallowstailMate`, `triangleMate`, `vukovicMate`, `balestraMate`, `blindSwineMate` | `mat-patterns-misc` |
| `attackingF2F7` | `ouv-early-traps` |
| `kingsideAttack`, `queensideAttack`, `exposedKing`, `sacrifice` | `str-king-safety-middlegame`, `mat-greek-gift` |
| `pawnEndgame`, `zugzwang` | `fin-active-king`, `fin-opposition`, `fin-square` |
| `rookEndgame` | `fin-rook-behind`, `str-open-files` |
| `bishopEndgame` | `fin-opposite-bishops` |
| `queenEndgame`, `queenRookEndgame` | `fin-queen-vs-pawn` |
| `endgame`, `crushing` | `fin-convert`, `proc-free-material` |
| `opening` | `ouv-principles` et fiches `ouv-*` (filtrer avec `OpeningTags`) |

Pour les problèmes mélangés, exclure `equality` jusqu'au palier 3 (positions où l'objectif est de ne pas perdre, déroutant pour débuter).

---

## ANNEXE B : ordre d'apprentissage des 30 premiers jours (rythme 25 min/jour)

| Jours | Nouvelles fiches | Pratique dominante |
|---|---|---|
| 1-2 | `vis-rules`, `vis-notation` | Trouve la case (5 min/jour jusqu'à maîtrise) |
| 3-4 | `vis-values`, `vis-attacked-squares` | Pièces en prise, compte les attaquants |
| 5-6 | `vis-check-escape`, `mat-basic-queen` | Mat D+R contre le moteur |
| 7 | `mat-two-rooks`, `vis-draws` | Révision + premières parties lentes |
| 8-9 | `proc-blunder-check`, `proc-opponent-threat` | Parties contre le moteur en mode coach |
| 10-11 | `proc-hanging-pieces`, `proc-exchange-count` | `hangingPiece`, captures et reprises |
| 12 | `ouv-principles`, `meta-play-slow` | Parties lentes |
| 13 | `meta-game-review`, `ouv-early-traps` | Analyse des parties de la semaine |
| 14-15 | `tac-fork` | `fork` |
| 16-17 | `tac-pin`, `tac-skewer` | `pin`, `skewer` |
| 18-19 | `tac-discovered`, `tac-double-check` | mélangé |
| 20-21 | `mat-back-rank`, `mat-queen-support` | `backRankMate`, `mateIn1`, `mateIn2` |
| 22-23 | `tac-remove-defender`, `tac-overload` | mélangé |
| 24 | `proc-forcing-moves` | mélangé au-dessus de ton classement |
| 25-26 | `ouv-white-italian`, `ouv-black-e5`, `ouv-black-d5` | cartes `opening` + parties |
| 27-28 | `fin-active-king`, `fin-square` | `pawnEndgame` |
| 29-30 | `fin-opposition`, `str-worst-piece` | R+P contre R contre le moteur |

L'ordre réel est piloté par l'algorithme de séance (brief §3.2) : une fiche n'est ouverte que si les précédentes sont « en pratique » au minimum, et les révisions passent toujours avant.

---

## ANNEXE C : correspondance anciens contenus → nouvelles fiches (pour la migration)

| Ancien id (modules actuels) | Nouvelle fiche |
|---|---|
| `pieces`, `special`, `check` | `vis-rules`, `vis-check-escape` |
| `value`, `captures` (academy, essentials, deep), `scan` | `vis-values`, `proc-exchange-count`, `proc-blunder-check` |
| `defense`, `defend-scholar` | `ouv-early-traps`, `proc-opponent-threat` |
| `fork`, `forks`, `fork-finish` | `tac-fork` |
| `pin`, `pins` | `tac-pin` |
| `skewer` | `tac-skewer` |
| `exchange-chain` | `proc-exchange-count` |
| `mate`, `mates`, `backrank` | `mat-back-rank` |
| `ladder-two` | `mat-two-rooks` |
| `finish` | `mat-basic-queen` |
| `endings`, `endgame` | `vis-draws`, `fin-opposition`, `tac-promotion` |
| `king-endgame` | `fin-active-king` |
| `opening`, `center`, `development`, `queen-time`, `king-safety` | `ouv-principles` |
| `italian`, `italian-plan` | `ouv-white-italian` |
| `black-plan`, `black-e4`, `black-d4` | `ouv-black-e5`, `ouv-black-d5` |
| `candidates` | `proc-candidates-calc` |
| `convert`, `convert-advantage` | `fin-convert` |
| `improve`, `active-piece` | `str-worst-piece` |
| `review-game` | `meta-game-review` |
| `coordinated-attack` | `str-king-safety-middlegame` |
| `pawn-break` | `str-pawn-structure` |
| vidéos `scotch`, `london`, `queens-gambit`, `caro-kann`, `french`, `sicilian` | rattachées en `videoId` aux fiches `ouv-*` (contenu bonus, hors parcours principal) |
| principes Julien Song (`threats`, `signals`, `active`, `opening`, `calculation`, `review`) | champ `sources` de `proc-opponent-threat`, `proc-forcing-moves`, format actif des fiches, `ouv-principles`, `proc-candidates-calc`, `meta-game-review` |

---

## ANNEXE D : références (pour le champ `sources` et la culture de Codex)

- Base de problèmes Lichess (CC0) et liste officielle des thèmes : database.lichess.org et le fichier `puzzleTheme.xml` du dépôt `lichess-org/lila`.
- Julien Song : articles déjà cités dans `song-method.js` (garder les URL existantes).
- Dan Heisman : la notion de « hope chess » contre « real chess » (la routine anti-gaffe).
- John Nunn : « Loose pieces drop off » (les pièces non défendues tombent).
- Jeremy Silman : l'approche par les déséquilibres pour construire un plan.
- José Raúl Capablanca : l'idée d'étudier tôt les finales simples.
- Siegbert Tarrasch : les tours derrière les pions passés.
- Axel Smith et Hans Tikkanen : la méthode pic-vert (Woodpecker).
