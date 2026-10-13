import fs from "node:fs";
const overrides=JSON.parse(fs.readFileSync("curriculum/teaching-overrides.json","utf8"));
const search=JSON.parse(fs.readFileSync("curriculum/search.json","utf8"));
for(const [id,patch] of Object.entries(overrides)) {
 const file=`curriculum/entries/${id}.json`,e={...JSON.parse(fs.readFileSync(file,"utf8")),...patch};
 fs.writeFileSync(file,JSON.stringify(e,null,2)+"\n");
 search[id]=[e.title,e.principle,e.retenir,...e.screens.flatMap(s=>[s.title,s.text,...(s.line||[]).map(m=>m.text)]),...e.exercises.map(x=>x.prompt)].filter(Boolean).join(" ").toLowerCase();
}
fs.writeFileSync("curriculum/search.json",JSON.stringify(search,null,2)+"\n");
