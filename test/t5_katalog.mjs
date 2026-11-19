// T5 — katalog nabídek pro arkádu: celistvost dat, spojení se hrou, převod na deklarace Shellu.

import { ARCADE_CATALOG } from '../src/shell/catalog/arcade.js';
import { validateCatalog, bindCatalog, visibleItems, toSettingsDefs } from '../src/shell/catalog/bind.js';
import { ARKADA_WIRED, ARKADA_NA } from '../src/games/arkada/catalog-map.js';
import { createSettingsDefs } from '../src/games/arkada/settings.js';
import { createSettings } from '../src/shell/settings.js';
import { createStore } from '../src/core/store.js';

let pass = 0;
let fail = 0;
function ok(cond, name, detail = '') {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? '  ok  ' : 'CHYBA '} ${name}${detail ? '  [' + detail + ']' : ''}`);
}
const throws = (fn, part = '') => {
  try {
    fn();
    return false;
  } catch (e) {
    return String(e.message).includes(part);
  }
};
const C = ARCADE_CATALOG;
const item = (id) => C.items.find((it) => it.id === id);
const clone = () => structuredClone(C);

console.log('— celistvost katalogu');
ok(validateCatalog(C).length === 0, 'katalog je bez chyb', validateCatalog(C).slice(0, 3).join(' | '));
ok(C.screens.every((s) => C.items.some((it) => it.screen === s.id)), 'žádná obrazovka není prázdná');
ok(C.screens.every((s) => C.items.some((it) => it.screen === s.id && it.tier !== 'C') || ['set.svet', 'collection'].includes(s.id)), 'jen Svět a Průvodce jsou čistá nadstavba');
{
  const perScreen = C.screens.map((s) => [s.id, C.items.filter((it) => it.screen === s.id && it.kind !== 'info' && it.tier === 'A').length]);
  const worst = perScreen.sort((a, b) => b[1] - a[1])[0];
  ok(worst[1] <= 7, 'základ (A) má na žádné obrazovce víc než 7 ovládacích prvků', `${worst[0]}: ${worst[1]}`);
}
ok(C.items.filter((it) => it.danger).every((it) => it.kind === 'action'), 'ničivé jsou jen akce');
ok(['pause.restart', 'pause.toMenu', 'set.reset', 'set.clearRecords'].every((id) => item(id).danger), 'restart, odchod do menu a mazání chtějí potvrzení');
ok(item('sys.confirm').tier === 'A', 'potvrzovací okno patří do základu');
ok(C.items.filter((it) => it.screen === 'dev').every((it) => it.dev), 'vše na obrazovce Vývojář je jen pro ?dev');
ok(C.items.filter((it) => it.kind === 'setting' && it.dev).every((it) => it.persist === false), 'vývojářské volby se neukládají');

console.log('— kontrola odhalí chyby');
{
  const c = clone();
  c.items.push({ ...c.items[0] });
  ok(validateCatalog(c).some((e) => e.includes('dvakrát')), 'dvojí id');
}
{
  const c = clone();
  delete c.items.find((it) => it.id === 'set.shake').scope;
  ok(validateCatalog(c).some((e) => e.includes('scope')), 'volba bez údaje, kdy se projeví');
}
{
  const c = clone();
  c.items.find((it) => it.id === 'set.vol.master').def = 140;
  ok(validateCatalog(c).some((e) => e.includes('mimo meze')), 'výchozí hodnota mimo meze');
}
{
  const c = clone();
  c.items.find((it) => it.id === 'dev.invulnerable').persist = true;
  ok(validateCatalog(c).some((e) => e.includes('nesmí ukládat')), 'vývojářská volba, která by se ukládala');
}
{
  const c = clone();
  c.items.find((it) => it.id === 'title.play').screen = 'nikde';
  ok(validateCatalog(c).some((e) => e.includes('neznámá obrazovka')), 'položka na neexistující obrazovce');
}

console.log('— spojení se hrou');
{
  const b = bindCatalog(C, {});
  ok(b.report.wired === 0 && b.report.unwired === C.items.length, 'bez vazeb není zapojeno nic');
  ok(visibleItems(b).length === 0, 'bez vazeb hráč nevidí nic');
  ok(b.report.missingRequired.length === C.items.filter((it) => it.tier === 'A').length, 'zpráva vyjmenuje celý chybějící základ');
}
ok(throws(() => bindCatalog(C, { 'set.neexistuje': true }), 'neznámou položku'), 'vazba na neznámou položku je chyba');
ok(throws(() => bindCatalog(C, { 'set.vol.master': { apply() {} } }), 'probe'), 'volba bez probe je chyba');
ok(throws(() => bindCatalog(C, { 'set.vol.master': { probe: () => 1 } }), 'apply'), 'volba bez apply je chyba');
ok(throws(() => bindCatalog(C, { 'title.play': {} }), 'run'), 'akce bez run je chyba');
ok(throws(() => bindCatalog(C, { 'set.shake': { apply() {}, probe: () => true } }), 'výchozí'), 'volba bez výchozí hodnoty je chyba');
ok(throws(() => bindCatalog(C, { 'set.difficulty': { def: 'a', apply() {}, probe: () => 'a' } }), 'dvě možnosti'), 'výběr bez možností je chyba');
ok(throws(() => bindCatalog(C, { 'title.quit': { na: '' } }), 'důvod'), '„nemám“ bez důvodu je chyba');
{
  let vol = 80;
  let shake = true;
  const b = bindCatalog(C, {
    'title.play': { run() {} },
    'title.dev': { run() {} },
    'title.version': true,
    'title.quit': { na: 'běží v prohlížeči' },
    'set.vol.master': { apply: (v) => (vol = v), probe: () => vol },
    'set.shake': { def: true, apply: (v) => (shake = v), probe: () => shake },
    'dev.invulnerable': { def: false, apply() {}, probe: () => false },
  });
  ok(b.report.wired === 6 && b.report.na === 1, 'zpráva počítá zapojené a vědomě vynechané', JSON.stringify([b.report.wired, b.report.na]));
  ok(b.report.wired + b.report.na + b.report.unwired === b.report.total, 'součet stavů sedí');
  ok(!b.report.missingRequired.includes('title.play') && b.report.missingRequired.includes('title.settings'), 'chybějící základ se zmenšuje jen o zapojené');
  const player = visibleItems(b).map((it) => it.id);
  ok(!player.includes('title.dev') && !player.includes('dev.invulnerable') && player.includes('title.play'), 'hráč nevidí vývojářské položky');
  ok(visibleItems(b, { dev: true }).length === 6, 've vývojářském režimu je vidět všech šest');
  ok(!player.includes('title.quit'), 'vědomě vynechaná položka se neukazuje');

  const defs = toSettingsDefs(b);
  ok(defs.length === 2 && defs.every((d) => d.apply && d.probe), 'převod dá jen zapojené volby hráče', defs.map((d) => d.id).join(','));
  ok(defs.find((d) => d.id === 'set.vol.master').page === 'zvuk', 'stránka se odvodí z obrazovky');
  const mem = new Map();
  const store = createStore('t5:', { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) });
  const settings = createSettings(defs, store);
  settings.set('set.vol.master', 35);
  ok(vol === 35, 'deklarace z katalogu fungují ve skutečném jádru nastavení', String(vol));
  const probes = settings.probeAll();
  ok(probes.every((p) => p.ok), 'apply a probe souhlasí u všech voleb z katalogu');
}

console.log('— arkáda v0.2 proti katalogu');
{
  const ids = new Set(C.items.map((it) => it.id));
  ok(Object.keys(ARKADA_WIRED).every((id) => ids.has(id)), 'mapa arkády míří jen na existující položky');
  ok(Object.keys(ARKADA_NA).every((id) => ids.has(id)), 'vynechané položky existují v katalogu');
  ok(Object.keys(ARKADA_WIRED).every((id) => !(id in ARKADA_NA)), 'položka není zároveň zapojená a vynechaná');
  const real = createSettingsDefs({ E: {}, audio: {}, renderer: {}, view: {}, time: {} });
  const mapped = new Set(Object.values(ARKADA_WIRED).filter(Boolean));
  ok(real.every((d) => mapped.has(d.id)), 'každá volba arkády má místo v katalogu', real.filter((d) => !mapped.has(d.id)).map((d) => d.id).join(','));
  ok([...mapped].every((id) => real.some((d) => d.id === id)), 'mapa neodkazuje na volbu, kterou arkáda nemá');
  for (const [cid, gid] of Object.entries(ARKADA_WIRED)) {
    if (!gid) continue;
    const c = item(cid);
    const g = real.find((d) => d.id === gid);
    const same = c.kind === 'action' ? g.type === 'action' : g.type === (c.type === 'segment' ? 'select' : c.type);
    ok(same, `${gid} → ${cid}: stejný druh prvku`, `${g.type} × ${c.type || c.kind}`);
    if (c.type === 'range') ok(g.min === c.min && g.max === c.max && g.step === c.step, `${gid} → ${cid}: stejné meze`);
    if (c.persist === false) ok(g.persist === false, `${gid} → ${cid}: neukládá se`);
  }
}

console.log(`\nT5 katalog: ${pass} prošlo, ${fail} selhalo`);
process.exit(fail ? 1 : 0);
