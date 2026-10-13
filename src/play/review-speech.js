export function frenchVoices(synth = globalThis.speechSynthesis) {
  return (synth?.getVoices?.() || []).filter(v => /^fr(?:-|_)/i.test(v.lang) && v.localService !== false);
}
export function reviewVoice(preferences, synth = globalThis.speechSynthesis) {
  const voices = frenchVoices(synth);
  return voices.find(v => v.voiceURI === preferences.reviewVoice) || [...voices].sort((a, b) => {
    const score = v => (/premium|enhanced/i.test(v.name) ? 10 : 0) + (/thomas|daniel|nicolas|henri|paul/i.test(v.name) ? 3 : 0) + (/fr-FR/i.test(v.lang) ? 1 : 0);
    return score(b) - score(a);
  })[0];
}
export const reviewMuted = p => p.voice === "silent" || p.reviewVoice === "silent";
export function primeReviewSpeech(preferences) {
  if (reviewMuted(preferences) || !globalThis.speechSynthesis || !globalThis.SpeechSynthesisUtterance) return;
  const voice = reviewVoice(preferences);
  // Only on-device voices: no game text is sent to a speech service.
  if (!voice) return;
  try {
    const u = new SpeechSynthesisUtterance("Regardons ta partie."); u.lang = "fr-FR"; u.voice = voice;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch {}
}
export function waitReview(ms, signal) {
  return new Promise(resolve => {
    if (signal?.aborted) return resolve();
    const done = () => { clearTimeout(timer); signal?.removeEventListener("abort", done); resolve(); };
    const timer = setTimeout(done, ms); signal?.addEventListener("abort", done, { once: true });
  });
}
export async function speakReview(text, { preferences = {}, speed = 1, signal, synth = globalThis.speechSynthesis, Utterance = globalThis.SpeechSynthesisUtterance, wait = waitReview } = {}) {
  if (!text || signal?.aborted) return;
  const fallbackMs = Math.max(1500, text.length / 15 * 1000) / speed;
  const voice = reviewVoice(preferences, synth);
  if (reviewMuted(preferences) || !synth || !Utterance || !voice) return wait(fallbackMs, signal);
  await new Promise(resolve => {
    let timer, fallback;
    const done = () => { clearTimeout(timer); signal?.removeEventListener("abort", cancel); resolve(); };
    const cancel = () => { synth.cancel(); done(); };
    const failed = () => { if (!fallback) { fallback = true; clearTimeout(timer); wait(fallbackMs, signal).then(done); } };
    const u = new Utterance(text); u.lang = "fr-FR"; u.rate = speed; u.voice = voice;
    u.onend = done; u.onerror = failed;
    signal?.addEventListener("abort", cancel, { once: true });
    // Some iOS voices neither start nor raise an error. Subtitles still progress.
    timer = setTimeout(done, fallbackMs + 4000);
    try { synth.cancel(); synth.speak(u); } catch { failed(); }
  });
}
