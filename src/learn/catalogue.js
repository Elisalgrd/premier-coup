const cache=new Map();
export async function loadIndex(){const r=await fetch('./curriculum/index.json');if(!r.ok)throw Error('Catalogue indisponible.');return r.json();}
export async function loadEntry(id){if(!/^[a-z]+-[a-z0-9-]+$/.test(id))throw Error('Fiche inconnue.');if(!cache.has(id)){const r=await fetch(`./curriculum/entries/${id}.json`);if(!r.ok)throw Error('Fiche indisponible.');cache.set(id,await r.json());}return cache.get(id);}
