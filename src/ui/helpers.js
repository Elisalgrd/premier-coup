export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const $ = (s, root = document) => root.querySelector(s);
export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function addDays(key, n) {
  const d = new Date(key + "T12:00:00");
  d.setDate(d.getDate() + n);
  return dateKey(d);
}
export const duration = (n) =>
  Math.floor(n / 60) + ":" + String(Math.floor(n % 60)).padStart(2, "0");
export function notice(text) {
  const el = document.querySelector("#notice");
  if (el) {
    el.textContent = text;
    clearTimeout(notice.timer);
    notice.timer = setTimeout(() => (el.textContent = ""), 6000);
  }
}
export const icon = (name) =>
  ({ today: "◉", catalogue: "▤", train: "◇", progress: "↗", settings: "⚙" })[
    name
  ] || "◆";

export const friendlyMistake = (label) =>
  ({
    "Mat raté": "Tu pouvais gagner en attaquant le roi",
    "Mat du couloir": "Ton roi reste coincé derrière ses pions",
    "Pièce laissée en prise":
      "L’adversaire peut prendre une pièce gratuitement",
    "Fourchette subie": "Une pièce adverse attaque deux de tes pièces",
    "Clouage subi": "Bouger une pièce expose ton roi",
    "Capture gratuite ratée": "Tu pouvais prendre une pièce sans rien perdre",
    "Menace adverse ignorée": "Un danger adverse reste sans réponse",
  })[label] || label;

export function glossaryContext(term, text, index) {
  const word = term.toLocaleLowerCase('fr');
  if (word === 'nulle' && /^nulle part\b/iu.test(text.slice(index))) return false;
  if (word === 'échecs' && /(?:d[’']|aux\s+|des\s+)$/iu.test(text.slice(0, index))) return false;
  return true;
}
