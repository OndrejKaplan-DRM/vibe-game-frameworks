# Rozhodnutí

| # | Datum | Rozhodnutí | Zvažované možnosti | Proč | Jak vrátit |
|---|---|---|---|---|---|
| D-001 | 2026-11-19 | Jedno repo: `frameworks/` (dokumenty), `src/core`, `src/shell`, `src/games/<hra>` | zvláštní repo pro Shell | zatím jedna hra; Shell se ladí spolu s ní | vyčlenit `src/core` a `src/shell` do balíčku |
| D-002 | 2026-11-19 | Herní logika je modul bez DOM (`world.js`), testy logiky běží v Node | všechno testovat v prohlížeči | rychlost (34 testů pod 1 s), přesnost, žádná závislost na vykreslení | – |
| D-003 | 2026-11-19 | Adaptér rozšířen o `state: { mode(), onMode(fn) }` | Shell si režim drží sám | jedna pravda o režimu je v jádru; Shell jen poslouchá | – |
| D-004 | 2026-11-19 | Svislý pohyb se počítá přesně pro stálé zrychlení | běžná integrace | jinak skok nesedí s návrhem o ~5 % | změna jednoho řádku ve `world.js`, test T1 to pozná |
| D-005 | 2026-11-19 | Minimální výška skoku 1,0 m (plná 1,2 m) | bez minima; vypnout proměnnou výšku | ťuknutí na dotyku jinak bednu nepřeskočí; okno pro ťuknutí 24 kroků, pro držení 30 | `minJumpHeight` v `config.js` |
| D-006 | 2026-11-19 | Náraz do bedny v M1 je měkký: započítá se, hráč běží dál | konec hry | konec a nové kolo patří do M2; dětský tón prohru nechce | – |
| D-007 | 2026-11-19 | Rychlé uložení bude F7/F9, vývojářský režim přes `?dev` | F5/F9, Ctrl+Shift+D | F5 obnovuje stránku, Ctrl+Shift+D je zkratka prohlížeče | – |
| D-008 | 2026-11-19 | Větve: `main` stabilní, `dev` rozpracovaná iterace; sloučení po vyzkoušení | vše do `main` | možnost návratu | – |
| D-009 | 2026-11-19 | `dist/arkada.html` je v repu | sestavovat jen místně | hru jde otevřít rovnou z repa a později z GitHub Pages | odebrat z gitu, přidat do `.gitignore` |
