# vibe-game-frameworks

Frameworky a opakovaně použitelný herní Shell pro vibe-coding her v prohlížeči i v enginu.

| Složka | Obsah |
|---|---|
| [`frameworks/`](frameworks/README.md) | sada Level 1: audit výchozí konverzace, společné jádro, specifikace Shellu, casy podle žánru |
| `src/core/` | jádro: registr systémů, sběrnice událostí, smyčka s pevným krokem, režimy |
| `src/shell/` | Shell jako knihovna (kroky S0 a S1). **Od 22. 11. 2026 má Shell domov v repu xEngine**, viz níže; tady zůstává kopie pro hry tohoto repa |
| `src/games/` | hry postavené nad jádrem a Shellem; první je arkáda z casu 40 |
| `test/` | testy logiky (Node) a Shellu v prohlížeči (Playwright) |
| `docs/` | karta projektu, požadavky, rozhodnutí, stav |

Začni souborem [`frameworks/README.md`](frameworks/README.md).

## Shell má domov v xEngine

Od 22. 11. 2026 se Shell vyvíjí v repu [`OndrejKaplan-DRM/xEngine`](https://github.com/OndrejKaplan-DRM/xEngine), složka `src/shell` (rozhodl Ondřej; v xEngine zapsáno jako rozhodnutí D-006). Převzat byl odtud z větve `dev`, commit `ab8557a`.

- **Změny Shellu se dělají v xEngine**, ne tady. Kopie v `src/shell/` zůstává, protože ji používá arkáda a další hry tohoto repa; nové funkce do ní nepřibývají.
- V xEngine běží zkouška nastavení (`test/t4_shell_nastaveni.mjs`, převzatá z `test/t3_nastaveni.mjs`). Zkoušky Shellu v prohlížeči (`t2_shell`, `t4_nastaveni_ui`) a zkouška katalogu (`t5_katalog`) zatím přenesené nejsou a žijí jen tady.
- Specifikace [`frameworks/02_SHELL_Specifikace.md`](frameworks/02_SHELL_Specifikace.md) zůstává zatím tady; kde bude žít, rozhodne svodná sešna xEngine.

## Spuštění

~~~text
npm install            esbuild pro build
node build.mjs         sestaví dist/arkada.html (jeden soubor, jde otevřít dvojklikem)
npm test               build a všechny čtyři sady testů
                       t1 logika hry a jádra (Node), t3 nastavení a úložiště (Node),
                       t2 Shell a t4 nastavení v prohlížeči (Playwright; cesta přes PLAYWRIGHT_PATH)
~~~

Vývojářský režim: `dist/arkada.html?dev`. Jiný seed: `?seed=7`.

Stav a další krok: [`docs/STATE.md`](docs/STATE.md). Požadavky: [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md). Co se ve frameworcích změnilo po prvním použití: [`frameworks/ZMENY.md`](frameworks/ZMENY.md).

Větve: `main` je stabilní stav, `dev` rozpracovaná iterace.
