let context;
export function prepareSound() {
  try {
    context ??= new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === "suspended") context.resume();
  } catch {}
}
export function moveSound() {
  if (
    !document.documentElement.dataset.sound ||
    document.documentElement.dataset.sound !== "true"
  )
    return;
  try {
    prepareSound();
    const o = context.createOscillator(),
      g = context.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(520, context.currentTime);
    g.gain.setValueAtTime(0.035, context.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09);
    o.connect(g);
    g.connect(context.destination);
    o.start();
    o.stop(context.currentTime + 0.1);
  } catch {}
}
