import { AudioManagerProps } from '../types';

export class AudioManager {
  private sounds: Map<string, HTMLAudioElement>;
  private settings: { soundEnabled: boolean; volume: number; };

  constructor(settings?: Partial<typeof AudioManager.prototype.settings>) {
    this.sounds = new Map();
    this.settings = {
      soundEnabled: true,
      volume: 0.7,
      ...settings
    };
  }

  public init(): void {
    // Load all sound effects
    this.loadSound('keypress1', '/sounds/keypress1.mp3');
    this.loadSound('buttonpress', '/sounds/buttonpress.mp3');
    this.loadSound('correct', '/sounds/correct.mp3');
    this.loadSound('ambient', '/sounds/spaceship-ambient-27988.mp3');
  }

  private loadSound(name: string, path: string): void {
    try {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = this.settings.volume;
      if (name === 'keypress1') {
        audio.volume = this.settings.volume * 0.3; // Lower volume for typing
      }
      this.sounds.set(name, audio);
    } catch (error) {
      console.error(`Failed to load sound: ${path}`, error);
    }
  }

  public playSound(name: string): void {
    if (!this.settings.soundEnabled) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.settings.volume;
      clone.play().catch(err => console.warn('Error playing sound:', err));
    }
  }

  // Convenience methods
  public playKeypress(): void {
    this.playSound('keypress1');
  }

  public playButton(): void {
    this.playSound('buttonpress');
  }

  public playCorrect(): void {
    this.playSound('correct');
  }
}
