/**
 * Web Audio API synthesizer for scan & check-in sounds
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Melodious joyful chime for On-Time Check-In
  public playOnTimeChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const duration = 0.12;

      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * duration);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + i * duration);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + i * duration + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (i + 1) * duration + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * duration);
        osc.stop(this.ctx.currentTime + (i + 1) * duration + 0.15);
      });
    } catch {
      // Audio playback fails gracefully if user hasn't interacted
    }
  }

  // Warning chime for Late or Outside Radius
  public playWarningTone() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [440, 370]; // A4, F#4
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.18);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (i + 1) * 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.18);
        osc.stop(this.ctx.currentTime + (i + 1) * 0.18);
      });
    } catch {}
  }

  // Smooth double beep for Clock-Out
  public playClockOutTone() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [659.25, 523.25]; // E5 -> C5
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.15);

        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (i + 1) * 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.15);
        osc.stop(this.ctx.currentTime + (i + 1) * 0.15);
      });
    } catch {}
  }

  // Crisp single beep for QR Kiosk Refresh or camera detection
  public playBeep() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }
}

export const soundFx = new SoundSynthesizer();
