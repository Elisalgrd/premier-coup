import {Chess} from './chess.js';
import {boardHtml,position,courses} from './academy.js?v=18';
import {lessonForPuzzle} from './puzzle-lessons.js?v=18';
import {deepLessonFor} from './deep-lessons.js?v=18';
const names={p:'pion',n:'cavalier',b:'fou',r:'tour',q:'dame',k:'roi'};
const article=t=>['q','r'].includes(t)?'la ':'le ';
const points={p:1,n:3,b:3,r:5,q:9,k:0};
export function place(square,flipped=false){let x=square.charCodeAt(0)-97,y=8-Number(square[1]);if(flipped){x=7-x;y=7-y;}const h=x<2?'à gauche':x>5?'à droite':x<4?'à gauche du milieu':'à droite du milieu';return (y<2?'en haut ':y>5?'en bas ':'vers le milieu, ')+h;}
export function naturalBoard(g,opts={}){return boardHtml(g,opts).replace(/<span class="coord (?:rank|file)">.*?<\/span>/g,'').replace(/aria-label="([a-h][1-8])([^"<]*)"/g,(_,sq,tail)=>`aria-label="${place(sq,opts.flipped)}${tail}, rangée ${opts.flipped?Number(sq[1]):9-Number(sq[1])} depuis le haut, case ${opts.flipped?104-sq.charCodeAt(0):sq.charCodeAt(0)-96} depuis la gauche"`);}
export function practiceGame(p,r){if(r.mateChoice){const g=position(p);try{g.move({from:r.mateChoice.slice(0,2),to:r.mateChoice.slice(2,4),promotion:r.mateChoice[4]});if(g.isCheckmate())return g;}catch{}}return null;}
export function practiceTopic(p){return deepLessonFor(lessonForPuzzle(p,courses).id)||deepLessonFor(p.lesson||p.principle)||deepLessonFor('captures');}
export function practiceGoal(p){const id=p.variantOf||p.id,topic=practiceTopic(p).id;
 if(p.mate||p.mateEnd)return 'Trouve un coup qui fait échec et mat. Vérifie toutes les défenses.';
 if(p.principle==='king-endgame')return 'Rapproche ton roi de son pion pour l’aider, sur une case sûre.';
 if(p.principle==='king-safety'||id==='castle')return 'Mets ton roi à l’abri en faisant le petit roque.';
 if(p.principle==='center')return p.side==='b'?'Réponds au pion central adverse : avance de deux cases le pion devant ton roi.':'Prends de la place au milieu avec le pion devant ton roi ou ta dame.';
 if(p.principle==='queen-time')return 'Sors le cavalier proche de ton roi vers le milieu pour le faire participer.';
 if(p.principle==='development')return p.side==='b'?'Sors le cavalier qui peut protéger ton pion central attaqué.':'Sors un cavalier vers le milieu pour le faire participer utilement.';
 if(p.principle==='active-piece'||id==='open-file')return 'Place ta tour sur une ligne verticale sans pion pour lui donner de l’activité.';
 if(/promotion|stalemate/.test(id))return 'Choisis une promotion qui conserve ton avantage sans provoquer de pat.';
 if(/defen|scholar/.test(id))return 'Protège ton roi de la menace de mat. Après la réponse, vérifie le nouveau danger.';
 if(topic==='italian')return 'Prépare la poussée du pion devant ta dame en lui donnant un soutien avec le pion voisin.';
 if(topic==='forks')return 'Attaque deux cibles en un seul coup. Puis encaisse le gain après la réponse montrée.';
 if(topic==='pins')return 'Gagne du matériel en repérant le défenseur qui ne peut pas quitter la ligne de son roi.';
 return 'Trouve une capture avantageuse. Vérifie ce que l’adversaire pourra reprendre.';
}
export function practiceExplanation(p,r){const g=practiceGame(p,r)||position(p),line=[...(p.line||p.solution)];if(r.choice)line[0]=r.choice;let first,last;if(!r.mateChoice)for(const uci of line.slice(0,r.moveIndex)){const m=g.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]});first??=m;last=m;}
 if(g.isCheckmate())return 'Le roi adverse est attaqué. Il ne peut ni fuir sur une case sûre, ni capturer l’attaquant, ni bloquer la ligne : c’est mat. Regarde les portes fermées autour de lui.';
 if(last?.promotion)return last.promotion==='r'?'Tu as choisi une tour à la promotion. Le roi adverse garde un coup légal : tu évites le pat et conserves une finale gagnante. Il reste à la jouer avec précision.':'Ton pion arrivé au bout a été remplacé par une '+names[last.promotion]+'. La promotion donne une nouvelle pièce à ton équipe ; vérifie ensuite les menaces et les possibilités de mat.';
 if(p.principle==='king-safety'||(p.variantOf||p.id)==='castle')return 'Ton roi a fait deux pas vers la tour, puis la tour a changé de côté. Le roi est derrière ses pions et la tour se rapproche du milieu : un seul coup améliore les deux pièces.';
 if(p.principle==='king-endgame')return 'Ton roi se rapproche du pion pour le soutenir. Dans cette finale sans grosses pièces, il peut participer ; sa case d’arrivée reste hors des attaques adverses.';
 if(p.principle==='development'||p.principle==='queen-time')return 'Ton cavalier quitte sa case de départ pour agir vers le centre. Il participe à la défense ou à l’attaque au milieu. D’autres coups peuvent être jouables ; nous entraînons ici le développement.';
 if(p.principle==='center')return 'Ton pion prend de la place au milieu et ouvre un passage à un fou. La suite sera de sortir tes pièces et de prévoir un abri pour ton roi.';
 if(/defen/.test(p.variantOf||p.id))return 'Ta pièce coupe la ligne d’attaque vers le pion proche de ton roi. La menace de mat montrée est neutralisée, et tu fais participer une pièce. Il faudra observer le prochain coup adverse.';
 const topic=practiceTopic(p).id;
 if(topic==='forks')return 'Une seule pièce a créé deux menaces. L’adversaire a dû répondre à l’échec ; tu as ensuite pu prendre l’autre cible dans la suite montrée. Vérifie toujours sa réponse réelle en partie.';
 if(topic==='pins')return 'Tu as profité du défenseur cloué au roi. Une reprise avec ce défenseur ouvrirait la ligne contre son roi, donc elle est interdite. La cible semblait protégée, mais cette protection ne fonctionnait pas.';
 if(last?.captured)return `${article(last.piece).replace(/^./,c=>c.toUpperCase())}${names[last.piece]} a pris ${article(last.captured)}${names[last.captured]} adverse. Dans cette position, la capture réalise le gain travaillé. Le bon réflexe est de comparer la prise et les reprises, pas seulement la valeur de la cible.`;
 if(topic==='italian')return 'Ton petit pion soutient la future poussée centrale. Il pourra reprendre en diagonale dans l’exemple étudié. Vérifie les menaces adverses avant de pousser : le plan doit s’adapter.';
 return 'Tu as donné une meilleure activité à ta pièce sur une case sûre. Le coup prépare des possibilités sans prétendre gagner la partie immédiatement.';
}
export function naturalReview(p,after,m){
 const base={fen:after.fen(),title:'Regarde ton coup',text:`Tu viens de déplacer ${article(m.piece)}${names[m.piece]} vers la case entourée. ${m.captured?'Tu as pris '+article(m.captured)+names[m.captured]+'. ':''}Regardons maintenant une réponse adverse.`,arrows:[[m.from,m.to]],marks:[m.to]};
 const replies=after.moves({verbose:true});let type='mate';let reply=replies.find(x=>{const g=new Chess(after.fen());g.move(x);return g.isCheckmate();});
 if(!reply){type='capture';reply=replies.find(x=>x.captured&&x.to===m.to);}
 if(!reply&&(p.mate||p.mateEnd)){type='escape';reply=replies[0];}
 const frames=[base];if(after.isStalemate()){base.text='Le roi adverse n’est pas attaqué, mais son camp ne peut plus jouer aucun coup légal. C’est un pat : la partie serait nulle. Il faut conserver une case de fuite ou donner un véritable mat.';}
 else if(reply){const g=new Chess(after.fen());g.move(reply);frames.push({fen:g.fen(),title:type==='mate'?'La menace était plus urgente':type==='capture'?'Voici la reprise que tu as oubliée':'Une défense reste possible',text:type==='mate'?'Cette réponse fait échec et mat. Le roi est attaqué et aucune défense ne le sauve. Il fallait traiter cette menace avant de poursuivre ton idée.':type==='capture'?`Regarde la flèche : ${article(reply.piece)}${names[reply.piece]} adverse reprend ta pièce. Tu donnes environ ${points[m.piece]} points ${m.captured?'pour en prendre '+points[m.captured]:'sans capture en échange'} sur ces deux coups. Ce bilan ne tient pas encore compte d’éventuelles reprises suivantes.`:'Cette réponse est légale et le roi n’est plus en échec. Ton coup ne faisait donc pas mat. Regarde la fuite, la capture ou le blocage montré, puis cherche une attaque qui ferme cette défense.',arrows:[[reply.from,reply.to]],marks:[reply.to]});}
 else{base.text='Ce coup est légal, mais il ne réalise pas l’objectif de cet exercice. Cela ne veut pas dire qu’il perd forcément la partie. '+practiceGoal(p);}
 return {frames,index:0};
}
