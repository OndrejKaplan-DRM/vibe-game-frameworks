# Požadavky

Stavy: nový → plánovaný → hotový | odložený | zamítnutý. Zdroj = odkud požadavek pochází.

| ID | Požadavek | Zdroj | Stav | Kde / kdy | Test |
|---|---|---|---|---|---|
| R-001 | Hluboké menu jako opakovaně použitelný rámec, ne znovu vymýšlené s každou hrou | původní zadání | rozpracováno | Shell S0 a S1 hotovy, S2–S4 plán | t2, t3, t4 |
| R-002 | Ovládání v menu: přehled a přemapování | původní zadání | plánovaný | S2 | – |
| R-003 | Nastavení obtížnosti | původní zadání | plánovaný | arkáda M2 (Shell položku vykreslí, až ji hra deklaruje); zatím rychlost hry | – |
| R-004 | Hloubka detailů a rozlišení (měřítko vykreslení) | původní zadání | rozpracováno | měřítko vykreslení 50–150 % a celá obrazovka hotovy; hloubka detailů, až bude mít hra co ubírat | t4 |
| R-005 | Nastavení zvuku a hudby | původní zadání | rozpracováno | hlavní hlasitost a test zvuku hotovy; sběrnice hudba / efekty S2 | t4 |
| R-006 | Vývojářský mód: hitboxy, pomůcky, vypínání shaderů, zpomalení a zrychlení, obrysový režim, systémové proměnné | původní zadání | rozpracováno | boxy a přehled přes `?dev` v arkádě; plná sada S4 | t2 |
| R-007 | Uložení změn nastavení | původní zadání | hotový | S1: ukládá se samo s potvrzením „Uloženo“, „Obnovit výchozí“; bez úložiště upozornění | t3, t4 |
| R-008 | Uložení a nahrání rozehrané hry s náhledem, popisem, datem a časem | původní zadání | plánovaný | S3 (stav hry už jde uložit a obnovit přes `snapshot/restore`) | t1, t2 |
| R-009 | Písmo menu: bezpatkové, podobné Calibri nebo Arial Narrow | původní zadání | rozpracováno | řada písem v CSS; přibalené písmo S4 | – |
| R-010 | Bestiář podle charakteru hry (realistický nebo dětský) | původní zadání | plánovaný | S4 | – |
| R-011 | Pozadí menu = živý záběr hry před startem | původní zadání | rozpracováno | zatím nehybný záběr výchozího stavu; živý (attract) S4 | – |
| R-012 | Velký stylizovaný název hry nad menu | původní zadání | hotový (základ) | S0, styl podle tónu | t2 |
| R-013 | Položky jdou skrýt nebo vypustit bez rozbití zbytku | původní zadání | hotový (princip) | Shell vykreslí jen to, co hra deklaruje | t2 |
| R-014 | Rozcestník podle charakteru projektu | původní zadání | rozpracováno | tón (`hard`/`retro`/`kid`) hotov základně; žánr nahrazen adaptérem | – |
| R-015 | Varianta bez enginu i s enginem | zadání casů | hotový (dokumenty) | `frameworks/`; kód zatím jen web | – |
| R-016 | Repo s instrukcemi a casy | zadání casů | hotový | větev `main` | – |
| R-017 | Shell S0 a arkáda M1 jako první ověření frameworků | 19. 11. 2026 | hotový, vyzkoušeno a schváleno | `main`, v0.1 | t1, t2 |
| R-018 | Telefon na výšku: hra chce šířku a Shell si otočení vyžádá | nález z testu; rozhodnuto 19. 11. 2026 | hotový | S1: výzva k otočení na dotykovém zařízení, pauza | t4 |
| R-019 | I pouhé ťuknutí musí přeskočit bednu | nález z testu 19. 11. 2026 | hotový | minimální výška skoku 1,0 m | t1 |
| R-020 | Rozhraní pro předčtenáře (ikony, hlas, bez textu) | case 40, A10 | plánovaný | M4 | – |
| R-021 | Shell S1: nastavení z deklarací, test proti slepým prvkům | 19. 11. 2026 | hotový, čeká na vyzkoušení | větev `dev`, v0.2 | t3, t4 |
| R-022 | Ovládání nabídek klávesnicí (šipky, Enter, Esc o úroveň zpět) | 02_SHELL oddíl 9 | hotový | S0 + S1 | t2, t4 |
