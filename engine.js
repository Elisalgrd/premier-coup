import {Chess} from './chess.js';
const values={p:100,n:320,b:330,r:500,q:900,k:0};
export function evaluate(game){let score=0;for(const row of game.board())for(const p of row){if(!p)continue;const file=p.square.charCodeAt(0)-97,rank=Number(p.square[1])-1,advance=p.color==='w'?rank:7-rank,center=3.5-(Math.abs(3.5-file)+Math.abs(3.5-rank))/2;let bonus=p.type==='p'?advance*7+center*4:['n','b'].includes(p.type)?center*16:0;score+=(p.color==='w'?1:-1)*(values[p.type]+bonus);}return score*(game.turn()==='w'?1:-1);}
function ordered(game){return game.moves({verbose:true}).sort((a,b)=>(values[b.captured]||0)-(values[a.captured]||0)+(b.san.includes('#')?1e5:0)-(a.san.includes('#')?1e5:0));}
export function chooseMove(game,depth=2,budget=1200){const started=Date.now();let nodes=0,expired=false;
 function search(d,alpha,beta,ply){nodes++;if(game.isCheckmate())return -100000+ply;if(game.isDraw())return 0;if(d===0)return evaluate(game);if(nodes%64===0&&Date.now()-started>budget){expired=true;return evaluate(game);}let best=-Infinity;for(const m of ordered(game)){game.move(m);const v=-search(d-1,-beta,-alpha,ply+1);game.undo();best=Math.max(best,v);alpha=Math.max(alpha,v);if(alpha>=beta||expired)break;}return best;}
 const moves=ordered(game);if(!moves.length)return null;let chosen=moves[0],score=-Infinity;for(let d=1;d<=depth;d++){let next=null,top=-Infinity;for(const m of moves){game.move(m);const v=-search(d-1,-Infinity,Infinity,1);game.undo();if(v>top){top=v;next=m;}if(expired)break;}if(!expired){chosen=next;score=top;}else break;}
 return {from:chosen.from,to:chosen.to,promotion:chosen.promotion,san:chosen.san,score,nodes};
}
if(typeof self!=='undefined'&&typeof WorkerGlobalScope!=='undefined'&&self instanceof WorkerGlobalScope)self.onmessage=e=>{const {id,moves,depth}=e.data;try{const game=new Chess();for(const move of moves)game.move(move);self.postMessage({id,result:chooseMove(game,depth,1600)});}catch(err){self.postMessage({id,error:err.message});}};
