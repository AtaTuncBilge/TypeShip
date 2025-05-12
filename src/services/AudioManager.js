class AudioManager {
  constructor() {
    this.sounds = {};
    this.musicEnabled = true;
    this.soundEnabled = true;
    this.volume = 0.7;
  }

  async init() {
    // Load game sounds
    await Promise.all([
      this.loadSound('keypress1', '/sounds/keypress1.mp3'),
      this.loadSound('laser', '/sounds/laser.mp3'),
      this.loadSound('explosion', '/sounds/explosion.mp3'),
      this.loadSound('powerup', '/sounds/powerup.mp3'),
      this.loadSound('gameover', '/sounds/gameover.mp3'),
      this.loadSound('levelup', '/sounds/levelup.mp3'),
      this.loadSound('background', '/sounds/background.mp3', true)
    ]);
  }

  loadSound(id, url, isMusic = false) {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      audio.addEventListener('canplaythrough', () => {
        this.sounds[id] = {
          element: audio,
          isMusic
        };
        resolve();
      });
    });
  }

  playSound(id) {
    if (!this.sounds[id]) return;
    
    const sound = this.sounds[id];
    if ((sound.isMusic && !this.musicEnabled) || (!sound.isMusic && !this.soundEnabled)) {
      return;
    }

    sound.element.volume = this.volume;
    sound.element.currentTime = 0;
    sound.element.play();
  }

  stopSound(id) {
    if (!this.sounds[id]) return;
    this.sounds[id].element.pause();
    this.sounds[id].element.currentTime = 0;
  }
}

export default AudioManager;
