// Jádro: registr systémů, sběrnice událostí, režimy a smyčka s pevným krokem.
// Nezná DOM ani renderer. Smyčku v prohlížeči pouští run(), testy volají tick() a sim().
// Viz frameworks/01_CORE_Zasady_postup_kontrakt.md, oddíl 4.

/** Povolené přechody režimů. Jediné místo, kde jsou zapsané. */
export const TRANSITIONS = {
  boot: ['menu'],
  menu: ['playing'],
  playing: ['paused', 'menu', 'over'],
  paused: ['playing', 'menu'],
  over: ['menu', 'playing'],
};

const EPS = 1e-9;

export function createEngine({ step = 1 / 60, maxFrame = 0.1, maxStepsBase = 8 } = {}) {
  const systems = [];
  const byName = new Map();
  const listeners = new Map();

  const E = {
    STEP: step,
    mode: 'boot',
    timeScale: 1,
    steps: 0,
    acc: 0,
    stats: { stepMs: 0, frameMs: 0, fps: 0, droppedSeconds: 0 },

    /** Pořadí registrace je pořadí kroků, snímků i resetů. */
    add(sys) {
      if (!sys || !sys.name) throw new Error('Systém musí mít jméno.');
      if (byName.has(sys.name)) throw new Error(`Systém „${sys.name}“ už je registrován.`);
      systems.push(sys);
      byName.set(sys.name, sys);
      return sys;
    },
    get(name) {
      const s = byName.get(name);
      if (!s) throw new Error(`Neznámý systém „${name}“.`);
      return s;
    },
    has(name) {
      return byName.has(name);
    },

    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(fn);
      return () => listeners.get(event).delete(fn);
    },
    emit(event, data) {
      const set = listeners.get(event);
      if (set) for (const fn of set) fn(data);
    },

    async init() {
      for (const s of systems) if (s.init) await s.init(E);
      for (const s of systems) if (s.build) s.build();
      E.setMode('menu');
    },

    /** Nová hra nebo příprava před nahráním: každý systém vrátí vše, co jeho step mění. */
    reset() {
      E.steps = 0;
      E.acc = 0;
      for (const s of systems) if (s.reset) s.reset();
      E.emit('reset');
    },

    setMode(next) {
      if (next === E.mode) return;
      const allowed = TRANSITIONS[E.mode] || [];
      if (!allowed.includes(next)) throw new Error(`Nepovolený přechod režimu ${E.mode} → ${next}.`);
      const prev = E.mode;
      E.mode = next;
      E.emit('mode', { mode: next, prev });
    },

    /** Jeden pevný krok simulace. */
    stepOnce() {
      const t0 = performance.now();
      for (const s of systems) if (s.step) s.step(step);
      E.steps++;
      E.stats.stepMs += (performance.now() - t0 - E.stats.stepMs) * 0.05;
    },

    /**
     * Jeden snímek: přísun skutečného času se škáluje (timeScale), krok zůstává pevný.
     * Vrací počet provedených kroků.
     */
    tick(realSeconds) {
      const real = Math.min(Math.max(realSeconds, 0), maxFrame);
      let n = 0;
      if (E.mode === 'playing') {
        E.acc += real * E.timeScale;
        const maxSteps = Math.ceil(maxStepsBase * Math.max(1, E.timeScale));
        while (E.acc + EPS >= step && n < maxSteps) {
          E.stepOnce();
          E.acc -= step;
          n++;
        }
        if (E.acc < 0) E.acc = 0;
        if (n === maxSteps && E.acc >= step) {
          E.stats.droppedSeconds += E.acc; // dluh zahodit, ne dohánět
          E.acc = 0;
        }
      }
      const alpha = Math.min(E.acc / step, 1);
      for (const s of systems) if (s.frame) s.frame(real, alpha);
      return n;
    },

    /** Testy a vývojářské nástroje: N kroků bez čekání na skutečný čas. */
    sim(seconds) {
      const n = Math.round(seconds / step);
      for (let i = 0; i < n; i++) E.stepOnce();
      return n;
    },

    snapshot() {
      const out = { steps: E.steps, systems: {} };
      for (const s of systems) if (s.snapshot) out.systems[s.name] = s.snapshot();
      return out;
    },
    restore(data) {
      E.steps = data.steps;
      E.acc = 0;
      for (const s of systems) if (s.restore && data.systems[s.name] !== undefined) s.restore(data.systems[s.name]);
    },

    /** Smyčka v prohlížeči. */
    run(raf = globalThis.requestAnimationFrame) {
      let last = performance.now();
      const loop = (now) => {
        const real = (now - last) / 1000;
        last = now;
        const t0 = performance.now();
        E.tick(real);
        E.stats.frameMs += (performance.now() - t0 - E.stats.frameMs) * 0.05;
        if (real > 0) E.stats.fps += (1 / real - E.stats.fps) * 0.05;
        raf(loop);
      };
      raf(loop);
    },
  };

  return E;
}
