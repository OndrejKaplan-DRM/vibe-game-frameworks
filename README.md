# vibe-game-frameworks

Frameworky a opakovaně použitelný herní Shell pro vibe-coding her v prohlížeči i v enginu.

| Složka | Obsah |
|---|---|
| [`frameworks/`](frameworks/README.md) | sada Level 1: audit výchozí konverzace, společné jádro, specifikace Shellu, casy podle žánru |
| `src/core/` | jádro: registr systémů, sběrnice událostí, smyčka s pevným krokem, režimy |
| `src/shell/` | Shell jako knihovna (staví se po krocích S0–S4) |
| `src/games/` | hry postavené nad jádrem a Shellem; první je arkáda z casu 40 |
| `test/` | testy logiky (Node) a Shellu v prohlížeči (Playwright) |
| `docs/` | karta projektu, požadavky, rozhodnutí, stav |

Začni souborem [`frameworks/README.md`](frameworks/README.md).

## Spuštění

~~~text
npm install            esbuild pro build
node build.mjs         sestaví dist/arkada.html (jeden soubor, jde otevřít dvojklikem)
node test/t1_logika.mjs   testy logiky v Node
node test/t2_shell.cjs    testy Shellu v prohlížeči (Playwright; cesta přes PLAYWRIGHT_PATH)
~~~

Vývojářský režim: `dist/arkada.html?dev`. Jiný seed: `?seed=7`.

Stav a další krok: [`docs/STATE.md`](docs/STATE.md). Požadavky: [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md). Co se ve frameworcích změnilo po prvním použití: [`frameworks/ZMENY.md`](frameworks/ZMENY.md).

Větve: `main` je stabilní stav, `dev` rozpracovaná iterace.
