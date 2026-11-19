// Vykreslení arkády: čte stav, nic nemění. Barevné obdélníky (M1), Canvas 2D.
// Logické rozlišení 16 × 9 m se škáluje do okna s okraji (case 40, A12).

import { CFG } from './config.js';

const COLORS = {
  sky: '#bfe3ff',
  far: '#a9d4f5',
  ground: '#6dbf5b',
  soil: '#8a5a3c',
  player: '#2f6f3e',
  playerFlash: '#e2574c',
  eye: '#ffffff',
  crate: '#b5793c',
  crateEdge: '#7d4f22',
  fruit: '#e63946',
  leaf: '#2a9d4b',
  text: '#16324a',
};

export function createRenderer(canvas, { dev = false } = {}) {
  const ctx = canvas.getContext('2d');
  let scale = 1; // px na metr
  let prev = { x: 0, y: 0 };
  let pixelScale = 1; // měřítko vykreslení z nastavení (1 = nativní)
  const baseDpr = () => Math.min(globalThis.devicePixelRatio || 1, 2);

  function resize() {
    const dpr = baseDpr() * pixelScale;
    canvas.style.imageRendering = pixelScale < 0.75 ? 'pixelated' : 'auto';
    const availW = canvas.parentElement.clientWidth;
    const availH = canvas.parentElement.clientHeight;
    const ratio = CFG.view.w / CFG.view.h;
    let cssW = availW;
    let cssH = availW / ratio;
    if (cssH > availH) {
      cssH = availH;
      cssW = availH * ratio;
    }
    canvas.style.width = `${Math.floor(cssW)}px`;
    canvas.style.height = `${Math.floor(cssH)}px`;
    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    scale = canvas.width / CFG.view.w;
  }

  // svět → plátno
  const sx = (x, camX) => (x - camX + CFG.view.playerX) * scale;
  const sy = (y) => canvas.height - (y + CFG.view.groundY) * scale;

  function rect(x, y, w, h, camX, color) {
    ctx.fillStyle = color;
    ctx.fillRect(sx(x, camX), sy(y + h), w * scale, h * scale);
  }
  function box(x, y, w, h, camX, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, scale * 0.03);
    ctx.strokeRect(sx(x, camX), sy(y + h), w * scale, h * scale);
  }

  function draw(s, alpha, info) {
    const p = s.player;
    const camX = prev.x + (p.x - prev.x) * alpha;
    const py = prev.y + (p.y - prev.y) * alpha;
    const W = canvas.width;
    const H = canvas.height;

    // pozadí s jednoduchou paralaxou
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COLORS.far;
    const hillW = 6 * scale;
    const shift = ((camX * 0.3 * scale) % hillW + hillW) % hillW;
    for (let x = -shift - hillW; x < W + hillW; x += hillW) {
      ctx.beginPath();
      ctx.ellipse(x + hillW / 2, sy(0), hillW * 0.6, 2.2 * scale, 0, Math.PI, 0);
      ctx.fill();
    }

    // země
    ctx.fillStyle = COLORS.soil;
    ctx.fillRect(0, sy(0), W, H - sy(0));
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, sy(0), W, 0.25 * scale);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    const tick = 2 * scale;
    const off = ((camX * scale) % tick + tick) % tick;
    for (let x = -off; x < W; x += tick) ctx.fillRect(x, sy(0) + 0.25 * scale, 0.08 * scale, 0.5 * scale);

    // bedna
    const c = s.crate;
    ctx.globalAlpha = c.hit ? 0.35 : 1;
    rect(c.x, 0, c.w, c.h, camX, COLORS.crate);
    box(c.x, 0, c.w, c.h, camX, COLORS.crateEdge);
    ctx.globalAlpha = 1;

    // předmět
    const f = s.fruit;
    if (!f.taken) {
      ctx.fillStyle = COLORS.fruit;
      ctx.beginPath();
      ctx.arc(sx(f.x, camX), sy(f.y), CFG.fruit.r * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.leaf;
      ctx.fillRect(sx(f.x, camX) - 0.03 * scale, sy(f.y + CFG.fruit.r + 0.12), 0.06 * scale, 0.14 * scale);
    }

    // hráč (obrázek je větší než zranitelná oblast)
    const P = CFG.player;
    const flash = p.flash > 0 && Math.floor(p.flash / 4) % 2 === 0;
    rect(camX - P.drawW / 2, py, P.drawW, P.drawH, camX, flash ? COLORS.playerFlash : COLORS.player);
    rect(camX + P.drawW / 2 - 0.22, py + P.drawH - 0.3, 0.12, 0.12, camX, COLORS.eye);

    // skóre
    ctx.fillStyle = COLORS.fruit;
    ctx.beginPath();
    ctx.arc(0.6 * scale, 0.6 * scale, 0.22 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.text;
    ctx.font = `700 ${0.5 * scale}px Calibri, 'Arial Narrow', 'Roboto Condensed', system-ui, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(String(s.score), 1.0 * scale, 0.62 * scale);

    if (dev) drawDev(s, camX, py, info);
  }

  function drawDev(s, camX, py, info) {
    const P = CFG.player;
    const m = P.pickupMargin;
    box(camX - P.w / 2, py, P.w, P.h, camX, '#00ff66'); // zranitelná oblast
    box(camX - P.w / 2 - m, py - m, P.w + 2 * m, P.h + 2 * m, camX, '#ffcc00'); // sběr
    box(s.crate.x, 0, s.crate.w, s.crate.h, camX, '#ff2244'); // překážka
    if (!s.fruit.taken) {
      ctx.strokeStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(sx(s.fruit.x, camX), sy(s.fruit.y), CFG.fruit.r * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    const p = s.player;
    const lines = [
      `režim ${info.mode} · krok ${info.steps} · ${info.fps.toFixed(0)} sn/s`,
      `krok ${info.stepMs.toFixed(3)} ms · snímek ${info.frameMs.toFixed(2)} ms`,
      `y ${p.y.toFixed(2)} m · vy ${p.vy.toFixed(2)} m/s · ${p.grounded ? 'na zemi' : 've vzduchu'}`,
      `kojot ${p.coyote} · paměť ${p.buffer} · nárazy ${s.hits} · série ${s.streak}`,
    ];
    ctx.font = `${0.26 * scale}px ui-monospace, Consolas, monospace`;
    ctx.textBaseline = 'top';
    const pad = 0.15 * scale;
    const lh = 0.34 * scale;
    const top = 1.05 * scale; // pod skóre; pravý horní roh patří tlačítku pauzy ze Shellu
    ctx.fillStyle = 'rgba(8,16,26,0.72)';
    ctx.fillRect(pad, top, 7.05 * scale, lines.length * lh + pad);
    ctx.fillStyle = '#00f5d4';
    lines.forEach((t, i) => ctx.fillText(t, pad * 2, top + pad * 0.6 + i * lh));
  }

  return {
    resize,
    draw,
    /** Volá se před každým krokem: poloha pro prolínání mezi kroky. */
    remember(s) {
      prev = { x: s.player.x, y: s.player.y };
    },
    get scale() {
      return scale;
    },
    setPixelScale(v) {
      pixelScale = v;
      resize();
    },
    /** Skutečný poměr bodů plátna k bodům na obrazovce, vztažený k nativnímu rozlišení. */
    measuredPixelScale() {
      const cssW = parseFloat(canvas.style.width) || 1;
      return canvas.width / (cssW * baseDpr());
    },
  };
}
