import { coachAudio } from "./coach-audio.js";

// Reuse one media element between steps for Safari's media permission.
export class RecordedCoach {
  constructor({ AudioClass = globalThis.Audio, onStatus = () => {} } = {}) {
    this.audio = AudioClass ? new AudioClass() : null;
    this.onStatus = onStatus;
    this.audio?.setAttribute?.("playsinline", "");
  }
  stop() { this.cancel?.(); this.cancel = null; this.audio?.pause(); }
  play(id, { signal, onStart = () => {} } = {}) {
    this.stop();
    const clip = coachAudio[id], audio = this.audio;
    if (signal?.aborted || !clip || !audio) return Promise.resolve(false);
    return new Promise(resolve => {
      let settled = false, started = false;
      const finish = ok => {
        if (settled) return; settled = true;
        clearTimeout(timer); signal?.removeEventListener("abort", cancel);
        audio.onended = audio.onerror = audio.onplaying = null;
        audio.pause(); this.cancel = null;
        this.onStatus(ok ? "done" : signal?.aborted ? "stopped" : "unavailable");
        resolve(ok);
      };
      const cancel = () => finish(false);
      this.cancel = cancel;
      signal?.addEventListener("abort", cancel, { once: true });
      const timer = setTimeout(() => finish(false), (clip.duration + 15) * 1000);
      audio.onplaying = () => { if (!started) { started = true; this.onStatus("playing"); onStart(); } };
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      audio.src = new URL("../../" + clip.file, import.meta.url).href;
      audio.playbackRate = 1;
      this.onStatus("loading");
      try { Promise.resolve(audio.play()).catch(() => finish(false)); } catch { finish(false); }
    });
  }
  destroy() { this.stop(); if (this.audio) { this.audio.removeAttribute?.("src"); this.audio.load?.(); } }
}
