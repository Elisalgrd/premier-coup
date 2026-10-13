// A teaching path is separate from mastery. A lesson can be learned today and
// still need spaced practice tomorrow; that must not block the next lesson.
export const dailyCourses = [
  {
    id: "ouv-principles", goal: "Construire une bonne position dès le début",
    why: "Tu n’as pas besoin de retenir vingt coups par cœur. Tu vas apprendre à choisir tes coups avec trois objectifs : prendre de la place au milieu, faire participer tes pièces et protéger ton roi.",
    question: "Ton roi n’est pas menacé. Tu peux sortir un cavalier encore sur sa case de départ, ou bouger ta dame une troisième fois pour attaquer un pion. Quelle idée examiner d’abord ?",
    answers: ["Faire participer le cavalier", "Rejouer la dame, car elle est plus puissante"], correct: 0,
    feedback: "Examine d’abord le cavalier : une pièce supplémentaire pourra aider. La dame peut attendre, sauf si son coup gagne quelque chose de concret ou répond à un danger. Ces objectifs guident ton choix ; ce ne sont pas des interdictions.",
    transfer: "Pendant tes premiers coups : est-ce que je fais participer une nouvelle pièce, est-ce que j’agis au milieu, ou est-ce que je protège mon roi ? Vérifie d’abord les dangers immédiats.",
  },
  {
    id: "proc-opponent-threat", goal: "Comprendre le projet de l’adversaire",
    why: "Un coup adverse change la position. Avant de poursuivre ton idée, tu vas apprendre à regarder ce que sa pièce attaque maintenant et ce que son déplacement a libéré derrière elle.",
    question: "L’adversaire vient de bouger son fou. Quelle est ta première recherche ?",
    answers: ["Comment attaquer son roi tout de suite", "Ce que son fou vise et la ligne qu’il vient de libérer"], correct: 1,
    feedback: "Regarde les deux : l’arrivée du fou ET son ancienne place. Son déplacement peut ouvrir le passage à sa tour ou à sa dame. Si rien d’urgent n’apparaît, tu peux reprendre ton propre plan.",
    transfer: "Après chaque coup adverse : qu’est-ce qui est attaqué maintenant ? Qu’est-ce qui est devenu accessible derrière la pièce qui a bougé ?",
  },
  {
    id: "proc-blunder-check", goal: "Arrêter de donner des pièces",
    why: "Une bonne idée ne suffit pas si ta pièce peut être prise en arrivant. Tu vas apprendre à imaginer ton coup déjà joué, puis à regarder la meilleure réponse adverse avant de toucher la pièce.",
    question: "Tu as trouvé une attaque tentante. Quand faut-il vérifier les prises adverses ?",
    answers: ["Dans la position actuelle seulement", "Dans la position obtenue après ton coup"], correct: 1,
    feedback: "Après ton coup. En partant, ta pièce peut cesser d’en protéger une autre. Et sa case d’arrivée peut être attaquée. Imagine le déplacement, puis demande-toi ce que l’adversaire peut prendre.",
    transfer: "Juste avant de jouer : si ma pièce est déjà arrivée, que peut prendre l’adversaire ? Est-ce que je peux reprendre ? Qu’ai-je cessé de protéger ?",
  },
  {
    id: "proc-free-material", goal: "Repérer les pièces que tu peux gagner",
    why: "Parfois le meilleur coup est sous tes yeux : une pièce adverse peut être prise. Mais une pièce attaquée n’est pas forcément offerte. Tu vas vérifier qui peut reprendre, et avec quoi.",
    question: "Ta dame peut prendre un cavalier protégé par un pion. Est-ce forcément une bonne prise ?",
    answers: ["Non : le pion pourrait prendre ma dame ensuite", "Oui : gagner un cavalier est toujours bon"], correct: 0,
    feedback: "Tu prendrais un cavalier mais tu pourrais perdre ta dame, qui vaut beaucoup plus. Suis la prise ET la reprise. Si tu laisses ton roi se faire attaquer sans défense, le compte des pièces ne suffit même plus.",
    transfer: "Cherche les pièces adverses accessibles. Pour chaque prise : qui pourrait prendre ma pièce ensuite ? Quel serait le bilan réel ?",
  },
  {
    id: "tac-fork", goal: "Créer deux menaces en un seul coup",
    why: "Une fourchette, c’est une seule pièce qui attaque deux cibles à la fois. Tu vas voir comment choisir les deux cibles et pourquoi l’adversaire ne peut pas toujours sauver les deux.",
    question: "Ton cavalier peut attaquer à la fois le roi et une tour. Que doit faire l’adversaire en priorité ?",
    answers: ["Sauver sa tour", "Mettre son roi hors de danger"], correct: 1,
    feedback: "Il doit sauver son roi. Tu peux ensuite envisager de prendre la tour. Vérifie quand même qu’il ne peut pas capturer ton cavalier pour résoudre les deux problèmes d’un seul coup.",
    transfer: "Repère deux cibles importantes assez proches. Cherche une case d’où une seule de tes pièces les attaque ensemble, puis vérifie que cette pièce ne peut pas être prise.",
  },
  {
    id: "tac-pin", goal: "Profiter d’une pièce qui protège plus important derrière elle",
    why: "Une pièce peut sembler libre de bouger mais cacher son roi ou sa dame. Cela s’appelle un clouage. Tu vas apprendre à regarder les pièces alignées et à attaquer la pièce du milieu.",
    question: "Un cavalier est entre ton fou et le roi adverse. Peut-il partir en laissant son roi directement attaqué ?",
    answers: ["Non, ce déplacement serait interdit", "Oui, l’adversaire choisit la pièce qu’il préfère sauver"], correct: 0,
    feedback: "Il est interdit de laisser son propre roi attaqué. Si c’était une dame derrière le cavalier, son départ serait légal, mais pourrait coûter cette dame. La différence change ce que tu peux prévoir.",
    transfer: "Regarde derrière les pièces adverses : y a-t-il un roi ou une dame sur la même ligne ? Peux-tu augmenter la pression sur la pièce qui les masque ?",
  },
  {
    id: "mat-back-rank", goal: "Reconnaître un roi enfermé derrière ses pions",
    why: "Une tour peut suffire à terminer la partie si le roi adverse n’a aucune sortie. Tu vas distinguer une simple attaque contre le roi d’une attaque à laquelle il ne peut plus répondre.",
    question: "Ta tour attaque le roi sur sa rangée du fond. Qu’est-ce qu’il reste à vérifier avant d’annoncer la fin de la partie ?",
    answers: ["Rien : une tour au fond gagne toujours", "Les sorties du roi, les prises de ma tour et les pièces qui peuvent s’interposer"], correct: 1,
    feedback: "Il faut éliminer ces trois défenses. Si aucune n’existe, c’est échec et mat : le roi est attaqué et aucun coup légal ne le sauve. Un roi enfermé n’est pas forcément déjà perdu.",
    transfer: "Surveille les rois coincés par leurs propres pions. Avant de lancer ta tour : peut-elle être prise, une pièce peut-elle bloquer la ligne, le roi a-t-il une sortie ?",
  },
  {
    id: "proc-forcing-moves", goal: "Chercher dans le bon ordre",
    why: "Regarder toutes les possibilités à la fois fatigue et disperse. Tu vas examiner d’abord les coups qui obligent l’adversaire à réagir : les attaques contre son roi, les prises, puis les menaces directes.",
    question: "Tu trouves un coup qui attaque le roi. Est-ce forcément le meilleur ?",
    answers: ["Non : je dois regarder la réponse adverse", "Oui : il faut toujours attaquer le roi dès que possible"], correct: 0,
    feedback: "C’est un candidat à examiner en premier, pas un coup à jouer automatiquement. L’adversaire peut repousser ton attaque en prenant ta pièce ou en améliorant sa position.",
    transfer: "Vérifie d’abord la sécurité de ton roi. Puis examine : attaques contre son roi, prises, menaces. Pour chaque candidat, cherche sa meilleure réponse.",
  },
  {
    id: "proc-candidates-calc", goal: "Comparer deux idées avant de décider",
    why: "Le premier coup qui te plaît n’est pas forcément le plus utile. Tu vas apprendre à comparer deux possibilités avec la même question : que ferait un adversaire qui se défend bien ?",
    question: "Tu imagines une attaque. Quelle réponse adverse dois-tu utiliser pour la vérifier ?",
    answers: ["Celle qui te permet de réussir ton attaque", "La défense qui gêne le plus ton idée"], correct: 1,
    feedback: "Cherche la défense la plus gênante. Si ton idée fonctionne encore, elle devient crédible. Si elle échoue, tu peux choisir ton autre candidat avant d’avoir perdu une pièce.",
    transfer: "Choisis deux coups possibles. Pour chacun : mon coup, sa meilleure réponse, ma suite. Compare les deux positions obtenues, pas seulement l’apparence du premier coup.",
  },
];

// Plans for quiet positions belong in the core path, alongside tactics.
dailyCourses.splice(4, 0, {
  id: "str-worst-piece", goal: "Trouver un plan quand rien ne semble urgent",
  why: "Tu as vérifié les dangers et tu ne vois aucune prise intéressante. Ne pousse pas un pion au hasard. Cherche la pièce qui aide le moins ton équipe : tu vas apprendre à lui trouver une case plus utile, avec une destination et un trajet.",
  question: "Aucune menace immédiate. Une tour est bloquée derrière tes pions et un cavalier est déjà très bien placé. Quelle pièce examiner en premier ?",
  answers: ["La tour : comment lui donner une ligne utile ?", "Le cavalier : rejouer la meilleure pièce est toujours utile"], correct: 0,
  feedback: "Examine la tour. Améliorer une pièce inactive peut renforcer toute ta position. Il faut vérifier le trajet et la sécurité de la case choisie ; bouger une pièce ne l’améliore pas automatiquement.",
  transfer: "Sans urgence : quelle pièce aide le moins ? Quelle case lui donnerait un rôle ? Quel trajet sûr permet de l’y amener ?",
});
dailyCourses.splice(7, 0, {
  id: "str-open-files", goal: "Donner une route à tes tours",
  why: "Une tour est puissante quand rien ne bloque son passage. Une colonne sans aucun pion s’appelle une colonne ouverte. Tu vas voir comment y placer une tour, puis chercher une cible à l’autre bout, au lieu de déplacer la tour sans objectif.",
  question: "Tu peux placer une tour sur une colonne sans pion. Qu’est-ce qui rend ce projet vraiment utile ?",
  answers: ["Le simple fait que la colonne soit vide", "Une case d’entrée ou une cible que ma tour pourra atteindre"], correct: 1,
  feedback: "Une route est surtout utile si elle mène quelque part. Cherche une pièce à viser ou une case où entrer dans le camp adverse. Vérifie aussi si l’adversaire peut échanger ta tour ou fermer le passage.",
  transfer: "Pour mes tours : où est le passage libre ? Quelle cible se trouve au bout ? Puis-je y entrer sans donner ma tour ?",
});
dailyCourses.push({
  id: "str-exchanges", goal: "Échanger pour améliorer ta position",
  why: "Prendre une pièce de même valeur n’est pas une obligation. Un échange peut enlever un défenseur gênant, ou au contraire aider l’adversaire. Tu vas comparer la position obtenue après la prise ET la reprise.",
  question: "Ton fou peut prendre un cavalier de même valeur. Que faut-il comparer ?",
  answers: ["Seulement leur valeur : trois contre trois", "Le rôle des pièces et la position après la reprise"], correct: 1,
  feedback: "La valeur donne un premier repère. Mais si tu échanges ton fou très actif contre un cavalier bloqué, tu peux rendre service à l’adversaire. À l’inverse, enlever un bon défenseur peut faciliter ton attaque.",
  transfer: "Avant un échange : quelle pièce adverse disparaît, laquelle de mes pièces disparaît, et qui aime le plus la position après la reprise ?",
}, {
  id: "fin-active-king", goal: "Faire travailler ton roi en fin de partie",
  why: "Au début, ton roi a besoin d’un abri. Quand les dames ont disparu et que les attaques sont moins dangereuses, il peut devenir une pièce de combat. Tu vas apprendre à l’approcher des pions sans l’exposer aux attaques des pièces restantes.",
  question: "Il reste surtout les rois et des pions. Ton roi est loin de l’action. Faut-il toujours le garder dans son coin ?",
  answers: ["Non : je cherche un trajet sûr pour aider mes pions", "Oui : un roi doit rester immobile toute la partie"], correct: 0,
  feedback: "Ton roi peut aider à protéger ou prendre des pions. Il ne peut jamais aller sur une case attaquée, et il faut encore surveiller les pièces restantes. La règle est d’adapter son rôle au danger, pas de le garder toujours au fond.",
  transfer: "Quand les attaques ont diminué : mon roi peut-il aider un pion ou en attaquer un ? Quelle route sûre lui permet de participer ?",
});

export function courseFor(entry) {
  return dailyCourses.find(c => c.id === entry.id) || {
    id: entry.id, goal: entry.title, why: entry.principle,
    transfer: entry.retenir || entry.principle,
    question: "Après l’exemple, comment vérifier que cette idée marche dans une autre position ?",
    answers: ["Rejouer exactement le même mouvement", "Vérifier les cibles, les défenses et la réponse adverse"], correct: 1,
    feedback: "On réutilise le raisonnement. L’emplacement des pièces peut changer ; vérifie toujours la réponse adverse avant de jouer.",
  };
}

export function nextDailyEntry(state, entries) {
  const learned = id => !!(state.entries[id]?.viewedAt || state.entries[id]?.lesson?.finished);
  const path = [...dailyCourses.map(c => entries.find(e => e.id === c.id)).filter(Boolean),
    ...entries.filter(e => e.tier > 0 && !dailyCourses.some(c => c.id === e.id))];
  return path.find(e => !learned(e.id)) || path.slice().sort((a,b) =>
    String(state.entries[a.id]?.lastTaught || state.entries[a.id]?.viewedAt || "").localeCompare(String(state.entries[b.id]?.lastTaught || state.entries[b.id]?.viewedAt || "")))[0] || entries[0];
}
