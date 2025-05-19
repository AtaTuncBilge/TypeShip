class AudioManager {
  constructor() {
    this.soundEnabled = true;
    this.soundMap = {
      hit: new Audio('/sounds/hit.mp3'),
      type: new Audio('/sounds/type.mp3'),
      ambient: new Audio('/sounds/ambient.mp3'),
    };
  }

  playSound(name) {
    if (!this.soundEnabled || !this.soundMap[name]) return;
    const track = this.soundMap[name];
    track.currentTime = 0;
    track.play().catch(console.error);
  }

  pauseSound(name) {
    const track = this.soundMap[name];
    if (track) {
      track.pause();
      track.currentTime = 0;
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }
}

export { AudioManager };
