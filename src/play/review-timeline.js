import { speakReview, waitReview } from "./review-speech.js";
export class ReviewTimeline {
  constructor(scenes, { show, onChange = () => {}, onDone = () => {}, preferences = {}, speak = speakReview, wait = waitReview }) {
    Object.assign(this, { scenes, show, onChange, onDone, preferences, speak, wait });
    this.index = 0; this.speed = 1; this.running = false; this.generation = 0;
  }
  pause() { this.running = false; this.generation++; this.controller?.abort(); this.onChange(this); }
  async play() {
    if (this.running) return;
    this.running = true; const generation = ++this.generation; this.onChange(this);
    while (this.running && generation === this.generation && this.index < this.scenes.length) {
      const scene = this.scenes[this.index]; this.controller = new AbortController();
      const signal = this.controller.signal;
      this.show(scene, this.speed); this.onChange(this);
      await Promise.all([this.wait(scene.minMs / this.speed, signal), this.speak(scene.text, { preferences: this.preferences, speed: this.speed, signal })]);
      if (signal.aborted || generation !== this.generation) return;
      this.index++;
    }
    if (generation === this.generation) { this.running = false; this.onDone(); }
  }
  seek(index, play = true) {
    this.pause(); this.index = Math.max(0, Math.min(this.scenes.length - 1, index));
    this.show(this.scenes[this.index], this.speed); this.onChange(this); if (play) this.play();
  }
  changeSpeed(speed) { const playing = this.running; this.pause(); this.speed = speed; if (playing) this.play(); }
  destroy() { this.pause(); }
}
