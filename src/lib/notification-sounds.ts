/**
 * Notification Sound Generator
 * 
 * Generates notification sounds programmatically using Web Audio API
 * This eliminates the need for audio files and provides consistent sounds
 * across all browsers and environments.
 */

export class NotificationSoundGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('⚠️ Web Audio API not available:', error);
    }
  }

  /**
   * Play a gentle bell notification sound
   */
  async playGentleBell(volume: number = 0.7): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Resume audio context if suspended (Chrome autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Bell-like sound using multiple frequency components
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.8);

      // Gentle envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.2);

      // Low-pass filter for warmth
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);

      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 1.2);
    } catch (error) {
      console.warn('⚠️ Could not play gentle bell:', error);
    }
  }

  /**
   * Play a digital chime notification sound
   */
  async playDigitalChime(volume: number = 0.7): Promise<void> {
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create two oscillators for harmony
      const osc1 = this.audioContext.createOscillator();
      const osc2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Digital chime frequencies (perfect fifth)
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(783.99, this.audioContext.currentTime); // G5

      // Quick envelope for digital feel
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.4, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.6);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      osc1.start(this.audioContext.currentTime);
      osc2.start(this.audioContext.currentTime);
      osc1.stop(this.audioContext.currentTime + 0.6);
      osc2.stop(this.audioContext.currentTime + 0.6);
    } catch (error) {
      console.warn('⚠️ Could not play digital chime:', error);
    }
  }

  /**
   * Play a soft ping notification sound
   */
  async playSoftPing(volume: number = 0.7): Promise<void> {
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Soft ping with gentle frequency sweep
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);

      // Very gentle envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.2, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);

      // Soft filter
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(3000, this.audioContext.currentTime);
      filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);

      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.4);
    } catch (error) {
      console.warn('⚠️ Could not play soft ping:', error);
    }
  }

  /**
   * Play notification sound by type
   */
  async playSound(soundType: string, volume: number = 0.7): Promise<void> {
    switch (soundType) {
      case 'gentle-bell':
        await this.playGentleBell(volume);
        break;
      case 'digital-chime':
        await this.playDigitalChime(volume);
        break;
      case 'soft-ping':
        await this.playSoftPing(volume);
        break;
      default:
        console.warn(`⚠️ Unknown sound type: ${soundType}`);
    }
  }

  /**
   * Test if audio is working
   */
  async testAudio(): Promise<boolean> {
    try {
      if (!this.audioContext) {
        await this.initializeAudioContext();
      }
      
      if (!this.audioContext) return false;

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      return this.audioContext.state === 'running';
    } catch (error) {
      console.warn('⚠️ Audio test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const soundGenerator = new NotificationSoundGenerator();