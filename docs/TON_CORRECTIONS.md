# Corrections vérifiées lors de l’intégration V2

Les trois fichiers fournis restent intacts à la racine. Les corrections ci-dessous s’appliquent à leur compilation dans `curriculum/entries`.

- **Clouage (`tac-pin`)** : le défi initial attendait `f2f3`. À profondeur 16, son score était inférieur au seuil demandé par le brief, face à une attaque plus forte sur le roi. Le défi utilise désormais la position de l’exercice fourni : la dame en e2 prend le cavalier en e5, car le pion en d6 ne peut pas quitter la colonne de son roi. La démonstration d’origine reste une illustration légale.
- **Supprimer le défenseur (`tac-remove-defender`)** : la position initiale permettait un mat en trois avec la tour ou la dame, plus fort que la prise du cavalier enseignée. La dame blanche commence maintenant en a4 et le pion noir en h6. La suite fou g5 prend f6, pion g7 reprend f6, dame a4 prend d7 est légale et passe le seuil moteur demandé. Le contre-exemple distinct est conservé.
- **Opposition (`fin-opposition`)** : le pion avançant de e6 à e7 ne donne pas échec au roi en e8. Le commentaire ne l’annonce plus.
- **Vérifier son coup (`proc-blunder-check`)** : un écran parlait d’une tour en e1 alors qu’elle était encore en e8. Le texte annonce maintenant le déplacement possible et une démonstration `e8e1` montre le mat.
- **Premières utilisations** : 25 occurrences emploient un terme avant ses prérequis déclarés. Une définition courte est ajoutée dans la phrase ; le terme est déclaré localement. Les textes trop longs sont scindés en conservant leur position. Liste dans `ton-inline-definitions.json`.

Les fiches restantes utilisent des positions validées et, pour les exercices de coups, auditées avec Stockfish. Les titres d’origine et les métadonnées de progression sont conservés. Certaines questions portent sur une case ou une règle, et ne prétendent pas demander le meilleur coup.

Le rapport `ton-engine-supplied.json` garde la trace des deux défis initiaux signalés. `ton-engine-all.json` décrit les 107 défis/exercices de coups intégrés après correction, sans réponse acceptée hors du seuil demandé. La profondeur limitée ne constitue pas une preuve mathématique de tous les meilleurs coups possibles.
