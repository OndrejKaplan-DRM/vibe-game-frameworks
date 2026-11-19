// Shell, krok S0: titul, start, pauza, Esc, pauza při skryté kartě.
// Nezná engine ani plátno. S hrou mluví jen přes adaptér (02_SHELL oddíl 1).
//
// Adaptér v S0:
//   meta:  { id, title, subtitle, version, tone: 'hard' | 'retro' | 'kid' }
//   state: { mode(): string, onMode(fn) }            ← doplněno při prvním použití (viz docs/DECISIONS.md)
//   game:  { newGame(), pause(), resume(), quit() }
// Obrazovky se skládají z deklarací; položka s nesplněnou podmínkou `when` se nevykreslí.

import { STRINGS } from './strings.js';

const ESC_GUARD_MS = 300;

const SCREENS = {
  menu: {
    hero: true,
    items: [{ id: 'play', label: 'play', run: (a) => a.game.newGame() }],
  },
  paused: {
    heading: 'paused',
    items: [
      { id: 'resume', label: 'resume', run: (a) => a.game.resume() },
      { id: 'restart', label: 'restart', run: (a) => a.game.newGame() },
      { id: 'quit', label: 'quit', run: (a) => a.game.quit() },
    ],
  },
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function mountShell(adapter, { root, lang = 'cs', search = globalThis.location?.search || '' } = {}) {
  if (!adapter?.meta || !adapter.state || !adapter.game) throw new Error('Shell: adaptér musí mít meta, state a game.');
  const t = STRINGS[lang];
  const dev = new URLSearchParams(search).has('dev');

  root.classList.add('shell', `tone-${adapter.meta.tone || 'hard'}`);
  if (dev) root.classList.add('dev');

  const screens = {};
  for (const [mode, def] of Object.entries(SCREENS)) {
    const screen = el('section', `sh-screen sh-${mode}`);
    screen.dataset.screen = mode;
    screen.hidden = true;

    if (def.hero) {
      screen.append(el('h1', 'sh-title', adapter.meta.title));
      if (adapter.meta.subtitle) screen.append(el('p', 'sh-subtitle', adapter.meta.subtitle));
    }
    if (def.heading) screen.append(el('h2', 'sh-heading', t[def.heading]));

    const nav = el('nav', 'sh-nav');
    for (const item of def.items) {
      if (item.when && !item.when(adapter)) continue; // deklarované schopnosti: co hra neumí, není vidět
      const btn = el('button', 'sh-btn', t[item.label]);
      btn.type = 'button';
      btn.dataset.id = item.id;
      btn.addEventListener('click', () => {
        btn.blur();
        item.run(adapter);
      });
      nav.append(btn);
    }
    screen.append(nav);

    if (def.hero) {
      const version = el('footer', 'sh-version', adapter.meta.version + (dev ? ` · ${t.dev}` : ''));
      screen.append(version);
    }
    root.append(screen);
    screens[mode] = screen;
  }

  // tlačítko pauzy pro dotyková zařízení (a myš); klávesnice má Esc
  const pauseBtn = el('button', 'sh-pause', '❚❚');
  pauseBtn.type = 'button';
  pauseBtn.tabIndex = -1;
  pauseBtn.setAttribute('aria-label', t.pause);
  pauseBtn.hidden = true;
  pauseBtn.addEventListener('click', () => adapter.game.pause());
  root.append(pauseBtn);

  function buttons() {
    const screen = screens[adapter.state.mode()];
    return screen ? [...screen.querySelectorAll('.sh-btn')] : [];
  }

  function show(mode) {
    for (const [key, screen] of Object.entries(screens)) screen.hidden = key !== mode;
    pauseBtn.hidden = mode !== 'playing';
    root.dataset.mode = mode;
    const first = buttons()[0];
    if (first) first.focus({ preventScroll: true });
    else if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }

  let lastEsc = -Infinity;
  function onKeyDown(e) {
    const mode = adapter.state.mode();
    if (e.code === 'Escape') {
      if (e.timeStamp - lastEsc < ESC_GUARD_MS) return; // ochrana proti dvojímu přepnutí
      lastEsc = e.timeStamp;
      if (mode === 'playing') adapter.game.pause();
      else if (mode === 'paused') adapter.game.resume();
      return;
    }
    if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
      const list = buttons();
      if (!list.length) return;
      e.preventDefault();
      const i = list.indexOf(document.activeElement);
      const next = e.code === 'ArrowDown' ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
      list[next].focus({ preventScroll: true });
    }
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden' && adapter.state.mode() === 'playing') adapter.game.pause();
  }

  window.addEventListener('keydown', onKeyDown);
  document.addEventListener('visibilitychange', onVisibility);
  adapter.state.onMode(show);
  show(adapter.state.mode());

  return {
    dev,
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibility);
      root.replaceChildren();
    },
  };
}
