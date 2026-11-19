# Sada frameworků pro vibe-coding her — Level 1

Stav: 19. 11. 2026. Vychází z konverzace s Gemini 4.0 Argon (Level 0), z jejího auditu a z postupů ověřených v Aréně v2 a Soustavě 200.

---

## Mapa

| Soubor | K čemu |
|---|---|
| `00_AUDIT_Level0.md` | kritika Level 0: metriky, 61 prověřených tvrzení (chyby i potvrzené správné), co přebírám |
| `01_CORE_Zasady_postup_kontrakt.md` | 12 zásad, karta projektu, web × engine, architektura, milníky, rozpočty, testy, zadání k vložení |
| `02_SHELL_Specifikace.md` | Shell jako knihovna: adaptér, nastavení s `apply/probe`, vstup, zvuk, ukládání, katalog, vývojářská sada |
| `10_CASE_FPS.md` | střílečka z první osoby (Quake, CS, Half-Life) |
| `20_CASE_Slunecni_soustava.md` | model soustavy, přelety, povrchy |
| `30_CASE_Bojovka.md` | 2D bojovka |
| `40_CASE_Arkada.md` | běžec / sběrač; zároveň zkušební hra pro Shell |
| `50_CASE_Planetka_simulace.md` | planetka, život obyvatel, volitelně zásahy shora |
| `60_ROZSIRENI_RTS_a_otevreny_svet.md` | kratší karty pro strategii a otevřený svět |

Každý case má stejnou stavbu: rozsah, invarianty, amatérismy, milníky, varianta A (web), varianta B (engine), napojení na Shell, akceptační testy, zadání k vložení, zamyšlení (konzilium, FAQ, 5× proč, mentální modely, ELI20).

---

## Jak s tím pracovat

1. **Jednou:** postav Shell jako knihovnu (kroky S0–S4 v `02_SHELL`) nad arkádou z casu 40. Tím vznikne kód, který se dál jen přenáší.
2. **Nový projekt:** vyplň kartu projektu (`01_CORE` oddíl 2), založ repo podle kostry (oddíl 8), vlož zadání M0.
3. **Každá iterace:** zadání iterace s jednou novinkou, na konci testy a `STATE.md`.
4. **Nezávislá kontrola:** zadání revize dej jinému modelu nebo čisté sešně.

Do zadání nevkládej celé soubory, pokud je model má v repu; stačí odkaz na case a číslo milníku.

---

## Čím se Level 1 liší od Level 0

- Shell je kód s kontraktem, ne prompt.
- Žádné „všechno najednou“: milníky s měřitelným koncem.
- Zákaz slepých prvků má test (`apply/probe`) a hra deklaruje, co umí.
- Čas se škáluje na vstupu, krok je pevný.
- Data se stahují a validují.
- Přibyl case pro arkádu; planetka je rozložená do vrstev.
- Varianta s enginem je poctivá: Godot rozpracovaný, Unreal odmítnutý, pasti jmenovitě.
- Opravené chyby jsou vyjmenované v auditu s mírou jistoty.

---

## Stav ověření (čti před použitím)

**Ověřeno výpočtem:** kroky float32 a float64, doby letu při 0,1c, brzdné dráhy, Dopplerův posuv a aberace, skok v regulátoru rychlosti z Level 0, převody jednotek pohybu, návrh skoku, paměť spritů.

**Ověřeno ze zdrojů:** stav GTA VI, Godot 4.7 a jeho webový export, obrácený Z-buffer v Godotu a three.js, chování zámku kurzoru po Esc, export WebP z plátna v Safari.

**Převzato z tvé praxe:** kontrakt systému, rozpočty kroku a volání kreslení, testovací háček, klávesy F7/F9, JPEG náhledy, prodleva zámku kurzoru.

**Neověřeno, označeno v textu jistotou 3/5:** konstanty pohybu CS a Half-Life, pravidla bloku v klasickém Mortal Kombatu, název metody pro směr „nahoru“ v kontroléru Rapieru, některé názvy API Godotu, odhady řádků kódu.

**Žádný z frameworků jsem nespouštěla jako kód.** Jsou to specifikace. Jejich použitelnost se prokáže až prvním projektem, který podle nich projde M0–M2; tam čekám opravy.

---

## Vlastní odhad kvality (stejné metriky jako v auditu)

| | P přesnost | A architektura | U použitelnost | K konzistence | C kalibrace | V vhled |
|---|---|---|---|---|---|---|
| Level 0 (průměr osmi výstupů) | 3,4 | 3,6 | 2,8 | 3,1 | 2,6 | 4,1 |
| Level 1 (odhad autorky, neprověřeno projektem) | 4 | 4 | 4 | 4 | 4 | 4 |

Řádek Level 1 ber jako cíl, ne jako výsledek. Hodnotit vlastní práci je slabý důkaz; nech ji projít nezávislou revizí stejně, jako jsi nechal Soustavu 200.

---

## Co by byl Level 2

1. Skutečná knihovna Shellu v repu s testy (dnes je jen specifikovaná).
2. Šablona repa s `build.mjs`, `test/h.js` a prázdným adaptérem.
3. Převod casů na skilly, aby se načítaly samy podle projektu.
4. Zpětná oprava frameworků podle prvního projektu, který jimi projde.
