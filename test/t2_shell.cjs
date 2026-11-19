// T2 — Shell S0 a hra v prohlížeči: start bez chyb, režimy, Esc, pauza při skryté kartě (T7),
// klávesnice, dotyk, vývojářský režim, deklarované schopnosti, rozložení ve třech rozlišeních (T8).

const { launch, open, ok, skip, shot, results } = require('./h.cjs');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await launch();

  // ---------- start, menu, režimy ----------
  console.log('Start a režimy');
  {
    const { ctx, page, errs } = await open(browser);
    ok((await page.evaluate(() => __game.mode())) === 'menu', 'po startu je režim menu');
    ok((await page.textContent('.sh-title')) === 'Dinosaurus', 'titul je z adaptéru');
    ok(/v0\.1/.test(await page.textContent('.sh-version')), 'verze je vidět');
    ok((await page.locator('.sh-menu .sh-btn').count()) === 1, 'menu má jen položky, které hra umí', 'Hrát');
    ok((await page.locator('[data-id="settings"], [data-id="load"], [data-id="catalog"]').count()) === 0, 'žádné tlačítko pro neexistující funkci');
    ok(await page.evaluate(() => document.activeElement?.dataset?.id === 'play'), 'první položka má fokus');

    const s0 = await page.evaluate(() => __game.stats().steps);
    await wait(300);
    ok((await page.evaluate(() => __game.stats().steps)) === s0, 'v menu čítač kroků stojí');

    await page.keyboard.press('Enter');
    ok((await page.evaluate(() => __game.mode())) === 'playing', 'Enter na „Hrát“ spustí hru');
    ok(await page.locator('.sh-menu').isHidden(), 'menu je při hře skryté');
    await wait(500);
    const s1 = await page.evaluate(() => __game.stats().steps);
    ok(s1 > 0, 'při hře kroky běží', `kroků ${s1}`);

    // Esc → pauza, čítač stojí
    await page.keyboard.press('Escape');
    ok((await page.evaluate(() => __game.mode())) === 'paused', 'Esc při hře = pauza');
    const p0 = await page.evaluate(() => ({ steps: __game.stats().steps, hash: __game.hash() }));
    await wait(400);
    const p1 = await page.evaluate(() => ({ steps: __game.stats().steps, hash: __game.hash() }));
    ok(p0.steps === p1.steps && p0.hash === p1.hash, 'v pauze stojí kroky i stav');
    ok((await page.locator('.sh-paused .sh-btn').count()) === 3, 'pauza má 3 položky');

    // ochrana proti dvojímu přepnutí
    await wait(350);
    await page.evaluate(() => {
      const ev = (ts) => {
        const e = new KeyboardEvent('keydown', { code: 'Escape', bubbles: true });
        Object.defineProperty(e, 'timeStamp', { value: ts });
        window.dispatchEvent(e);
      };
      const t = performance.now();
      ev(t);
      ev(t + 50);
    });
    ok((await page.evaluate(() => __game.mode())) === 'playing', 'dva Esc do 300 ms přepnou jen jednou');

    // šipky v pauze, návrat do menu
    await wait(350);
    await page.keyboard.press('Escape');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    ok(await page.evaluate(() => document.activeElement?.dataset?.id === 'quit'), 'šipky posouvají fokus v nabídce');
    await page.keyboard.press('Enter');
    ok((await page.evaluate(() => __game.mode())) === 'menu', '„Hlavní menu“ vrací do menu');
    ok((await page.evaluate(() => __game.get('state.step'))) === 0, 'po návratu je svět ve výchozím stavu');

    ok(errs.length === 0, 'žádné chyby ani varování v konzoli', errs.join(' | '));
    await ctx.close();
  }

  // ---------- T7: skrytá karta ----------
  console.log('T7 — skrytá karta');
  {
    const { ctx, page, errs } = await open(browser);
    await page.evaluate(() => __game.start());
    await wait(200);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    const a = await page.evaluate(() => ({ mode: __game.mode(), hash: __game.hash() }));
    await wait(600);
    const b = await page.evaluate(() => ({ mode: __game.mode(), hash: __game.hash() }));
    ok(a.mode === 'paused', 'skrytí karty přepne do pauzy');
    ok(a.hash === b.hash && b.mode === 'paused', 'po návratu je stav beze změny a hra čeká v pauze');
    ok(errs.length === 0, 'bez chyb', errs.join(' | '));
    await ctx.close();
  }

  // ---------- klávesnice ve hře, sim(), uložení stavu ----------
  console.log('Hra: klávesnice, simulace, stav');
  {
    const { ctx, page, errs } = await open(browser, { q: '?seed=5' });
    await page.evaluate(() => __game.start());
    await page.keyboard.down('Space');
    await wait(250);
    const air = await page.evaluate(() => ({ y: __game.get('state.player.y'), g: __game.get('state.player.grounded') }));
    await page.keyboard.up('Space');
    ok(air.y > 0.3 && air.g === false, 'mezerník = skok', `y ${air.y.toFixed(2)} m`);
    ok(await page.evaluate(() => __game.audioReady()), 'zvuk je po prvním gestu odemčený');

    // sim() bez čekání na čas + opakovatelnost v prohlížeči
    const runOnce = () =>
      page.evaluate(() => {
        __game.pause();
        __game.start({ seed: 5 });
        __game.sim(20, [
          { at: 30, jump: true },
          { at: 60, jump: false },
          { at: 200, jump: true },
          { at: 230, jump: false },
        ]);
        const out = { hash: __game.hash(), steps: __game.stats().steps, stepMs: __game.stats().stepMs };
        __game.pause();
        return out;
      });
    const r1 = await runOnce();
    const r2 = await runOnce();
    ok(r1.steps >= 1200, 'sim(20 s) provede 1200 kroků bez čekání', `kroků ${r1.steps}`);
    ok(r1.hash === r2.hash, 'stejný seed a skript dají stejný stav i v prohlížeči');
    ok(r1.stepMs < 2, 'krok je pod rozpočtem 2 ms', `${r1.stepMs.toFixed(4)} ms`);

    // snapshot → další kroky → restore → stejné kroky → stejný stav
    const same = await page.evaluate(() => {
      __game.resume();
      const snap = __game.snapshot();
      __game.sim(3, [{ at: 10, jump: true }]);
      const h1 = __game.hash();
      __game.restore(snap);
      __game.sim(3, [{ at: 10, jump: true }]);
      const h2 = __game.hash();
      __game.pause();
      return h1 === h2;
    });
    ok(same, 'ulož → nahraj → stejné vstupy → stejný stav');

    // time-scale: víc kroků za stejný čas, ne delší krok
    const scaled = await page.evaluate(async () => {
      __game.start({ seed: 5 });
      const measure = async (x) => {
        __game.setTimeScale(x);
        const s0 = __game.stats().steps;
        await new Promise((r) => setTimeout(r, 500));
        return __game.stats().steps - s0;
      };
      const one = await measure(1);
      const two = await measure(2);
      __game.setTimeScale(1);
      __game.pause();
      return { one, two };
    });
    ok(scaled.one > 5 && scaled.two > scaled.one * 1.5, 'time-scale 2× = zhruba dvojnásobek kroků', `1×: ${scaled.one}, 2×: ${scaled.two}`);
    ok(errs.length === 0, 'bez chyb', errs.join(' | '));
    await ctx.close();
  }

  // ---------- dotyk (telefon na šířku) ----------
  console.log('Dotyk');
  {
    const { ctx, page, errs } = await open(browser, {
      context: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    });
    await page.tap('[data-id="play"]');
    ok((await page.evaluate(() => __game.mode())) === 'playing', 'ťuknutí na „Hrát“ spustí hru');
    await wait(150);

    // tlačítko pauzy leží nad herní plochou: ťuknutí na něj nesmí být skok
    const box = await page.locator('.sh-pause').boundingBox();
    ok(box && box.width >= 48 && box.height >= 48, 'tlačítko pauzy má aspoň 48 px', box ? `${box.width}×${box.height}` : 'chybí');
    await page.tap('.sh-pause');
    ok((await page.evaluate(() => __game.mode())) === 'paused', 'ťuknutí na pauzu = pauza');
    const clean = await page.evaluate(() => {
      const p = __game.get('state.player');
      const before = !p.jumping && p.buffer === 0 && p.grounded;
      __game.resume();
      __game.sim(0.3);
      const after = __game.get('state.player');
      return before && after.grounded && after.y === 0 && !after.jumping;
    });
    ok(clean, 'ťuknutí na pauzu nespustilo skok (ani po návratu do hry)');

    // ťuknutí do plochy i do okraje mimo plátno = skok
    await page.touchscreen.tap(300, 200);
    await wait(120);
    const y = await page.evaluate(() => __game.get('state.player.y'));
    ok(y > 0.05, 'ťuknutí do plátna = skok', `y ${y.toFixed(2)} m`);
    const edge = await page.evaluate(async () => {
      __game.pause();
      __game.start();
      const c = document.getElementById('view').getBoundingClientRect();
      return { left: c.left, top: c.top, w: innerWidth, h: innerHeight };
    });
    if (edge.left >= 6 || edge.top >= 6) {
      await page.touchscreen.tap(edge.left >= 6 ? 3 : edge.w / 2, edge.top >= 6 ? 3 : edge.h / 2);
      await wait(120);
      const y2 = await page.evaluate(() => __game.get('state.player.y'));
      ok(y2 > 0.05, 'ťuknutí do okraje mimo plátno = skok', `y ${y2.toFixed(2)} m`);
    } else {
      skip('ťuknutí do okraje mimo plátno', 'plátno v tomto rozlišení vyplňuje celé okno');
    }
    await page.tap('.sh-pause');
    ok(errs.length === 0, 'bez chyb', errs.join(' | '));
    await shot(page, 't2_telefon_pauza_844x390.png');
    await ctx.close();
  }

  // ---------- vývojářský režim ----------
  console.log('Vývojářský režim');
  {
    const a = await open(browser);
    ok((await a.page.evaluate(() => __game.dev)) === false, 'bez ?dev je vývojářský režim vypnutý');
    ok(!/vývojářský/.test(await a.page.textContent('.sh-version')), 'bez ?dev není v menu zmínka');
    await a.ctx.close();

    const b = await open(browser, { q: '?dev' });
    ok((await b.page.evaluate(() => __game.dev)) === true, 's ?dev je zapnutý');
    await b.page.evaluate(() => {
      __game.start();
      __game.sim(1.6, [{ at: 60, jump: true }]);
    });
    await wait(200);
    await shot(b.page, 't2_dev_1366x768.png');
    await b.ctx.close();
  }

  // ---------- T8: rozložení ----------
  console.log('T8 — rozložení');
  for (const [w, h] of [
    [360, 640],
    [1366, 768],
    [1920, 1080],
  ]) {
    const { ctx, page } = await open(browser, { context: { viewport: { width: w, height: h } } });
    const m = await page.evaluate(() => {
      const r = (sel) => document.querySelector(sel).getBoundingClientRect();
      const c = r('#view');
      const t = r('.sh-title');
      const b = r('.sh-btn');
      return {
        canvas: [c.left, c.top, c.right, c.bottom],
        ratio: c.width / c.height,
        title: [t.left, t.right, t.top],
        btn: [b.left, b.right, b.bottom, b.height],
        scroll: document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight,
      };
    });
    const inside = m.canvas[0] >= -0.5 && m.canvas[1] >= -0.5 && m.canvas[2] <= w + 0.5 && m.canvas[3] <= h + 0.5;
    ok(inside && Math.abs(m.ratio - 16 / 9) < 0.02, `${w}×${h}: plátno je celé v okně a drží 16:9`, `poměr ${m.ratio.toFixed(3)}`);
    ok(m.title[0] >= 0 && m.title[1] <= w && m.btn[0] >= 0 && m.btn[1] <= w && m.btn[2] <= h && m.btn[3] >= 48, `${w}×${h}: titul a tlačítko se vejdou, tlačítko ≥ 48 px`, `výška ${m.btn[3].toFixed(0)} px`);
    ok(m.scroll, `${w}×${h}: nic nepřetéká`);
    await shot(page, `t2_menu_${w}x${h}.png`);
    await page.evaluate(() => {
      __game.start();
      __game.sim(1.2, [{ at: 40, jump: true }]);
    });
    await wait(150);
    await shot(page, `t2_hra_${w}x${h}.png`);
    await ctx.close();
  }

  await browser.close();
  console.log(`\nT2 Shell: ${results.pass} prošlo, ${results.fail} selhalo, ${results.skipped} přeskočeno`);
  process.exit(results.fail ? 1 : 0);
})().catch((e) => {
  console.error('PÁD TESTU', e);
  process.exit(2);
});
