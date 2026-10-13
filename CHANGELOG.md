# 2.6.0 — Revue animée et commentée

- Relecture locale avec narration française, sous-titres, flèches et chapitres.
- Lecture, pause, navigation entre erreurs et trois vitesses ; reprise synchronisée.
- Accès depuis la fin de partie, les rapports, les parties et chaque révision.
- Voix locales sélectionnables ; lecture par sous-titres si aucune voix ne fonctionne.

# 2.5.0 — Toutes les erreurs de la partie

- Analyse chronologique complète, imprécisions séparées et ancien top 5 conservé.
- Textes du coach partagés, question concrète par erreur, fusion sans doublon.
- Relance des anciens rapports sans effacer leurs données en cas d’interruption.

# 2.4.1 — Alertes visibles sur mobile

- Badges sur la case du coup fautif, dans les deux orientations.
- Conseil flottant puis compteur, feuille non modale refermable sans arrêter la partie.
- Suppression du lien hors écran ; analyses tardives sans badge sur un coup dépassé.

# Changelog

## 2.4.0

- Coach après chaque coup, avec moteur séparé, trois modes et explications sans chiffres de moteur.
- Mini-échiquier indépendant, meilleur coup en vert, réponse adverse en rouge et historique des conseils.
- Les erreurs rejoignent immédiatement les révisions, sans doublon après l’analyse finale.
- Trois reprises maximum en entraînement, avec commentaire dans la partie et compteur au bilan.
- Cadences 10+5 et 15+10, cette dernière proposée par défaut. Les anciennes parties conservent leur rythme.
- Bilan du coach et principe à revoir en fin de partie.

## 2.3.0

- Deux bandeaux joueur montrent les horloges, les pièces prises et l’avance en matériel. Ton camp reste en bas.
- Les prises sont calculées depuis les coups réels, y compris les prises en passant et les pièces promues.
- Les mêmes bandeaux accompagnent les moments analysés et la nouvelle relecture coup par coup des parties importées.

## 2.2.0

- Bilan sauvegardé à la fin des séries : réussites au premier essai, évolution du classement et statut de la leçon.
- La condition manquante pour valider la leçon est expliquée dans le bilan, À retenir et le catalogue.
- Confirmation discrète après sauvegarde, avec reprise des compteurs de série après fermeture. Les règles de maîtrise restent inchangées.

## 2.1.3

- Une analyse interrompue reste à faire, même après avoir quitté son écran.
- Les parties en attente, y compris les anciennes, sont visibles dans Aujourd’hui et S’entraîner.
- Le statut terminé et les exercices issus de la partie ne sont enregistrés qu’après une analyse complète.

## 2.1.2

- Les mises à jour rechargent les fichiers de l’interface pour éviter de mélanger un nouvel écran et un ancien module conservé dans le cache HTTP. La progression reste intacte.

## 2.1.1

- Le glossaire distingue « jouer aux échecs » d’un roi en échec, et ne transforme plus « nulle part » en définition de partie nulle.

## 2.1.0

- Intégré les 20 fiches V2 fournies et réécrit les 52 autres en langage simple.
- Ajouté le tutoriel de premier lancement et le glossaire illustré accessible au toucher.
- Remplacé les dix étapes fixes par les écrans réellement présents, chacun avec son échiquier.
- Ajouté les démonstrations commentées avec précédent, suivant, rejouer et reprise.
- Pris en charge les réponses alternatives, les suites de coups et les réponses adverses en rouge.
- Réécrit les libellés de l’interface et les descriptions des coups avec le nom des pièces et leurs cases.
- Préservé les acquis, l’historique, les dates de révision et les 16 vidéos existantes.
- Ajouté les vérifications de vocabulaire, les tests du lecteur et l’audit Stockfish de 107 défis/exercices.
- Corrigé deux positions de défi et deux explications des fichiers fournis ; voir `docs/TON_CORRECTIONS.md`.

## 2.0.0

- Remplacé les systèmes parallèles de leçons par un catalogue unique de 71 fiches.
- Remplacé la navigation précédente par Aujourd’hui, Catalogue, S’entraîner et Progrès.
- Ajouté le lecteur actif, les exemples légaux, la notation française, les coordonnées et la reprise étape par étape.
- Intégré 16 469 problèmes Lichess distincts, Elo adaptatif, indices, réfutations et reprise des séries.
- Ajouté Leitner, séance quotidienne, cartes d’erreur et cycles pic-vert.
- Ajouté six mini-jeux de vision et leurs scores.
- Intégré Stockfish 18 mono-thread, jeu, import PGN/Lichess/Chess.com, rapport et erreurs à rejouer.
- Ajouté le test de placement, les courbes et les réglages de lecture.
- Migré la progression v1 sans l’effacer ni inventer des notions maîtrisées.
- Conservé les 16 vidéos masculines avec sous-titres, rattachées aux fiches.
- Supprimé les anciens modules et variantes audio/vidéo en doublon. Audio court laissé vide quand il ne correspond plus au texte.
- Unifié la version du shell, des assets et du cache. Déploiement GitHub Actions et documentation des licences.
