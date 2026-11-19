// Zvuk arkády: sběr předmětu a hlavní hlasitost. Sběrnice (hudba, efekty…) přijdou se Shellem S2.
// AudioContext vzniká až prvním gestem uživatele; hlasitost se pamatuje i předtím.

const MASTER_MAX = 0.5; // zesílení při hlasitosti 100 %

export function createAudio() {
  let ctx = null;
  let master = null;
  let volume = 0.6; // 0–1

  return {
    unlock() {
      if (ctx) {
        if (ctx.state === 'suspended') ctx.resume();
        return;
      }
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume * MASTER_MAX;
      master.connect(ctx.destination);
    },

    /** Krátké cinknutí; výška stoupá se sérií sběrů (case 40, A9). */
    pickup(streak = 1) {
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const base = 660 * Math.pow(2, Math.min(streak - 1, 12) / 12);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.exponentialRampToValueAtTime(base * 1.5, t + 0.08);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(1, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + 0.2);
    },

    setVolume(v) {
      volume = Math.min(1, Math.max(0, v));
      if (master) master.gain.value = volume * MASTER_MAX;
    },
    /** Hlasitost, jakou zvukový graf skutečně má (před odemčením ta, která se použije). */
    getVolume() {
      return master ? master.gain.value / MASTER_MAX : volume;
    },

    get ready() {
      return !!ctx;
    },
  };
}
