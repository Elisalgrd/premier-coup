// Original vector pieces. Explicit fills avoid font/emoji-dependent colors on phones.
const shapes={
 p:'<circle cx="24" cy="11" r="6"/><path d="M20 17h8c-1 8 1 12 6 17H14c5-5 7-9 6-17Z"/><path d="M14 34h20l3 7H11Z"/>',
 r:'<path d="M12 5h6v6h4V5h4v6h4V5h6v13l-5 4 2 12H15l2-12-5-4Z"/><path d="M13 34h22l2 7H11Z"/><path d="M17 18h14M17 23h14" fill="none"/>',
 b:'<circle cx="24" cy="5" r="2.5"/><path d="M24 8c-4 4-10 8-10 14 0 5 4 7 10 7s10-2 10-7c0-6-6-10-10-14Z"/><path d="m25 12-6 9" fill="none"/><path d="m19 28-3 7h16l-3-7M13 35h22l3 6H10Z"/>',
 n:'<path d="m19 8 2-5 7 6c9 2 12 11 10 25H17c1-6 5-9 9-13l-10 3-6-4 6-10Z"/><path d="m28 14-4 8M17 14l-3 5" fill="none"/><circle cx="22" cy="12.5" r="1.3" stroke="none" class="piece-eye"/><path d="M14 34h23l2 7H11Z"/>',
 q:'<path d="m10 12 8 9 6-12 6 12 8-9-6 20H16Z"/><circle cx="9" cy="10" r="3"/><circle cx="24" cy="7" r="3"/><circle cx="39" cy="10" r="3"/><path d="M16 29h16l2 6H14ZM13 35h22l3 6H10Z"/>',
 k:'<path d="M22 3h4v5h5v4h-5v5h-4v-5h-5V8h5Z"/><path d="M24 20c-8-10-18-3-13 6l5 8h16l5-8c5-9-5-16-13-6Z"/><path d="M24 20v13" fill="none"/><path d="M16 32h16l3 4H13ZM13 36h22l3 5H10Z"/>'
};
export function pieceHtml(piece){
 if(!piece||!Object.hasOwn(shapes,piece.type)||!['w','b'].includes(piece.color))return '';
 const white=piece.color==='w',fill=white?'#fffaf0':'#24352c',stroke=white?'#24352c':'#e9eddd';
 return `<span class="piece ${white?'white':'black'}" data-piece="${piece.color}${piece.type}" aria-hidden="true"><svg class="piece-drawing" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><g fill="${fill}" stroke="${stroke}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${shapes[piece.type].replace('class="piece-eye"',`fill="${stroke}"`)}</g></svg></span>`;
}
