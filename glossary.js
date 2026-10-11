const definitions={
 fourchette:{title:'Fourchette',text:'Une seule pièce attaque deux cibles à la fois. Par exemple, un cavalier menace le roi et la dame : le roi doit être sauvé, puis le cavalier peut prendre la dame.',course:'forks'},
 clouage:{title:'Clouage',text:'Une pièce bloque une attaque contre une pièce située derrière elle. Si c’est son roi, elle n’a pas le droit de bouger en laissant ce roi attaqué.',course:'pins'},
 enfilade:{title:'Enfilade',text:'Deux pièces adverses sont sur la même ligne. Tu attaques celle de devant ; quand elle s’écarte, tu peux prendre celle de derrière. Exemple : une tour donne échec au roi, qui découvre sa dame en bougeant.'},
 couloir:{title:'Mat du couloir',text:'Le roi est bloqué par ses propres pièces, souvent ses pions. Une tour ou une dame l’attaque sur sa dernière rangée, sans défense possible.',course:'mates'},
 mat:{title:'Échec et mat',text:'Le roi est attaqué et aucun coup légal ne le sauve. Vérifie les trois défenses : fuir avec le roi, prendre la pièce qui attaque, ou placer une pièce entre les deux.'},
 reprise:{title:'Reprise',text:'Après une capture, l’autre camp capture à son tour la pièce qui vient de prendre. Avant de prendre, vérifie qui peut reprendre ta pièce et compare ce que tu gagnes et perds.',course:'captures'},
 echec:{title:'Échec',text:'Ton roi est attaqué : tu dois le sauver immédiatement. Tu peux déplacer le roi, prendre la pièce qui attaque ou bloquer son attaque si c’est possible.',course:'defense'},
 menace:{title:'Menace',text:'C’est ce que l’adversaire pourrait faire à son prochain coup : prendre une pièce ou faire mat, par exemple. Imagine ce coup avant de choisir le tien.',course:'defense'},
 pat:{title:'Pat',text:'Le camp qui doit jouer n’a aucun coup légal, mais son roi n’est pas en échec. La partie est nulle, même si l’autre camp a beaucoup plus de pièces.',course:'endings'},
 promotion:{title:'Promotion',text:'Quand ton pion atteint la dernière rangée, tu le remplaces par une dame, une tour, un fou ou un cavalier. Le choix de la dame n’est pas obligatoire.'},
 roque:{title:'Petit roque',text:'Le roi avance de deux cases vers la tour la plus proche ; la tour passe juste de l’autre côté du roi. Ils ne doivent pas avoir bougé, les cases entre eux doivent être libres, et le roi ne peut être en échec, traverser une case attaquée ou y arriver.'},
 passant:{title:'En passant',text:'Juste après qu’un pion adverse avance de deux cases et arrive à côté du tien, tu peux le capturer comme s’il n’avait avancé que d’une case. Cette capture n’est possible qu’immédiatement après son avance.'},
 developpement:{title:'Développer ses pièces',text:'Sortir surtout ses cavaliers et ses fous de leur case de départ pour les rendre utiles. Cherche des cases qui contrôlent le centre, les quatre cases au milieu de l’échiquier.',course:'italian'},
 colonne:{title:'Colonne ouverte',text:'Une ligne verticale de huit cases sans aucun pion des deux camps. Une tour peut s’y activer et viser le camp adverse.'}
};
export function termsForPuzzle(p){
 const text=[p.id,p.theme,p.title,p.objective].join(' ').toLowerCase();let ids=[];
 if(/fourchette|fork/.test(text))ids.push('fourchette');
 if(/clouage|cloué|pinned|pin-new/.test(text))ids.push('clouage');
 if(/enfilade|skewer/.test(text))ids.push('enfilade');
 if(/backrank|couloir/.test(text))ids.push('couloir');
 if(/pat|stalemate|promotion-new/.test(text))ids.push('pat');
 if(/promotion|stalemate/.test(text))ids.push('promotion');
 if(/reprise|safe-capture|capture-new|exchange-chain/.test(text))ids.push('reprise');
 if(p.id==='castle')ids.push('roque');
 if(p.id==='ep')ids.push('passant');
 if(/italian|développe/.test(text))ids.push('developpement');
 if(p.id==='open-file')ids.push('colonne');
 if(['escape','remove'].includes(p.id))ids.push('echec');
 else if(p.theme==='Défense')ids.push('menace');
 if((p.mate||/mat en/.test(text))&&!ids.includes('pat'))ids.push('mat');
 if(!ids.length)ids.push('reprise');
 return [...new Set(ids)].slice(0,2).map(id=>({id,...definitions[id]}));
}
export function renderVocabulary(p,{demoLink=true}={}){const terms=termsForPuzzle(p),course=terms.find(t=>t.course)?.course;return '<aside class="vocabulary" aria-label="Les mots pour comprendre"><div class="eyebrow">LE MOT AVANT LE COUP</div>'+terms.map(t=>'<p><strong>'+t.title+' : </strong>'+t.text+'</p>').join('')+(demoLink&&course?'<button class="vocabulary-link" data-action="word-demo" data-value="'+course+'">Voir la démonstration →</button>':'')+'<small>Comprendre le vocabulaire ne compte pas comme un indice.</small></aside>';}
