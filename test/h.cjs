// Společný základ testů v prohlížeči (Playwright, bez sítě, bez grafické karty).
// Playwright se bere z projektu, jinak z globální instalace (PLAYWRIGHT_PATH nebo /opt/npm-tools).

const fs = require('node:fs');
const path = require('node:path');

function loadPlaywright() {
  const candidates = ['playwright', process.env.PLAYWRIGHT_PATH, '/opt/npm-tools/node_modules/playwright'].filter(Boolean);
  for (const c of candidates) {
    try {
      return require(c);
    } catch {
      /* další kandidát */
    }
  }
  throw new Error('Playwright nenalezen. Nastav PLAYWRIGHT_PATH nebo spusť npm i -D playwright.');
}

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'out');
const results = { pass: 0, fail: 0, skipped: 0 };

function ok(cond, name, detail = '') {
  if (cond) results.pass++;
  else results.fail++;
  console.log(`${cond ? '  ok  ' : 'CHYBA '} ${name}${detail ? '  [' + detail + ']' : ''}`);
}
function skip(name, why) {
  results.skipped++;
  console.log(`PŘESKOČENO ${name}  [${why}]`);
}

async function launch() {
  const { chromium } = loadPlaywright();
  const args = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'];
  try {
    return await chromium.launch({ args });
  } catch {
    const exe = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => fs.existsSync(p));
    if (!exe) throw new Error('Nenalezen žádný prohlížeč Chromium.');
    return chromium.launch({ args, executablePath: exe });
  }
}

/** Otevře sestavenou hru. context: volby newContext (viewport, hasTouch, …), q: řetězec dotazu. */
async function open(browser, { file = 'dist/arkada.html', q = '', context = {} } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, ...context });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) errs.push(`${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file:') ? r.continue() : r.abort()));
  await page.goto('file://' + path.join(ROOT, file) + q);
  await page.waitForFunction(() => window.__game && window.__game.mode() === 'menu', null, { timeout: 30000 });
  return { ctx, page, errs };
}

async function shot(page, name) {
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, timeout: 60000 });
  return file;
}

module.exports = { launch, open, ok, skip, shot, results, ROOT, OUT };
