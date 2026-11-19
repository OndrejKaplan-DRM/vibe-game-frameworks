// Arkáda (case 40), milník M1: registrace systémů, adaptér pro Shell, testovací háček.

import { createEngine } from '../../core/engine.js';
import { mountShell } from '../../shell/shell.js';
import { CFG, VERSION } from './config.js';
import { createState, stepWorld, stateHash } from './world.js';
import { createPlayerController, createScriptController } from './input.js';
import { createRenderer } from './render.js';
import { createAudio } from './audio.js';

async function boot() {
  const canvas = document.getElementById('view');
  const params = new URLSearchParams(location.search);
  const dev = params.has('dev');

  const E = createEngine({ step: 1 / CFG.stepHz });
  const audio = createAudio();
  const renderer = createRenderer(canvas, { dev });
  const player = createPlayerController(canvas.parentElement, { isPlaying: () => E.mode === 'playing' });

  // --- systém: svět (logika je v čistém modulu world.js) ---
  const world = {
    name: 'world',
    seed: Number(params.get('seed')) || 1,
    state: null,
    controller: player,
    build() {
      this.state = createState(this.seed);
      renderer.remember(this.state);
    },
    reset() {
      this.state = createState(this.seed);
      renderer.remember(this.state);
    },
    step(dt) {
      renderer.remember(this.state);
      stepWorld(this.state, this.controller.think(), dt);
      for (const ev of this.state.events) E.emit(ev, this.state);
    },
    snapshot() {
      return structuredClone(this.state);
    },
    restore(s) {
      this.state = structuredClone(s);
      renderer.remember(this.state);
    },
  };

  // --- systém: pohled (mimo hru kreslí jen při změně) ---
  const view = {
    name: 'view',
    dirty: true,
    init() {
      const onResize = () => {
        renderer.resize();
        this.dirty = true;
      };
      window.addEventListener('resize', onResize);
      const watchDpr = () => {
        // okno přetažené na jiný monitor mění devicePixelRatio bez události resize
        matchMedia(`(resolution: ${globalThis.devicePixelRatio || 1}dppx)`).addEventListener(
          'change',
          () => {
            onResize();
            watchDpr();
          },
          { once: true },
        );
      };
      watchDpr();
      renderer.resize();
    },
    frame(_dt, alpha) {
      if (E.mode !== 'playing' && !this.dirty) return;
      renderer.draw(world.state, alpha, { mode: E.mode, steps: E.steps, ...E.stats });
      this.dirty = false;
    },
  };

  E.add(world);
  E.add(view);

  E.on('pickup', (s) => audio.pickup(s.streak));
  E.on('mode', () => (view.dirty = true));
  E.on('reset', () => (view.dirty = true));

  // zvuk se smí spustit až po prvním gestu
  const unlock = () => audio.unlock();
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  // --- adaptér: jediná vazba mezi hrou a Shellem ---
  const adapter = {
    meta: { id: 'arkada', title: 'Dinosaurus', subtitle: 'zkušební hra Shellu', version: VERSION, tone: 'kid' },
    state: {
      mode: () => E.mode,
      onMode: (fn) => E.on('mode', ({ mode }) => fn(mode)),
    },
    game: {
      newGame() {
        E.reset();
        world.controller = player;
        player.release();
        E.setMode('playing');
      },
      pause() {
        if (E.mode === 'playing') E.setMode('paused');
      },
      resume() {
        if (E.mode !== 'paused') return;
        player.release();
        E.setMode('playing');
      },
      quit() {
        if (E.mode === 'menu') return;
        E.setMode('menu');
        E.reset();
      },
    },
  };

  await E.init();
  const shell = mountShell(adapter, { root: document.getElementById('shell') });

  // --- testovací háček (01_CORE oddíl 7) ---
  const roots = () => ({
    state: world.state,
    cfg: CFG,
    engine: { mode: E.mode, steps: E.steps, timeScale: E.timeScale, acc: E.acc },
  });
  window.__game = {
    version: VERSION,
    dev: shell.dev,
    mode: () => E.mode,
    start(opts = {}) {
      if (opts.seed) world.seed = opts.seed;
      adapter.game.newGame();
    },
    pause: () => adapter.game.pause(),
    resume: () => adapter.game.resume(),
    quit: () => adapter.game.quit(),
    /** Kroky bez čekání na čas; script = [{ at, jump }] řídí místo hráče. */
    sim(seconds, script) {
      if (E.mode !== 'playing') throw new Error('sim() jde volat jen v režimu playing.');
      const before = world.controller;
      if (script) world.controller = createScriptController(script);
      const n = E.sim(seconds);
      world.controller = before;
      view.dirty = true;
      return n;
    },
    get(path) {
      return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), roots());
    },
    stats: () => ({ ...E.stats, steps: E.steps }),
    snapshot: () => E.snapshot(),
    restore(s) {
      E.restore(s);
      view.dirty = true;
    },
    hash: () => stateHash(world.state),
    setTimeScale(x) {
      E.timeScale = x;
    },
    audioReady: () => audio.ready,
  };

  E.run();
}

boot();
