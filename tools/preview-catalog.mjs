// Náhled šablony nabídek: z katalogu udělá jednu stránku HTML, kde jde položky zaslepovat.
// Spuštění: node tools/preview-catalog.mjs  →  dist/sablona-menu-arkada.html

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ARCADE_CATALOG } from '../src/shell/catalog/arcade.js';
import { validateCatalog } from '../src/shell/catalog/bind.js';
import { ARKADA_WIRED, ARKADA_NA } from '../src/games/arkada/catalog-map.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = validateCatalog(ARCADE_CATALOG);
if (errors.length) throw new Error('Katalog má chyby: ' + errors.join('; '));

const data = {
  catalog: ARCADE_CATALOG,
  arkada: { wired: Object.keys(ARKADA_WIRED), na: ARKADA_NA },
  built: new Date().toISOString().slice(0, 10),
};

const css = `
:root{--bg:#12161c;--card:#1b222b;--line:#2c3643;--ink:#e8edf2;--dim:#9aa7b5;--acc:#f2b84b;--a:#7fd08a;--b:#6fb3ef;--c:#c79df2;--warn:#ef7d6f}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.4 Calibri,"Arial Narrow","Segoe UI",Arial,sans-serif}
header{position:sticky;top:0;z-index:5;background:#0e1217ee;border-bottom:1px solid var(--line);padding:12px 20px}
h1{font-size:22px;margin:0 0 2px}
.sub{color:var(--dim);font-size:14px}
.bar{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;margin-top:10px}
.grp{display:flex;gap:6px;align-items:center}
.grp>span{color:var(--dim);font-size:13px;margin-right:2px}
button.chip{font:inherit;font-size:14px;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px 12px;cursor:pointer}
button.chip[aria-pressed=true]{background:var(--acc);color:#1a1405;border-color:var(--acc);font-weight:700}
button.chip:focus-visible,.item:focus-visible{outline:2px solid #fff;outline-offset:2px}
#count{margin-left:auto;font-size:15px}
#count b{color:var(--acc);font-size:20px}
main{padding:18px 20px 60px;display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px;align-items:start}
h2.group{grid-column:1/-1;margin:14px 0 -4px;font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px}
.card h3{margin:0 0 2px;font-size:18px}
.card .note{color:var(--dim);font-size:13px;margin-bottom:6px}
.card .n{color:var(--dim);font-size:13px;font-weight:400;float:right}
.item{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:8px 6px;border-top:1px solid var(--line);cursor:pointer;border-radius:6px}
.item:hover{background:#ffffff0a}
.item .lab{font-weight:700}
.item .meta{grid-column:1/-1;color:var(--dim);font-size:13px}
.item .ctl{justify-self:end;color:var(--dim);font-size:13px;white-space:nowrap}
.tag{display:inline-block;font-size:11px;font-weight:700;border-radius:4px;padding:0 5px;margin-right:4px;vertical-align:1px;color:#10151a}
.tA{background:var(--a)}.tB{background:var(--b)}.tC{background:var(--c)}
.tD{background:#3a4553;color:var(--ink)}.tN{background:var(--acc)}.tW{background:var(--a)}.tX{background:#3a4553;color:var(--dim)}
.warn{color:var(--warn)}
.item.off{opacity:.33}
.item.off .lab{text-decoration:line-through}
.item.gone{display:none}
.card.empty{display:none}
.mock{display:inline-block;border:1px solid var(--line);border-radius:6px;padding:0 8px;background:#0f141a}
.mock.btn{border-color:var(--acc);color:var(--acc)}
footer{padding:0 20px 40px;color:var(--dim);font-size:14px}
textarea{width:100%;min-height:70px;background:#0f141a;color:var(--ink);border:1px solid var(--line);border-radius:8px;font:13px/1.4 ui-monospace,Consolas,monospace;padding:8px}
@media(max-width:640px){#count{margin-left:0;width:100%}main{padding:12px}}
`;

const js = `
const DATA = JSON.parse(document.getElementById('data').textContent);
const C = DATA.catalog, wired = new Set(DATA.arkada.wired), na = DATA.arkada.na;
const GROUPS = { start: 'Start', nastaveni: 'Nastavení', info: 'Informace', hra: 'Hra', dev: 'Vývojář' };
const state = { tiers: { A: true, B: true, C: true }, view: 'vse', origin: 'vse', off: new Set(), hide: false };
const CTL = { range: 'posuvník', select: 'výběr', segment: 'přepínač voleb', toggle: 'zap / vyp' };
const SCOPE = { hned: 'platí hned', beh: 'platí od dalšího běhu', restart: 'platí po novém načtení' };
const ORIGIN = { D: ['Dinoš', 'tD'], 'D*': ['Dinoš, jinak', 'tD'], N: ['nové', 'tN'] };
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

function passes(it) {
  if (!state.tiers[it.tier]) return false;
  if (state.view === 'hrac' && it.dev) return false;
  if (state.view === 'arkada' && !wired.has(it.id)) return false;
  if (state.origin === 'dinos' && it.dino === 'N') return false;
  if (state.origin === 'nove' && it.dino !== 'N') return false;
  return true;
}

function render() {
  const main = document.querySelector('main'); main.textContent = '';
  let shown = 0, lastGroup = '';
  for (const s of C.screens) {
    const items = C.items.filter((it) => it.screen === s.id);
    const vis = items.filter((it) => passes(it) && !(state.hide && state.off.has(it.id)));
    if (!vis.length) continue;
    if (s.group !== lastGroup) { main.append(el('h2', 'group', GROUPS[s.group])); lastGroup = s.group; }
    const card = el('section', 'card');
    const h = el('h3', '', s.title); h.append(el('span', 'n', vis.filter((it) => !state.off.has(it.id)).length + ' z ' + items.length)); card.append(h);
    if (s.note) card.append(el('div', 'note', s.note));
    for (const it of vis) {
      const row = el('div', 'item' + (state.off.has(it.id) ? ' off' : ''));
      row.tabIndex = 0; row.setAttribute('role', 'button'); row.setAttribute('aria-pressed', String(!state.off.has(it.id))); row.dataset.id = it.id;
      const lab = el('div', 'lab'); lab.append(el('span', 'tag t' + it.tier, it.tier));
      lab.append(document.createTextNode(it.label)); if (it.danger) lab.append(el('span', 'warn', '  ⚠ potvrzení'));
      const ctl = el('div', 'ctl');
      const mock = el('span', 'mock' + (it.kind === 'action' ? ' btn' : ''), it.kind === 'action' ? 'tlačítko' : it.kind === 'info' ? 'údaj' : CTL[it.type]); ctl.append(mock);
      const meta = el('div', 'meta');
      const o = ORIGIN[it.dino]; meta.append(el('span', 'tag ' + o[1], o[0]));
      if (wired.has(it.id)) meta.append(el('span', 'tag tW', 'arkáda v0.2 má'));
      else if (na[it.id]) meta.append(el('span', 'tag tX', 'arkáda nemá: ' + na[it.id]));
      if (it.dev) meta.append(el('span', 'tag tX', 'jen ?dev'));
      const bits = [];
      if (it.scope && !it.dev) bits.push(SCOPE[it.scope]);
      if (it.persist === false && it.kind === 'setting') bits.push('neukládá se');
      if (it.when) bits.push('jen když: ' + it.when);
      if (it.note) bits.push(it.note);
      meta.append(document.createTextNode(bits.join(' · ')));
      row.append(lab, ctl, meta);
      const flip = () => { state.off.has(it.id) ? state.off.delete(it.id) : state.off.add(it.id); render(); document.querySelector('[data-id="' + it.id + '"]')?.focus(); };
      row.addEventListener('click', flip);
      row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      card.append(row);
      if (!state.off.has(it.id)) shown++;
    }
    main.append(card);
  }
  document.querySelector('#count b').textContent = shown;
  document.querySelector('#total').textContent = C.items.length;
  document.querySelector('#offn').textContent = state.off.size;
  document.querySelector('#out').value = JSON.stringify({ katalog: C.id + ' v' + C.version, urovne: Object.keys(state.tiers).filter((t) => state.tiers[t]), zaslepeno: [...state.off].sort() });
  for (const b of document.querySelectorAll("button.chip[data-set]")) {
    const [k, v] = b.dataset.set.split(':');
    b.setAttribute('aria-pressed', String(k === 'tier' ? state.tiers[v] : k === 'hide' ? state.hide : state[k] === v));
  }
}
for (const b of document.querySelectorAll("button.chip[data-set]")) b.addEventListener('click', () => {
  const [k, v] = b.dataset.set.split(':');
  if (k === 'tier') state.tiers[v] = !state.tiers[v]; else if (k === 'hide') state.hide = !state.hide; else if (k === 'clear') state.off.clear(); else state[k] = v;
  render();
});
document.querySelector('#copy').addEventListener('click', async () => {
  const t = document.querySelector('#out'); t.select();
  try { await navigator.clipboard.writeText(t.value); document.querySelector('#copied').textContent = 'Zkopírováno.'; } catch { document.querySelector('#copied').textContent = 'Označeno – zkopíruj Ctrl+C.'; }
});
window.__catalogPreview = { state, render, passes };
render();
`;

const chip = (set, label, pressed = false) => `<button class="chip" data-set="${set}" aria-pressed="${pressed}">${label}</button>`;
const html = `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Šablona nabídek pro arkádu</title><style>${css}</style></head><body>
<header>
<h1>Šablona nabídek pro arkádu</h1>
<div class="sub">Katalog ${ARCADE_CATALOG.id} v${ARCADE_CATALOG.version} · vzor Dinoš 2.7 · sestaveno ${data.built} · kliknutím položku zaslepíš</div>
<div class="bar">
<div class="grp"><span>Úroveň</span>${chip('tier:A', 'A základ', true)}${chip('tier:B', 'B doporučené', true)}${chip('tier:C', 'C nadstavba', true)}</div>
<div class="grp"><span>Pohled</span>${chip('view:vse', 'celý katalog', true)}${chip('view:hrac', 'co vidí hráč')}${chip('view:arkada', 'co má arkáda v0.2')}</div>
<div class="grp"><span>Původ</span>${chip('origin:vse', 'vše', true)}${chip('origin:dinos', 'z Dinoše')}${chip('origin:nove', 'nové')}</div>
<div class="grp">${chip('hide:1', 'zaslepené schovat')}${chip('clear:1', 'vrátit vše')}</div>
<div id="count"><b>0</b> položek z <span id="total"></span> · zaslepeno <span id="offn">0</span></div>
</div>
</header>
<main></main>
<footer>
<p><b>Tvůj výběr.</b> Až budeš mít zaslepeno, co nechceš, zkopíruj tenhle řádek a pošli mi ho. Podle něj nastavím šablonu.</p>
<textarea id="out" readonly aria-label="Tvůj výběr"></textarea>
<p><button class="chip" id="copy">Zkopírovat výběr</button> <span id="copied" role="status"></span></p>
</footer>
<script type="application/json" id="data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script>${js}</script>
</body></html>`;

// Výpis katalogu do Markdownu (generovaný, aby dokument a data nemohly rozejít).
const TYPE = { range: 'posuvník', select: 'výběr', segment: 'přepínač voleb', toggle: 'zap / vyp' };
const ORIG = { D: 'Dinoš', 'D*': 'Dinoš, jinak', N: 'nové' };
const SCOPE = { hned: 'hned', beh: 'další běh', restart: 'po načtení' };
let md = `# Katalog nabídek pro arkádu – výpis\n\nGenerováno z \`src/shell/catalog/arcade.js\` (katalog ${ARCADE_CATALOG.id} v${ARCADE_CATALOG.version}) příkazem \`npm run preview:catalog\`. Neupravovat ručně.\n\nÚroveň: A základ, B doporučené, C nadstavba. Sloupec „Arkáda v0.2“: ano = hra položku má, text = proč ji nemá, prázdné = čeká.\n`;
for (const s of ARCADE_CATALOG.screens) {
  const items = ARCADE_CATALOG.items.filter((it) => it.screen === s.id);
  md += `\n## ${s.title}\n\n${s.note ? s.note + '\n\n' : ''}| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |\n|---|---|---|---|---|---|---|---|\n`;
  for (const it of items) {
    const prvek = it.kind === 'action' ? 'tlačítko' : it.kind === 'info' ? 'údaj' : TYPE[it.type];
    const note = [it.danger ? 'potvrzení' : '', it.dev ? 'jen ?dev' : '', it.persist === false && it.kind === 'setting' ? 'neukládá se' : '', it.when ? `jen když: ${it.when}` : '', it.note || ''].filter(Boolean).join('; ');
    const ark = it.id in ARKADA_WIRED ? 'ano' : ARKADA_NA[it.id] || '';
    md += `| \`${it.id}\` | ${it.label} | ${prvek} | ${it.tier} | ${ORIG[it.dino]} | ${it.scope ? SCOPE[it.scope] : ''} | ${ark} | ${note} |\n`;
  }
}
await writeFile(resolve(root, 'frameworks/41a_KATALOG_arkada_vypis.md'), md);

await mkdir(resolve(root, 'dist'), { recursive: true });
const dest = resolve(root, 'dist/sablona-menu-arkada.html');
await writeFile(dest, html);
console.log(`Náhled: ${dest} (${(html.length / 1024).toFixed(1)} kB, ${ARCADE_CATALOG.items.length} položek)`);
