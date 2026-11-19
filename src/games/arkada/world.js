// Herní logika arkády jako čistý modul: žádný DOM, žádný čas mimo krok.
// Stav je prostý datový objekt, takže ho jde uložit, porovnat a pustit v Node testu.
// Pořadí v kroku: stisk → pohyb → dopad → kojotí čas → skok → odpočty → sběr a náraz → recyklace.

import { CFG } from './config.js';
import { rngNext } from '../../core/rng.js';

const EPS = 1e-6;

export function createState(seed = 1) {
  const s = {
    step: 0,
    seed: seed >>> 0,
    rng: seed >>> 0,
    player: {
      x: 0,
      y: 0,
      vy: 0,
      jumpY: 0, // výška, ze které začal poslední skok
      grounded: true,
      jumping: false,
      cut: false,
      coyote: CFG.jump.coyoteSteps,
      buffer: 0,
      prevJump: false,
      flash: 0,
    },
    crate: { x: 0, w: CFG.crate.w, h: CFG.crate.h, hit: false },
    fruit: { x: 0, y: 0, taken: false },
    score: 0,
    streak: 0,
    hits: 0,
    events: [],
  };
  placeCrate(s, 10);
  placeFruit(s);
  return s;
}

function rand(s) {
  const [v, next] = rngNext(s.rng);
  s.rng = next;
  return v;
}

function placeCrate(s, minAhead = CFG.crate.aheadMin) {
  const span = CFG.crate.aheadMax - CFG.crate.aheadMin;
  s.crate.x = s.player.x + minAhead + rand(s) * span;
  s.crate.hit = false;
}

function placeFruit(s) {
  const f = CFG.fruit;
  const base = Math.max(s.crate.x + s.crate.w, s.player.x + 6);
  s.fruit.x = base + f.afterCrateMin + rand(s) * (f.afterCrateMax - f.afterCrateMin);
  s.fruit.y = f.heights[Math.floor(rand(s) * f.heights.length)];
  s.fruit.taken = false;
}

function overlapsCrateX(s, x) {
  const half = CFG.player.w / 2;
  return x + half > s.crate.x && x - half < s.crate.x + s.crate.w;
}

/** Výška opory pod hráčem. Bedna nese jen toho, kdo na ni přišel shora. */
export function supportHeight(s, x, prevFeet) {
  const c = s.crate;
  if (!c.hit && overlapsCrateX(s, x) && prevFeet >= c.h - EPS) return c.h;
  return 0;
}

/**
 * Jeden krok světa.
 * @param {object} s stav (mění se na místě)
 * @param {{jump: boolean}} intent záměr od řízení (hráč, skript, robot)
 * @param {number} dt délka kroku v sekundách
 */
export function stepWorld(s, intent, dt) {
  const p = s.player;
  const J = CFG.jump;
  s.events.length = 0;
  s.step++;

  // 1) stisk a puštění
  const press = intent.jump && !p.prevJump;
  p.prevJump = intent.jump;
  if (press) p.buffer = J.bufferSteps;

  // 2) proměnná výška skoku: zkrátit jde až po nastoupání minimální výšky,
  //    takže i pouhé ťuknutí (dotyk, malé dítě) bednu přeskočí
  if (p.jumping && !p.cut && !intent.jump && p.vy > 0 && p.y - p.jumpY >= J.cutAfterHeight) {
    p.vy *= J.cutFactor;
    p.cut = true;
  }

  // 3) pohyb; svislý krok je pro stálé zrychlení přesný
  const prevFeet = p.y;
  p.x += CFG.speed * dt;
  if (!p.grounded) {
    p.y += p.vy * dt - 0.5 * J.gravity * dt * dt;
    p.vy -= J.gravity * dt;
  }

  // 4) opora, sejití z hrany, dopad
  const support = supportHeight(s, p.x, prevFeet);
  if (p.grounded) {
    if (p.y > support + EPS) p.grounded = false; // sešel z hrany
    else p.y = support;
  } else if (p.vy <= 0 && p.y <= support + EPS) {
    p.y = support;
    p.vy = 0;
    p.grounded = true;
    p.jumping = false;
    s.events.push('land');
  }

  // 5) kojotí čas se na zemi doplní
  if (p.grounded) p.coyote = J.coyoteSteps;

  // 6) skok: stisk v paměti + opora (skutečná nebo kojotí)
  if (p.buffer > 0 && p.coyote > 0) {
    p.vy = J.v0;
    p.jumpY = p.y;
    p.grounded = false;
    p.jumping = true;
    p.cut = false;
    p.coyote = 0;
    p.buffer = 0;
    s.events.push('jump');
  }

  // 7) odpočty
  if (!p.grounded && p.coyote > 0) p.coyote--;
  if (p.buffer > 0) p.buffer--;
  if (p.flash > 0) p.flash--;

  // 8) náraz do boku bedny: měkká prohra, bedna se pro tento průchod „vypne“
  const c = s.crate;
  if (!c.hit && overlapsCrateX(s, p.x) && p.y < c.h - EPS) {
    c.hit = true;
    s.hits++;
    s.streak = 0;
    p.flash = 30;
    s.events.push('bump');
  }

  // 9) sběr: kruh předmětu proti zvětšenému obdélníku hráče
  const f = s.fruit;
  if (!f.taken) {
    const m = CFG.player.pickupMargin;
    const halfW = CFG.player.w / 2 + m;
    const nx = Math.max(p.x - halfW, Math.min(f.x, p.x + halfW));
    const ny = Math.max(p.y - m, Math.min(f.y, p.y + CFG.player.h + m));
    const dx = f.x - nx;
    const dy = f.y - ny;
    if (dx * dx + dy * dy <= CFG.fruit.r * CFG.fruit.r) {
      f.taken = true;
      s.score++;
      s.streak++;
      s.events.push('pickup');
    }
  }

  // 10) recyklace objektů za hráčem
  if (c.x + c.w < p.x - CFG.behind) placeCrate(s);
  if (f.taken || f.x < p.x - CFG.behind) {
    if (!f.taken) s.streak = 0;
    placeFruit(s);
  }

  return s;
}

/** Otisk stavu pro porovnávání v testech. */
export function stateHash(s) {
  const p = s.player;
  return [s.step, s.rng, p.x.toFixed(6), p.y.toFixed(6), p.vy.toFixed(6), s.score, s.hits, s.crate.x.toFixed(6), s.fruit.x.toFixed(6), s.fruit.y].join('|');
}
