export class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.musicEnabled = true;
    this.soundEnabled = true;
    this.volume = 0.7;
    this.initialized = false;
  }

  async initialize() {
    // Preload all sounds
    await this.preloadSounds();
    
    this.initialized = true;
    return true;
  }

  

  playSound(name) {
    if (!this.soundEnabled || !this.sounds[name]) return;
    
    // Create a clone to allow multiple simultaneous plays
    const sound = this.sounds[name].cloneNode();
    sound.volume = this.volume;
    sound.play().catch(e => console.error('Error playing sound:', e));
  }

  playRandomKeypress() {
    if (!this.soundEnabled) return;
    
    const keypressSounds = ['keypress1', 'keypress2', 'keypress3'];
    const randomSound = keypressSounds[Math.floor(Math.random() * keypressSounds.length)];
    this.playSound(randomSound);
  }

  playMusic() {
    if (!this.musicEnabled || !this.sounds.gameMusic) return;
    
    if (this.music) {
      this.music.pause();
    }
    
    this.music = this.sounds.gameMusic;
    this.music.loop = true;
    this.music.volume = this.volume * 0.5; // Music slightly quieter than SFX
    this.music.play().catch(e => console.error('Error playing music:', e));
  }

  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }

  setVolume(volume) {
    this.volume = volume;
    
    // Update all loaded sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = volume;
    });
    
    // Update music if playing
    if (this.music) {
      this.music.volume = volume * 0.5;
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    
    if (enabled && this.music) {
      this.music.play().catch(e => console.error('Error playing music:', e));
    } else if (!enabled && this.music) {
      this.music.pause();
    }
  }
  // Play sound for cheating detection question
  playCheatingQuestion() {
    if (!this.soundEnabled) return;
    this.playSound('modmenu');
  }
  // Play sound when user admits to cheating
  playYesCheating() {
    if (!this.soundEnabled) return;
    this.playSound('keypress3');
  }
  // Play sound when user denies cheating
  playNoCheating() {
    if (!this.soundEnabled) return;
    this.playSound('keypress2');
  }
}