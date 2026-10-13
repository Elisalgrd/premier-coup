import { esc, $, glossaryContext } from "./helpers.js";
let words = [],
  pattern,
  observer,
  queued = false,
  mini,
  opened = 0;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export async function startGlossary() {
  const r = await fetch("./curriculum/glossary.json");
  if (!r.ok) throw Error("Les définitions ne sont pas disponibles.");
  words = await r.json();
  const aliases = words
    .filter((w) => w.autoLink !== false)
    .flatMap((w) => w.aliases)
    .sort((a, b) => b.length - a.length);
  pattern = new RegExp(
    "(?<![\\p{L}])(" + aliases.map(escapeRe).join("|") + ")(s?)(?![\\p{L}])",
    "giu",
  );
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      decorate(document.querySelector("#app"));
    });
  };
  observer = new MutationObserver(schedule);
  observer.observe(document.querySelector("#app"), {
    childList: true,
    subtree: true,
    characterData: true,
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-glossary]");
    if (b) openGlossary(b.dataset.glossary);
  });
  schedule();
}
function decorate(root) {
  if (!root || !pattern) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        return n.textContent.trim() &&
          !n.parentElement.closest(
            "a,button,summary,h1,h2,h3,input,textarea,select,svg,video,script,style,.board-shell,[data-no-glossary]",
          )
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    }),
    nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  observer.disconnect();
  for (const node of nodes) {
    const text = node.textContent,
      matches = [...text.matchAll(pattern)].filter(m=>glossaryContext(m[0],text,m.index));
    if (!matches.length) continue;
    let at = 0;
    const f = document.createDocumentFragment();
    for (const m of matches) {
      const word = words.find((w) =>
        w.aliases.some((a) => a.toLowerCase() === m[1].toLowerCase()),
      );
      if (!word) continue;
      f.append(text.slice(at, m.index));
      const b = document.createElement("button");
      b.type = "button";
      b.className = "glossary-term";
      b.dataset.glossary = word.id;
      b.textContent = m[0];
      b.setAttribute("aria-label", m[0] + " : afficher la définition");
      b.setAttribute("aria-haspopup", "dialog");
      f.append(b);
      at = m.index + m[0].length;
    }
    f.append(text.slice(at));
    node.replaceWith(f);
  }
  observer.observe(document.querySelector("#app"), {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
export async function openGlossary(id = null) {
  const ticket = ++opened;
  let d = $("#glossary");
  if (!d) {
    d = document.createElement("dialog");
    d.id = "glossary";
    d.className = "glossary-dialog";
    document.body.append(d);
    d.addEventListener("close", () => {
      mini?.destroy();
      mini = null;
    });
  }
  const word = words.find((w) => w.id === id);
  mini?.destroy();
  mini = null;
  d.innerHTML = `<form method="dialog"><header><h2>${esc(word?.term || "Les mots des échecs")}</h2><button aria-label="Fermer la définition">✕</button></header></form>${word ? `<p>${esc(word.definition)}</p>${word.example?.fen ? '<div id="glossary-board" aria-label="Un exemple de position"></div>' : ""}<a class="text-link" id="glossary-course" href="#lesson/${word.firstIn}">Voir la fiche qui l’explique →</a>` : `<label>Chercher un mot<input id="glossary-search" type="search" placeholder="Roque, fourchette…"></label><div id="glossary-list"></div>`}`;
  if (!d.open) d.showModal();
  if (word) {
    $("#glossary-course").onclick = () => d.close();
    if (word.example?.fen) {
      const { Board } = await import("../chess/board.js");
      if (ticket === opened && d.open && $("#glossary-board"))
        mini = new Board($("#glossary-board"), {
          ...word.example,
          interactive: false,
        });
    }
  } else {
    const show = () => {
      const q = $("#glossary-search").value.toLocaleLowerCase("fr");
      $("#glossary-list").innerHTML = words
        .filter((w) => (w.term + " " + w.definition).toLowerCase().includes(q))
        .map(
          (w) =>
            `<button class="glossary-row" data-glossary="${esc(w.id)}"><strong>${esc(w.term)}</strong><span>${esc(w.definition)}</span></button>`,
        )
        .join("");
    };
    $("#glossary-search").oninput = show;
    show();
  }
}
