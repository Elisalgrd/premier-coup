import fs from 'node:fs';
import {Chess} from '../src/chess/chess.js';
import {moveUci} from '../src/chess/notation.js';
const path='curriculum/entries/',index=JSON.parse(fs.readFileSync('curriculum/index.json')),examples=JSON.parse(fs.readFileSync('curriculum/lichess-examples.json')),manifest=JSON.parse(fs.readFileSync('data/puzzles/manifest.json'));
const custom={
 'vis-rules':['4k3/8/8/8/8/8/8/4K2R w K - 0 1',['e1g1'],'Mets ton roi à l’abri en faisant le petit roque.'],
 'vis-notation':['4k3/8/8/8/8/8/8/4K3 w - - 0 1',['e5'],'Touche la case e5.','square'],
 'vis-values':['4k3/8/8/8/2q5/8/8/R3K3 w - - 0 1',['c4'],'Touche la pièce qui vaut neuf points.','square'],
 'mat-basic-queen':['7k/8/5KQ1/8/8/8/8/8 w - - 0 1',['g6g7'],'Fais mat en un coup.'],
 'mat-basic-rook':['7k/8/6K1/8/8/8/8/R7 w - - 0 1',['a1a8'],'Fais mat en un coup.'],
 'ouv-gambits':['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',['f2f4'],'Propose le gambit du roi : avance le pion f de deux cases.'],
 'str-worst-piece':['6k1/ppp2ppp/8/8/8/3P1N2/PPP2PPP/RNB1R1K1 w - - 0 1',['b1'],'Touche la pièce encore enfermée sur sa case de départ.','square'],
 'str-outposts':['6k1/pp3ppp/3p4/8/2P1P3/2N5/PP3PPP/6K1 w - - 0 1',['c3d5'],'Installe ton cavalier sur une case centrale soutenue par un pion.'],
 'str-good-bad-bishop':['6k1/8/3p4/2pPp3/2P1P3/8/8/2B3K1 w - - 0 1',['c1'],'Touche le fou limité par ses propres pions.','square'],
 'str-pawn-structure':['6k1/pp3ppp/8/8/3P4/8/PP3PPP/6K1 w - - 0 1',['d4'],'Touche le pion isolé, sans pion ami sur les colonnes voisines.','square'],
 'str-weak-squares':['6k1/pp3ppp/3p4/8/2P1P3/2N5/PP3PPP/6K1 w - - 0 1',['d5'],'Touche la case centrale qu’aucun pion noir ne pourra attaquer.','square'],
 'str-exchanges':['3r2k1/pp3ppp/8/8/8/8/PP3PPP/3RQ1K1 w - - 0 1',['d1d8'],'Tu as une dame de plus. Échange les tours.'],
 'str-initiative':['r1bq1rk1/ppp2ppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1',['d3d4'],'Ouvre le centre pour activer tes pièces développées.'],
 'str-bishop-pair-space':['r1bq1rk1/ppp2ppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1',['d3d4'],'Ouvre une diagonale en échangeant les pions centraux.'],
 'str-plan-making':['6k1/pp3ppp/3p4/8/2P1P3/2N5/PP3PPP/6K1 w - - 0 1',['c3d5'],'Ton plan : occuper l’avant-poste central. Joue le premier coup.']
};
for(const id of ['meta-play-slow','meta-time-management','meta-game-review','meta-woodpecker'])custom[id]=['4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1',['e4d6','e8d7','d6b5'],'Prends le temps de vérifier les échecs, captures et menaces.'];
for(const short of index){const e=JSON.parse(fs.readFileSync(path+short.id+'.json'));if(manifest.shards[e.id])e.lichessThemes=manifest.shards[e.id].tags;
 if(!e.entryChallenge&&custom[e.id]){const [fen,solution,prompt,mode='move']=custom[e.id];e.entryChallenge={fen,solution,prompt,mode,source:'Exemple pédagogique validé'};}
 if(!e.entryChallenge&&examples[e.id]?.length){let candidates=examples[e.id];if(e.id==='vis-check-escape')candidates=candidates.filter(x=>new Chess(x.solverFen).isCheck());if(['proc-hanging-pieces','proc-free-material','vis-attacked-squares'].includes(e.id))candidates=candidates.filter(x=>{const g=new Chess(x.solverFen);return !!moveUci(g,x.solution[0]).captured&&!g.isCheckmate();});let x=candidates[0];if(!x){const rows=JSON.parse(fs.readFileSync('data/puzzles/'+manifest.shards[e.id].file));for(const row of rows){const g=new Chess(row[1]),line=row[2].split(' ');moveUci(g,line.shift());const start=g.fen(),check=g.isCheck(),m=moveUci(g,line[0]);if(e.id==='vis-check-escape'?!check:!m.captured||g.isCheckmate())continue;x={solverFen:start,solution:line,source:'https://lichess.org/training/'+row[0]};break;}}if(x)e.entryChallenge={fen:x.solverFen,solution:x.solution,prompt:(x.solverFen.split(' ')[1]==='w'?'Trait aux blancs. ':'Trait aux noirs. ')+(e.id==='vis-check-escape'?'Sors de l’échec.':'Cherche la meilleure suite.'),source:x.source,mode:'move'};}
 if(e.entryChallenge){const c=e.entryChallenge,g=new Chess(c.fen);e.guided=c.mode==='square'?[]:c.solution.map(move=>{const fen=g.fen();moveUci(g,move);return {fen,move,text:'',arrows:[[move.slice(0,2),move.slice(2,4)]],marks:[]};});}
 fs.writeFileSync(path+e.id+'.json',JSON.stringify(e,null,2)+'\n');}
console.log('Défis enrichis :',index.filter(x=>JSON.parse(fs.readFileSync(path+x.id+'.json')).entryChallenge).length);
