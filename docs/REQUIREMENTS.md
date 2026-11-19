# Požadavky

Stavy: nový → plánovaný → hotový | odložený | zamítnutý. Zdroj = odkud požadavek pochází.

| ID | Požadavek | Zdroj | Stav | Kde / kdy | Test |
|---|---|---|---|---|---|
| R-001 | Hluboké menu jako opakovaně použitelný rámec, ne znovu vymýšlené s každou hrou | původní zadání | rozpracováno | Shell S0 hotov, S1–S4 plán | t2 |
| R-002 | Ovládání v menu: přehled a přemapování | původní zadání | plánovaný | S2 | – |
| R-003 | Nastavení obtížnosti | původní zadání | plánovaný | S1 + hra M2 | – |
| R-004 | Hloubka detailů a rozlišení (měřítko vykreslení) | původní zadání | plánovaný | S1 | – |
| R-005 | Nastavení zvuku a hudby | původní zadání | plánovaný | S2 | – |
| R-006 | Vývojářský mód: hitboxy, pomůcky, vypínání shaderů, zpomalení a zrychlení, obrysový režim, systémové proměnné | původní zadání | rozpracováno | boxy a přehled přes `?dev` v arkádě; plná sada S4 | t2 |
| R-007 | Uložení změn nastavení | původní zadání | plánovaný | S1 | – |
| R-008 | Uložení a nahrání rozehrané hry s náhledem, popisem, datem a časem | původní zadání | plánovaný | S3 (stav hry už jde uložit a obnovit přes `snapshot/restore`) | t1, t2 |
| R-009 | Písmo menu: bezpatkové, podobné Calibri nebo Arial Narrow | původní zadání | rozpracováno | řada písem v CSS; přibalené písmo S4 | – |
| R-010 | Bestiář podle charakteru hry (realistický nebo dětský) | původní zadání | plánovaný | S4 | – |
| R-011 | Pozadí menu = živý záběr hry před startem | původní zadání | rozpracováno | zatím nehybný záběr výchozího stavu; živý (attract) S4 | – |
| R-012 | Velký stylizovaný název hry nad menu | původní zadání | hotový (základ) | S0, styl podle tónu | t2 |
| R-013 | Položky jdou skrýt nebo vypustit bez rozbití zbytku | původní zadání | hotový (princip) | Shell vykreslí jen to, co hra deklaruje | t2 |
| R-014 | Rozcestník podle charakteru projektu | původní zadání | rozpracováno | tón (`hard`/`retro`/`kid`) hotov základně; žánr nahrazen adaptérem | – |
| R-015 | Varianta bez enginu i s enginem | zadání casů | hotový (dokumenty) | `frameworks/`; kód zatím jen web | – |
| R-016 | Repo s instrukcemi a casy | zadání casů | hotový | větev `main` | – |
| R-017 | Shell S0 a arkáda M1 jako první ověření frameworků | 19. 11. 2026 | hotový, čeká na vyzkoušení | větev `dev`, v0.1 | t1, t2 |
| R-018 | Telefon na výšku: herní plocha 16:9 je jen úzký pruh | nález z testu 19. 11. 2026 | nový | rozhodnout: výzva k otočení, nebo užší výřez světa | – |
| R-019 | I pouhé ťuknutí musí přeskočit bednu | nález z testu 19. 11. 2026 | hotový | minimální výška skoku 1,0 m | t1 |
| R-020 | Rozhraní pro předčtenáře (ikony, hlas, bez textu) | case 40, A10 | plánovaný | M4 | – |
