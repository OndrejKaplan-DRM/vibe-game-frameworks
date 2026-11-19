// T1 — logika v Node, bez prohlížeče: jádro (čas, režimy) a svět arkády (skok, kojotí čas,
// paměť stisku, sběr, náraz, opakovatelnost). Odpovídá testům T1, T2 a T4 z casu 40.

import { createEngine, TRANSITIONS } from '../src/core/engine.js';
import { rngNext } from '../src/core/rng.js';
import { CFG } from '../src/games/arkada/config.js';
import { createState, stepWorld, stateHash } from '../src/games/arkada/world.js';
import { createScriptController } from '../src/games/arkada/input.js';

const DT = 1 / CFG.stepHz;
let pass = 0;
let fail = 0;
function ok(cond, name, detail = '') {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? '  ok  ' : 'CHYBA '} ${name}${detail ? '  [' + detail + ']' : ''}`);
}

/** Stav bez bedny a předmětu v cestě: čistá rovina pro měření skoku. */
function flat(seed = 1) {
  const s = createState(seed);
  s.crate.x = 1e6;
  s.fruit.x = 2e6;
  return s;
}
/** Hráč stojí na bedně, hrana je `toEdge` metrů před ním. */
function onCrate(toEdge) {
  const s = flat();
  s.crate.x = -5;
  s.crate.w = 5 + toEdge - CFG.player.w / 2; // opora končí, když zadní hrana hráče mine konec bedny
  s.player.y = s.crate.h;
  return s;
}
function run(s, n, script = []) {
  const c = createScriptController(script);
  const trace = [];
  for (let i = 0; i < n; i++) {
    stepWorld(s, c.think(), DT);
    trace.push({ y: s.player.y, vy: s.player.vy, grounded: s.player.grounded, events: [...s.events] });
  }
  return trace;
}

// ---------- jádro ----------
console.log('Jádro');
{
  const E = createEngine({ step: 1 / 60 });
  let steps = 0;
  E.add({ name: 'pocitadlo', step: () => steps++ });
  await E.init();
  ok(E.mode === 'menu', 'po init je režim menu');

  for (let i = 0; i < 60; i++) E.tick(1 / 60);
  ok(steps === 0, 'v menu se nekrokuje', `kroků ${steps}`);

  E.setMode('playing');
  for (let i = 0; i < 60; i++) E.tick(1 / 60);
  ok(steps === 60, '1 s při 1× = 60 kroků', `kroků ${steps}`);

  steps = 0;
  E.timeScale = 0.5;
  for (let i = 0; i < 60; i++) E.tick(1 / 60);
  ok(steps === 30, '1 s při 0,5× = 30 kroků (škáluje se přísun času)', `kroků ${steps}`);

  steps = 0;
  E.timeScale = 5;
  for (let i = 0; i < 60; i++) E.tick(1 / 60);
  ok(steps === 300, '1 s při 5× = 300 kroků, krok zůstává 1/60', `kroků ${steps}`);

  steps = 0;
  E.timeScale = 1;
  E.tick(5);
  ok(steps <= 6, 'zásek 5 s se započítá nejvýš jako 0,1 s', `kroků ${steps}`);

  steps = 0;
  E.setMode('paused');
  for (let i = 0; i < 60; i++) E.tick(1 / 60);
  ok(steps === 0, 'v pauze se nekrokuje', `kroků ${steps}`);

  let threw = false;
  try {
    E.setMode('boot');
  } catch {
    threw = true;
  }
  ok(threw, 'nepovolený přechod režimu vyhodí chybu');
  ok(Object.keys(TRANSITIONS).length === 5, 'tabulka přechodů má 5 režimů');

  const [a, s1] = rngNext(1);
  const [b] = rngNext(1);
  const [c] = rngNext(s1);
  ok(a === b && a !== c && a >= 0 && a < 1, 'generátor je opakovatelný');
}

// ---------- T1: skok podle návrhových veličin ----------
console.log('T1 — skok');
{
  const s = flat();
  const hold = [{ at: 0, jump: true }];
  const tr = run(s, 80, hold);
  const jumpStep = tr.findIndex((t) => t.events.includes('jump'));
  let apex = 0;
  let apexStep = 0;
  tr.forEach((t, i) => {
    if (t.y > apex) {
      apex = t.y;
      apexStep = i;
    }
  });
  const h = CFG.jump.height;
  const stepsToApex = apexStep - jumpStep;
  const want = CFG.jump.timeToApex / DT;
  ok(Math.abs(apex - h) / h <= 0.02, 'výška skoku = h ±2 %', `${apex.toFixed(4)} m, cíl ${h} m`);
  ok(Math.abs(stepsToApex - want) <= 1, 'čas do vrcholu = t ±1 krok', `${stepsToApex} kroků, cíl ${want.toFixed(1)}`);
  const landStep = tr.findIndex((t) => t.events.includes('land'));
  ok(landStep > 0 && Math.abs(landStep - jumpStep - 2 * want) <= 2, 'dopad po dvojnásobku času do vrcholu', `${landStep - jumpStep} kroků`);

  // proměnná výška: krátký stisk = nižší skok, ale nikdy pod návrhové minimum
  const s2 = flat();
  const tr2 = run(s2, 80, [
    { at: 0, jump: true },
    { at: 1, jump: false },
  ]);
  const apex2 = Math.max(...tr2.map((t) => t.y));
  const mh = CFG.jump.minHeight;
  ok(apex2 < apex - 0.1 && apex2 >= mh && apex2 <= mh * 1.06, 'ťuknutí dá nižší skok, ale ne pod minimum', `${apex2.toFixed(3)} m, minimum ${mh} m, plný ${apex.toFixed(3)} m`);
  ok(mh >= CFG.crate.h + 0.3, 'minimální skok má rezervu nad bednou', `${mh} m proti bedně ${CFG.crate.h} m`);

  // průchodnost: v kolika krocích lze stisknout, aby hráč bednu překonal bez nárazu
  const windowFor = (holdSteps) => {
    let n = 0;
    for (let press = 0; press < 120; press++) {
      const s = flat();
      s.crate.x = 6;
      run(s, 200, [
        { at: press, jump: true },
        { at: press + holdSteps, jump: false },
      ]);
      if (s.hits === 0) n++;
    }
    return n;
  };
  const tapWindow = windowFor(1);
  const fullWindow = windowFor(40);
  ok(tapWindow >= 12, 'bednu jde přeskočit i ťuknutím, okno aspoň 12 kroků (0,2 s)', `ťuknutí ${tapWindow} kroků, držení ${fullWindow} kroků`);
}

// ---------- T2: paměť stisku a kojotí čas ----------
console.log('T2 — paměť stisku a kojotí čas');
{
  // nejdřív zjisti krok dopadu po prvním skoku
  const probe = run(flat(), 80, [
    { at: 0, jump: true },
    { at: 30, jump: false },
  ]);
  const land = probe.findIndex((t) => t.events.includes('land'));
  const B = CFG.jump.bufferSteps;

  const jumpsAfter = (pressAt) => {
    const tr = run(flat(), 120, [
      { at: 0, jump: true },
      { at: 30, jump: false },
      { at: pressAt, jump: true },
      { at: pressAt + 2, jump: false },
    ]);
    return tr.filter((t) => t.events.includes('jump')).length;
  };
  ok(jumpsAfter(land - 5) === 2, 'stisk 5 kroků před dopadem se provede po dopadu');
  ok(jumpsAfter(land - (B - 1)) === 2, `stisk ${B - 1} kroků před dopadem ještě platí`);
  ok(jumpsAfter(land - (B + 2)) === 1, `stisk ${B + 2} kroků před dopadem už propadne`);

  // kojotí čas: hráč sejde z bedny, skok přijde až ve vzduchu
  const C = CFG.jump.coyoteSteps;
  const offEdge = (() => {
    const s = onCrate(0.5);
    const tr = run(s, 40);
    return tr.findIndex((t) => !t.grounded); // první krok ve vzduchu
  })();
  const coyoteJump = (after) => {
    const s = onCrate(0.5);
    const tr = run(s, 60, [{ at: offEdge + after - 1, jump: true }]);
    return tr.some((t) => t.events.includes('jump'));
  };
  ok(offEdge > 0, 'hráč z bedny sejde', `krok ${offEdge}`);
  ok(coyoteJump(5), 'skok 5 kroků za hranou se provede');
  ok(coyoteJump(C), `skok ${C} kroků za hranou ještě platí`);
  ok(!coyoteJump(C + 2), `skok ${C + 2} kroků za hranou už neplatí`);
}

// ---------- bedna, náraz, sběr ----------
console.log('Bedna, náraz, sběr');
{
  // náraz do boku: jednou, bez zastavení
  const s = flat();
  s.crate.x = 2;
  run(s, 90);
  ok(s.hits === 1, 'náraz do boku bedny se započítá právě jednou', `nárazy ${s.hits}`);
  ok(s.player.x > 6, 'po nárazu hráč pokračuje (měkká prohra)');

  // přeskočení: žádný náraz
  const s2 = flat();
  s2.crate.x = 2.2;
  run(s2, 90, [
    { at: 8, jump: true },
    { at: 40, jump: false },
  ]);
  ok(s2.hits === 0, 'včasný skok bednu přeskočí', `nárazy ${s2.hits}`);

  // dopad na bednu shora: nese
  const s3 = flat();
  s3.crate.x = 1.0;
  s3.crate.w = 4;
  const tr3 = run(s3, 60, [
    { at: 0, jump: true },
    { at: 30, jump: false },
  ]);
  const landed = tr3.find((t) => t.events.includes('land'));
  ok(landed && Math.abs(landed.y - s3.crate.h) < 1e-6 && s3.hits === 0, 'dopad shora na bednu: hráč na ní stojí', `y ${landed?.y}`);

  // sběr na zemi a ve skoku
  const s4 = flat();
  s4.fruit.x = 3;
  s4.fruit.y = 0.5;
  run(s4, 60);
  ok(s4.score === 1 && s4.streak === 1, 'nízký předmět se sebere za běhu', `skóre ${s4.score}`);

  const s5 = flat();
  s5.fruit.x = 3;
  s5.fruit.y = 1.9;
  const s5b = structuredClone(s5);
  run(s5, 60);
  run(s5b, 60, [
    { at: 12, jump: true },
    { at: 40, jump: false },
  ]);
  ok(s5.score === 0 && s5b.score === 1, 'vysoký předmět jen se skokem', `bez skoku ${s5.score}, se skokem ${s5b.score}`);
}

// ---------- T4: opakovatelnost a uložení ----------
console.log('T4 — opakovatelnost');
{
  const script = [];
  for (let i = 0; i < 40; i++) script.push({ at: 20 + i * 37, jump: true }, { at: 20 + i * 37 + 9 + (i % 5), jump: false });
  const a = createState(7);
  const b = createState(7);
  run(a, 1500, script);
  run(b, 1500, script);
  ok(stateHash(a) === stateHash(b), 'stejný seed a vstupy → stejný stav', stateHash(a));

  const c = createState(8);
  run(c, 1500, script);
  ok(stateHash(a) !== stateHash(c), 'jiný seed → jiný průběh');

  // ulož uprostřed, pokračuj z kopie
  const d = createState(7);
  const ctl = createScriptController(script);
  for (let i = 0; i < 700; i++) stepWorld(d, ctl.think(), DT);
  const saved = JSON.parse(JSON.stringify(d));
  for (let i = 700; i < 1500; i++) stepWorld(d, ctl.think(), DT);
  const ctl2 = createScriptController(script);
  for (let i = 0; i < 700; i++) ctl2.think();
  for (let i = 700; i < 1500; i++) stepWorld(saved, ctl2.think(), DT);
  ok(stateHash(d) === stateHash(saved) && stateHash(d) === stateHash(a), 'ulož → nahraj → pokračuj dá stejný stav');

  const far = createState(3);
  run(far, 60 * 600, script);
  const okNums = [far.player.x, far.player.y, far.player.vy, far.crate.x, far.fruit.x].every(Number.isFinite);
  ok(okNums && far.player.y >= 0 && far.player.y < 3, '10 minut běhu: žádné NaN, výška v mezích', `x ${far.player.x.toFixed(1)} m, skóre ${far.score}, nárazy ${far.hits}`);

  // rozpočet kroku
  const t0 = performance.now();
  const perf = createState(1);
  run(perf, 20000);
  const ms = (performance.now() - t0) / 20000;
  ok(ms < 0.05, 'krok světa je hluboko pod rozpočtem', `${(ms * 1000).toFixed(2)} µs na krok`);
}

console.log(`\nT1 logika: ${pass} prošlo, ${fail} selhalo`);
process.exit(fail ? 1 : 0);
