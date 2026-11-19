# Stav

**Verze:** v0.2 · Shell S1 (nastavení) + arkáda M1 · 2026-11-19 · větev `dev`
**Na `main`:** v0.1 (M0 + Shell S0 + arkáda M1), vyzkoušeno a schváleno 19. 11. 2026.

## Co funguje

- **Jádro** (`src/core`): registr systémů, sběrnice událostí, tabulka režimů, smyčka s pevným krokem 60 Hz, škálování přísunu času, `snapshot/restore`, vrstva úložiště (localStorage se zálohou v paměti).
- **Shell S0:** titul a verze z adaptéru, start, pauza, Esc s ochranou 300 ms, tlačítko pauzy pro dotyk, pauza při skryté kartě, tři tóny, `?dev`.
- **Shell S1 (nové):**
  - nastavení se vykreslí sama z deklarací hry (stránky, řádky, typy posuvník / volby / přepínač / tlačítko),
  - každá položka má `apply` a `probe`; položka bez `probe` se nedá zaregistrovat,
  - změna platí hned a sama se uloží, „Obnovit výchozí“, upozornění, když úložiště není k dispozici,
  - ovládání klávesnicí po řádcích, Esc o úroveň zpět s návratem fokusu,
  - výzva k otočení na šířku na dotykovém zařízení, s pauzou.
- **Arkáda M1** deklaruje pět položek: rychlost hry, měřítko vykreslení, celou obrazovku, hlasitost a test zvuku. Obtížnost zatím ne (hra nemá co ztěžovat, viz D-014).
- **Build:** `dist/arkada.html`, jeden soubor, 30,2 kB.

## Testy

| Sada | Kde běží | Výsledek |
|---|---|---|
| `t1_logika.mjs` | Node | 34 prošlo, 0 selhalo |
| `t3_nastaveni.mjs` | Node | 46 prošlo, 0 selhalo |
| `t2_shell.cjs` | Chromium bez grafické karty | 48 prošlo, 0 selhalo, 0 přeskočeno |
| `t4_nastaveni_ui.cjs` | Chromium bez grafické karty | 55 prošlo, 0 selhalo, 0 přeskočeno |

Nové v této iteraci: test proti slepým prvkům na všech čtyřech položkách s hodnotou (včetně celé obrazovky), záměrně slepá položka testem neprojde, uložení a obnova po znovunačtení, poškozený záznam, zakázané a plné úložiště, nastavení z pauzy, výzva k otočení, rozložení na telefonu na šířku a ve dvou rozlišeních počítače.

## Známé nedostatky

- Zvuk nikdo neposlouchal; test ověřuje jen hodnotu hlasitosti ve zvukovém grafu.
- Dotyk, otočení a celá obrazovka jsou ověřené emulací, ne na zařízení. Na iPhonu celá obrazovka přes API není; položka se tam podle podmínky `when` nemá ukázat (neověřeno).
- Zámek orientace po přechodu na celou obrazovku je jen pokus; nikde neověřen.
- Nastavení „Uložit změny“ tlačítkem (místo automatického ukládání) není; zatím jen automatické.
- Vývojářský přehled kreslí hra; do Shellu se přesune v S4.
- Menu ukazuje nehybný záběr světa (attract mode S4).

## Další krok (návrh)

- **Arkáda M2:** vzory překážek, křivka obtížnosti (a s ní položka „Obtížnost“ v nastavení), konec kola, rekord, robot v testu. Hra tím dostane smysl a Shell první položku, kterou si vyžádala hra, ne já.
- nebo **Shell S2:** přemapování kláves, zvukové sběrnice (hudba, efekty), gamepad.
