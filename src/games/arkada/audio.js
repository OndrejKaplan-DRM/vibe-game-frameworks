// Zvuk arkády v M1: jen sběr předmětu. Sběrnice a nastavení hlasitosti přijdou se Shellem S2.
// AudioContext vzniká až prvním gestem uživatele.

export function createAudio() {
  let ctx = null;
  let master = null;

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
      master.gain.value = 0.25;
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

    get ready() {
      return !!ctx;
    },
  };
}
