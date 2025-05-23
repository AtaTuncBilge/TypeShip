class AudioManager {
  constructor() {
    this.soundEnabled = true;
    this.volume = 0.7; // Default volume
    this.soundMap = {
      hit: new Audio('/sounds/hit.mp3'),
      type: new Audio('/sounds/type.mp3'),
      ambient: new Audio('/sounds/ambient.mp3'),
    };

    // Set initial volume for all sounds
    Object.values(this.soundMap).forEach(audio => {
      audio.volume = this.volume;
    });
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
    Object.values(this.soundMap).forEach(audio => {
      audio.volume = this.volume;
    });
  }

  playSound(name) {
    if (!this.soundEnabled || !this.soundMap[name]) return;
    const track = this.soundMap[name];
    track.currentTime = 0;
    track.volume = this.volume;
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
