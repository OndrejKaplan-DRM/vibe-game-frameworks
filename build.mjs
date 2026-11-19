// Build: src/ → jeden samostatný HTML soubor v dist/. Žádné CDN.
// Použití: node build.mjs [hra]   (výchozí hra: arkada)

import { build, transform } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const game = process.argv[2] || 'arkada';
const dir = path.join(root, 'src', 'games', game);

const bundle = await build({
  entryPoints: [path.join(dir, 'main.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2020',
  write: false,
  logLevel: 'warning',
});
const js = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

const cssSource = (await readFile(path.join(root, 'src', 'shell', 'shell.css'), 'utf8')) + '\n' + (await readFile(path.join(dir, 'app.css'), 'utf8'));
const css = (await transform(cssSource, { loader: 'css', minify: true })).code;

const template = await readFile(path.join(dir, 'index.html'), 'utf8');
// nahrazení funkcí: řetězec by interpretoval znaky $& v kódu
const html = template.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js);

await mkdir(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', `${game}.html`);
await writeFile(out, html);
console.log(`${path.relative(root, out)}  ${(html.length / 1024).toFixed(1)} kB  (js ${(js.length / 1024).toFixed(1)} kB, css ${(css.length / 1024).toFixed(1)} kB)`);
