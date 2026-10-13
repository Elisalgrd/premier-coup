export const mistakeQuestions = {
  "Pièce laissée en prise": "Après mon coup, quelle pièce n’est plus protégée ?",
  "Menace adverse ignorée": "Qu’attaque son dernier coup ?",
  "Capture gratuite ratée": "Est-ce qu’une de ses pièces n’est protégée par personne ?",
  "Fourchette subie": "Est-ce qu’une de ses pièces peut attaquer deux des miennes en un coup ?",
  "Mat raté": "Ai-je regardé toutes les attaques directes sur le roi avant de jouer ?",
  "Mat du couloir": "Mon roi a-t-il une case de fuite ?",
  "Clouage subi": "Cette pièce protège-t-elle mon roi ou ma dame derrière elle ?",
  "Autre décision à revoir": "Quels sont mes deux meilleurs coups, et sa meilleure réponse à chacun ?",
};
export const mistakeQuestion = label => mistakeQuestions[label] || mistakeQuestions["Autre décision à revoir"];
