import { emptyState, validateState } from "./schema.js";
import { migrateLegacy } from "./migrate.js";
const FALLBACK = "premier-coup-v2",
  PREFS = "premier-coup-preferences";
function db() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("premier-coup", 2);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("state"))
        req.result.createObjectStore("state");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function database(mode, work) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction("state", mode),
      req = work(tx.objectStore("state"));
    tx.oncomplete = () => {
      d.close();
      resolve(req.result);
    };
    tx.onerror = () => {
      d.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      d.close();
      reject(tx.error);
    };
  });
}
export class Store {
  constructor() {
    this.state = emptyState();
    this.queue = Promise.resolve();
    this.storage = "IndexedDB";
    this.error = null;
  }
  async load(mapping) {
    let raw;
    try {
      raw = await database("readonly", (s) => s.get("current"));
    } catch {
      this.storage = "localStorage";
    }
    try {
      const fallback = JSON.parse(localStorage.getItem(FALLBACK) || "null");
      if (fallback && (!raw || (fallback.savedAt || 0) > (raw.savedAt || 0)))
        raw = fallback;
    } catch {}
    if (raw) this.state = validateState(raw);
    else {
      let legacy;
      try {
        legacy = JSON.parse(localStorage.getItem("premier-coup-v1") || "null");
      } catch {}
      this.state = migrateLegacy(legacy, mapping);
    }
    try {
      const prefs = JSON.parse(localStorage.getItem(PREFS) || "null");
      if (prefs)
        this.state.preferences = { ...this.state.preferences, ...prefs };
    } catch {}
    await this.save();
    return this.state;
  }
  save() {
    this.state.savedAt = Date.now();
    const snapshot = structuredClone(this.state);
    try {
      localStorage.setItem(PREFS, JSON.stringify(snapshot.preferences));
      localStorage.setItem(FALLBACK, JSON.stringify(snapshot));
    } catch (e) {
      this.error = e.message;
    }
    this.queue = this.queue
      .catch(() => {})
      .then(async () => {
        try {
          await database("readwrite", (s) => s.put(snapshot, "current"));
          this.storage = "IndexedDB";
          this.error = null;
        } catch (e) {
          this.storage = "localStorage";
          try {
            localStorage.setItem(FALLBACK, JSON.stringify(snapshot));
            this.error = null;
          } catch {
            this.error =
              "La progression ne peut pas être enregistrée. Exporte une sauvegarde.";
          }
        }
      });
    return this.queue;
  }
  async replace(raw) {
    const next = validateState(raw);
    this.state = next;
    await this.save();
    return this.state;
  }
}
