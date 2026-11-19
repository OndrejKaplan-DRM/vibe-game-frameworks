// T4 — Shell S1 v prohlížeči: obrazovka nastavení, test proti slepým prvkům na skutečné hře,
// uložení a obnova po znovunačtení, nedostupné a poškozené úložiště, Esc o úroveň zpět,
// deklarované schopnosti, výzva k otočení telefonu, rozložení.

const { launch, open, ok, skip, shot, results } = require('./h.cjs');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const mode = (page) => page.evaluate(() => __game.mode());
const screen = (page) => page.evaluate(() => __game.screen());

(async () => {
  const browser = await launch();

  // ---------- obrazovka z deklarací ----------
  console.log('Obrazovka nastavení');
  {
    const { ctx, page, errs } = await open(browser);
    await page.keyboard.press('ArrowDown');
    ok(await page.evaluate(() => document.activeElement?.dataset?.id === 'settings'), 'šipka dolů v menu míří na „Nastavení“');
    await page.keyboard.press('Enter');
    ok((await screen(page)) === 'settings' && (await mode(page)) === 'menu', 'Enter otevře nastavení, režim zůstává menu');

    const info = await page.evaluate(() => ({
      tabs: [...document.querySelectorAll('.sh-tab')].map((t) => t.textContent),
      rows: [...document.querySelectorAll('.sh-row')].map((r) => r.dataset.setting),
      declared: __game.settings.defs.map((d) => d.id),
      pages: __game.settings.pages,
    }));
    ok(info.tabs.join() === 'Hra,Obraz,Zvuk', 'záložky odpovídají deklarovaným stránkám', info.tabs.join());
    ok(info.rows.join() === 'speed', 'první stránka ukazuje své položky', info.rows.join());

    // každá deklarovaná položka je na některé stránce vidět a naopak
    const seen = [];
    for (let i = 0; i < info.tabs.length; i++) {
      await page.locator('.sh-tab').nth(i).click();
      seen.push(...(await page.evaluate(() => [...document.querySelectorAll('.sh-row')].map((r) => r.dataset.setting))));
    }
    const visibleDeclared = await page.evaluate(() => __game.settings.defs.filter((d) => __game.settings.visible(d)).map((d) => d.id));
    ok(seen.sort().join() === [...visibleDeclared].sort().join(), 'v nastavení je právě to, co hra deklaruje', seen.join());

    // ovládání klávesnicí: řádky nahoru a dolů, volby vlevo a vpravo
    await page.locator('.sh-tab').nth(0).click();
    await page.keyboard.press('ArrowDown');
    const onRow = await page.evaluate(() => document.activeElement?.closest('.sh-row')?.dataset.setting);
    ok(onRow === 'speed', 'šipka dolů ze záložek skočí na řádek', String(onRow));
    ok(await page.evaluate(() => document.activeElement?.getAttribute('aria-pressed') === 'true'), 'fokus padne na právě zvolenou možnost');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    ok((await page.evaluate(() => __game.settings.get('speed'))) === 1.25, 'šipka vpravo a Enter zvolí další možnost', '125 %');
    ok((await page.evaluate(() => __game.get('engine.timeScale'))) === 1.25, 'a rychlost hry se v enginu opravdu změnila');
    ok((await page.textContent('.sh-status')) === 'Uloženo', 'po změně se ukáže „Uloženo“');

    // posuvník klávesnicí
    await page.locator('.sh-tab').nth(2).click();
    await page.locator('.sh-range').focus();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    ok((await page.evaluate(() => __game.settings.get('volume'))) === 50, 'šipka vlevo na posuvníku ubírá po kroku', '60 → 50 %');
    ok((await page.textContent('.sh-value')) === '50 %', 'popisek hodnoty se aktualizuje');
    await page.locator('.sh-opt', { hasText: 'Přehrát' }).click();
    ok(await page.evaluate(() => __game.audioReady()), 'tlačítko „Test zvuku“ spustí zvuk');

    // Esc: o úroveň zpět, fokus se vrátí na „Nastavení“
    await wait(350);
    await page.keyboard.press('Escape');
    ok((await screen(page)) === 'menu', 'Esc v nastavení = zpět do menu');
    ok(await page.evaluate(() => document.activeElement?.dataset?.id === 'settings'), 'fokus se vrátí na položku „Nastavení“');
    ok(errs.length === 0, 'bez chyb', errs.join(' | '));
    await ctx.close();
  }

  // ---------- test proti slepým prvkům na skutečné hře ----------
  console.log('Test proti slepým prvkům (apply/probe)');
  {
    const { ctx, page, errs } = await open(browser);
    const report = await page.evaluate(async () => {
      const S = __game.settings;
      const out = [];
      for (const d of S.defs) {
        if (d.type === 'action') continue;
        if (!S.visible(d)) {
          out.push({ id: d.id, skipped: 'podmínka when není splněna' });
          continue;
        }
        const other = d.type === 'range' ? (d.def === d.max ? d.min : d.max) : d.type === 'select' ? d.options.find((o) => o.value !== d.def).value : !d.def;
        const applied = await S.set(d.id, other);
        if (applied === false) {
          out.push({ id: d.id, skipped: 'prostředí změnu odmítlo' });
          continue;
        }
        await new Promise((r) => setTimeout(r, 50));
        const p = S.probeAll().find((x) => x.id === d.id);
        out.push({ id: d.id, want: other, probe: p.probe, ok: p.ok && p.value === other });
      }
      return out;
    });
    for (const r of report) {
      if (r.skipped) skip(`položka „${r.id}“`, r.skipped);
      else ok(r.ok, `položka „${r.id}“ má skutečný účinek`, `chtěno ${r.want}, engine hlásí ${r.probe}`);
    }
    ok(report.filter((r) => !r.skipped).length >= 3, 'ověřeny aspoň tři položky');

    // měřítko vykreslení se pozná i na plátně
    const px = await page.evaluate(async () => {
      const S = __game.settings;
      await S.set('fullscreen', false);
      S.set('renderScale', 100);
      const full = document.getElementById('view').width;
      S.set('renderScale', 50);
      const half = document.getElementById('view').width;
      return { full, half, pixelated: getComputedStyle(document.getElementById('view')).imageRendering };
    });
    ok(Math.abs(px.half / px.full - 0.5) < 0.02 && px.pixelated === 'pixelated', 'měřítko 50 % dá poloviční počet bodů plátna', `${px.full} → ${px.half}`);

    // rychlost hry × vývojářské měřítko času = jedna hodnota
    const ts = await page.evaluate(() => {
      __game.settings.set('speed', 0.5);
      __game.setTimeScale(2);
      const a = __game.get('engine.timeScale');
      const probeOk = __game.settings.probeAll().find((p) => p.id === 'speed').ok;
      __game.setTimeScale(1);
      return { a, probeOk };
    });
    ok(ts.a === 1 && ts.probeOk, 'rychlost hry a vývojářské měřítko se násobí, probe dál sedí', `0,5 × 2 = ${ts.a}`);
    ok(errs.length === 0, 'bez chyb', errs.join(' | '));
    await ctx.close();
  }

  // ---------- uložení a obnova ----------
  console.log('Uložení a obnova');
  {
    const { ctx, page, errs } = await open(browser);
    await page.evaluate(() => {
      const S = __game.settings;
      S.set('speed', 1.5);
      S.set('volume', 20);
      S.set('renderScale', 50);
    });
    await page.reload();
    await page.waitForFunction(() => window.__game && __game.mode() === 'menu');
    const after = await page.evaluate(() => ({
      v: ['speed', 'volume', 'renderScale'].map((id) => __game.settings.get(id)),
      probes: __game.settings.probeAll().every((p) => p.ok),
      ts: __game.get('engine.timeScale'),
    }));
    ok(after.v.join() === '1.5,20,50', 'po znovunačtení stránky hodnoty zůstaly', after.v.join());
    ok(after.probes && after.ts === 1.5, 'a jsou hned po startu použité v enginu');

    // obnovit výchozí tlačítkem
    await page.click('[data-id="settings"]');
    await page.click('[data-id="defaults"]');
    const def = await page.evaluate(() => ({
      v: ['speed', 'volume', 'renderScale'].map((id) => __game.settings.get(id)),
      probes: __game.settings.probeAll().every((p) => p.ok),
      pressed: document.querySelector('.sh-opt[aria-pressed="true"]')?.textContent,
    }));
    ok(def.v.join() === '1,60,100' && def.probes, '„Obnovit výchozí“ vrátí hodnoty i stav enginu', def.v.join());
    ok(def.pressed === '100 %', 'ovládací prvky se po obnovení překreslí', String(def.pressed));
    await page.reload();
    await page.waitForFunction(() => window.__game && __game.mode() === 'menu');
    ok((await page.evaluate(() => __game.settings.get('volume'))) === 60, 'výchozí hodnoty přežijí znovunačtení');
    ok(errs.length === 0, 'bez chyb', errs.join(' | '));
    await ctx.close();
  }

  // ---------- nedostupné a poškozené úložiště ----------
  console.log('Úložiště nedostupné nebo poškozené');
  {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    await ctx.addInitScript(() => {
      Storage.prototype.setItem = function () {
        throw new DOMException('zakázáno', 'SecurityError');
      };
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto('file://' + require('node:path').join(require('./h.cjs').ROOT, 'dist/arkada.html'));
    await page.waitForFunction(() => window.__game && __game.mode() === 'menu');
    await page.click('[data-id="settings"]');
    const status = await page.textContent('.sh-status');
    ok(/neuchová/.test(status), 'bez úložiště to Shell řekne hned při otevření nastavení', status);
    await page.locator('.sh-opt', { hasText: '150 %' }).click();
    ok((await page.evaluate(() => __game.get('engine.timeScale'))) === 1.5, 'nastavení přesto funguje do zavření stránky');
    ok(/neuchová/.test(await page.textContent('.sh-status')), 'a místo „Uloženo“ zůstává upozornění');
    ok(errs.length === 0, 'bez pádu', errs.join(' | '));
    await ctx.close();

    const ctx2 = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    await ctx2.addInitScript(() => {
      try {
        localStorage.setItem('arkada.settings', '{"format":1,"values":{"volume":5000,"speed":"rychle","neco":1}');
      } catch {
        /* nic */
      }
    });
    const page2 = await ctx2.newPage();
    const errs2 = [];
    page2.on('pageerror', (e) => errs2.push(e.message));
    await page2.goto('file://' + require('node:path').join(require('./h.cjs').ROOT, 'dist/arkada.html'));
    await page2.waitForFunction(() => window.__game && __game.mode() === 'menu');
    ok((await page2.evaluate(() => __game.settings.get('volume'))) === 60 && errs2.length === 0, 'poškozený záznam: hra nastartuje s výchozími hodnotami');
    await ctx2.close();
  }

  // ---------- nastavení z pauzy, Esc po úrovních ----------
  console.log('Nastavení z pauzy');
  {
    const { ctx, page, errs } = await open(browser);
    await page.evaluate(() => __game.start());
    await wait(100);
    await page.keyboard.press('Escape');
    await page.click('.sh-paused [data-id="settings"]');
    ok((await screen(page)) === 'settings' && (await mode(page)) === 'paused', 'nastavení jde otevřít z pauzy');
    const before = await page.evaluate(() => __game.hash());
    await page.locator('.sh-opt', { hasText: '50 %' }).first().click();
    await wait(300);
    ok((await page.evaluate(() => __game.hash())) === before, 'změna nastavení v pauze hru nerozběhne');
    await wait(100);
    await page.keyboard.press('Escape');
    ok((await screen(page)) === 'paused' && (await mode(page)) === 'paused', 'první Esc: zpět do pauzy, ne do hry');
    await wait(350);
    await page.keyboard.press('Escape');
    ok((await mode(page)) === 'playing', 'druhý Esc: zpět do hry');
    await wait(400);
    const steps = await page.evaluate(() => __game.stats().steps);
    ok(steps > 3 && steps < 60, 'hra běží zvolenou poloviční rychlostí', `kroků ${steps}`);
    ok(errs.length === 0, 'bez chyb', errs.join(' | '));
    await ctx.close();
  }

  // ---------- deklarované schopnosti ----------
  console.log('Deklarované schopnosti');
  {
    const { ctx, page } = await open(browser);
    const r = await page.evaluate(() => {
      const root = document.createElement('div');
      document.body.append(root);
      let m = 'menu';
      const bare = { meta: { id: 'bez', title: 'Bez nastavení', version: 'x', tone: 'hard' }, state: { mode: () => m, onMode() {} }, game: { newGame() {}, pause() {}, resume() {}, quit() {} } };
      const shell = __game.mountShell(bare, { root });
      const out = { settingsBtn: root.querySelectorAll('[data-id="settings"]').length, settingsScreen: root.querySelectorAll('.sh-settings').length, rotate: !root.querySelector('.sh-rotate').hidden, api: shell.settings };
      shell.destroy();
      root.remove();
      let threw = false;
      try {
        __game.mountShell({ ...bare, settings: [{ id: 'x', page: 'hra', label: 'Na oko', type: 'toggle', def: false, apply() {} }] }, { root: document.createElement('div') });
      } catch {
        threw = true;
      }
      return { ...out, threw };
    });
    ok(r.settingsBtn === 0 && r.settingsScreen === 0 && r.api === null, 'hra bez deklarovaných nastavení nemá tlačítko ani obrazovku');
    ok(r.threw, 'hra s položkou bez probe() se k Shellu vůbec nepřipojí');
    await ctx.close();
  }

  // ---------- otočení telefonu ----------
  console.log('Výzva k otočení');
  {
    const { ctx, page, errs } = await open(browser, { context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } });
    ok(await page.locator('.sh-rotate').isVisible(), 'telefon na výšku: výzva k otočení je vidět');
    await shot(page, 't4_otoceni_390x844.png');
    await page.evaluate(() => __game.start());
    await wait(100);
    ok((await mode(page)) === 'paused', 'hra spuštěná na výšku se hned zapauzuje');
    await page.setViewportSize({ width: 844, height: 390 });
    await wait(150);
    ok(await page.locator('.sh-rotate').isHidden(), 'po otočení na šířku výzva zmizí');
    ok((await mode(page)) === 'paused', 'hra čeká v pauze, nerozběhne se sama');
    await page.tap('.sh-paused [data-id="resume"]');
    await wait(150);
    await page.setViewportSize({ width: 390, height: 844 });
    await wait(150);
    ok((await mode(page)) === 'paused' && (await page.locator('.sh-rotate').isVisible()), 'otočení na výšku během hry = pauza a výzva');

    // nastavení na telefonu na šířku: vše se vejde
    await page.setViewportSize({ width: 844, height: 390 });
    await wait(150);
    await page.tap('.sh-paused [data-id="settings"]');
    for (let i = 0; i < 3; i++) {
      await page.locator('.sh-tab').nth(i).tap();
      const fit = await page.evaluate(() => {
        const f = document.querySelector('.sh-footer').getBoundingClientRect();
        const rows = [...document.querySelectorAll('.sh-row')].map((r) => r.getBoundingClientRect());
        const small = [...document.querySelectorAll('.sh-settings [data-nav]')].map((e) => e.getBoundingClientRect()).filter((b) => b.height < 43.5).length;
        return { footer: f.bottom <= innerHeight + 0.5, rows: rows.every((b) => b.left >= 0 && b.right <= innerWidth + 0.5), small };
      });
      ok(fit.footer && fit.rows && fit.small === 0, `telefon na šířku, stránka ${i + 1}: vše se vejde, cíle dotyku ≥ 44 px`, JSON.stringify(fit));
    }
    await shot(page, 't4_nastaveni_telefon_844x390.png');
    ok(errs.length === 0, 'bez chyb', errs.join(' | '));
    await ctx.close();

    const desk = await open(browser, { context: { viewport: { width: 360, height: 640 } } });
    ok(await desk.page.locator('.sh-rotate').isHidden(), 'úzké okno na počítači výzvu neukazuje');
    await desk.ctx.close();
  }

  // ---------- snímky ----------
  for (const [w, h] of [
    [1366, 768],
    [1920, 1080],
  ]) {
    const { ctx, page } = await open(browser, { context: { viewport: { width: w, height: h } } });
    await page.click('[data-id="settings"]');
    await page.locator('.sh-tab').nth(1).click();
    await shot(page, `t4_nastaveni_obraz_${w}x${h}.png`);
    await page.locator('.sh-tab').nth(0).click();
    const tops = await page.evaluate(() => [...document.querySelectorAll('.sh-row .sh-opt')].map((b) => Math.round(b.getBoundingClientRect().top)));
    ok(new Set(tops).size === 1, `${w}×${h}: volby rychlosti jsou v jednom řádku`, tops.join());
    await shot(page, `t4_nastaveni_hra_${w}x${h}.png`);
    await ctx.close();
  }

  await browser.close();
  console.log(`\nT4 nastavení v prohlížeči: ${results.pass} prošlo, ${results.fail} selhalo, ${results.skipped} přeskočeno`);
  process.exit(results.fail ? 1 : 0);
})().catch((e) => {
  console.error('PÁD TESTU', e);
  process.exit(2);
});
