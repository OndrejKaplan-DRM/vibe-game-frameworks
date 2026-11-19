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

Větve: `main` je stabilní stav, `dev` rozpracovaná iterace.
