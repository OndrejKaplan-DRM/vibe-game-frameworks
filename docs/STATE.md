# Stav

**Verze:** v0.1 · M0 + Shell S0 + arkáda M1 · 2026-11-19 · větev `dev`

## Co funguje

- **Jádro** (`src/core`): registr systémů, sběrnice událostí, tabulka režimů, smyčka s pevným krokem 60 Hz, škálování přísunu času, `snapshot/restore`.
- **Shell S0** (`src/shell`): titul a verze z adaptéru, start, pauza, Esc s ochranou 300 ms, ovládání nabídky šipkami a Enterem, tlačítko pauzy pro dotyk, pauza při skryté kartě, tři tóny jako sady proměnných, `?dev`.
- **Arkáda M1** (`src/games/arkada`): skok navržený výškou a časem (1,2 m za 0,35 s), minimální skok 1,0 m, kojotí čas a paměť stisku 6 kroků, jedna bedna (jde přeskočit i na ni doskočit), jeden předmět ke sběru se zvukem, klávesnice (mezerník, šipka nahoru, W) i dotyk, viditelné boxy a přehled v `?dev`.
- **Build:** `node build.mjs` → `dist/arkada.html`, jeden soubor, 17,7 kB, bez sítě.

## Testy

| Sada | Kde běží | Výsledek |
|---|---|---|
| `test/t1_logika.mjs` | Node | 34 prošlo, 0 selhalo |
| `test/t2_shell.cjs` | Chromium bez grafické karty | 48 prošlo, 0 selhalo, 0 přeskočeno |

Pokryto z casu 40: T1 (skok), T2 (paměť stisku, kojotí čas), T4 (opakovatelnost se seedem), T7 (skrytá karta), T8 (tři rozlišení). Z jádra: režimy, škálování času, zásek, ulož → nahraj.
Kontrola, že testy umějí selhat: dvě záměrné chyby v kódu (integrace skoku, kojotí čas) testy odhalily.

## Měření

- Krok světa: 0,4 µs v Node, 0,004 ms v prohlížeči (rozpočet 2 ms).
- Snímky za sekundu ze sandboxu (kolem 30) nic neříkají o skutečném stroji; na zařízení zatím neměřeno.

## Známé nedostatky

- Telefon na výšku: herní plocha je úzký pruh (R-018, čeká na rozhodnutí).
- Zvuk nikdo neposlouchal; ověřeno jen, že se po prvním gestu odemkne.
- Dotyk ověřen emulací, ne na zařízení.
- Vývojářský přehled kreslí hra; do Shellu se přesune v S4.
- Menu ukazuje nehybný záběr světa, živé pozadí přijde s attract mode (S4).

## Další krok (návrh)

Jedna z cest, ne obě naráz:
- **Shell S1:** nastavení z deklarací s `apply/probe`, ukládání, obnovení výchozích. Hra k tomu deklaruje první položky (hlasitost, rychlost hry).
- **Arkáda M2:** vzory překážek, křivka obtížnosti, konec kola a rekord, robot v testu.
