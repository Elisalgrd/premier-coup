# Vérification 2.11.0

- 84 tests automatiques : ordre cours/quiz/pratique, progression indépendante de la maîtrise, reprise quotidienne et entre journées, conservation des acquis, interruption d’une mise à niveau, prises, reprises, promotion, mat et orientations.
- Stockfish profondeur 12 sur une partie complète courte, dans les deux camps. Chaque action des suites affichées est rejouée par les règles. Rapport reproductible : `node tests/personal-engine-audit.mjs`, résultat `personal-engine-audit.json`.
- 72 fiches, 510 positions et 434 actions validées. Le premier cours ajoute un roque effectivement jouable et des explications en langage courant.
- Contrôle navigateur à 390 × 844 : accueil avec cours, reprise d’une étape, démonstration de roque, quiz faux puis vrai, exercice guidé, import d’une partie de test et analyse réelle par le Worker. Bilan personnel, comparaison du mat et de sa défense, navigation dans la suite et retour au bilan.
- Vérification sur navigateur redimensionné ; aucun test physique sur iPhone. Les premières connexions du pilote ont échoué, puis le contrôle a pu être effectué.
- Les explications personnelles sont écrites et animées. L’audio préenregistré est clairement présenté comme le principe général.

- Contrôle à 1280 × 900 également effectué. La suite calculée avance et recule, le cours recommandé correspond à la menace réelle, et la console ne présente aucune erreur. Les commandes de revue restent dans le flux sur mobile pour ne pas couvrir les textes longs.
