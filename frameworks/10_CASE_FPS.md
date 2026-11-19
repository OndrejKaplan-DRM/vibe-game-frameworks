# Case 10 — 3D střílečka z první osoby (Quake · Counter-Strike · Half-Life · Doom)

Předpoklad: přečtené `01_CORE` a `02_SHELL`. Tenhle soubor přidává jen to, co je pro žánr zvláštní.

---

## 1. Rozsah

**Je:** hra pro jednoho hráče v aréně nebo levelu, pohyb ve stylu id Software / Valve, zbraně, nepřátelé s AI, spouštěče v levelu.
**Není:** síťová hra (Counter-Strike bez sítě znamená boty), otevřený svět se streamováním, příběhové střihové scény.

**Jádro jednou větou:** *pohybuju se, mířím, střílím a pohyb sám je zábava.*
Když nebaví běhat prázdnou místností, nepomůže deset zbraní.

---

## 2. Invarianty (závazné)

**F1 — Jedna fyzikální autorita.**
Výchozí: Rapier pro všechno. Statický svět jako kolizní tvary, hráč i nepřátelé přes kinematický kontrolér postavy (schody, sklon, přichycení k zemi), paprsky přes dotazy Rapieru.
Octree z `three/addons` je přípustný jen jako samostatná volba pro hru bez dynamické fyziky. Kombinace obojího znamená dvě kopie statického světa a dvě pravdy; Level 0 před tím sám varoval a pak to předepsal.

**F2 — Pevný krok 120 Hz, čas se škáluje na vstupu** (viz `01_CORE` 4.2). Kamera se interpoluje mezi posledními dvěma stavy.

**F3 — Pohyb jsou tři funkce, ne posouvání souřadnic.**

~~~js
// vel, wishDir: vodorovné vektory; jednotky m, m/s
function friction(vel, P, dt) {
  const speed = vel.length(); if (speed < 0.01) { vel.set(0, 0, 0); return; }
  const drop = Math.max(speed, P.stopSpeed) * P.friction * dt;
  vel.multiplyScalar(Math.max(speed - drop, 0) / speed);
}
function accelerate(vel, wishDir, wishSpeed, accel, dt) {
  const add = wishSpeed - vel.dot(wishDir);        // kolik chybí VE SMĚRU přání
  if (add <= 0) return;
  vel.addScaledVector(wishDir, Math.min(accel * wishSpeed * dt, add));
}
// na zemi:  friction(); accelerate(vel, wishDir, P.maxSpeed, P.accel, dt)
// ve vzduchu: accelerate(vel, wishDir, Math.min(P.maxSpeed, P.airCap), P.airAccel, dt)
// výsledek předej kontroléru postavy, ten vyřeší kolize, schody a skluz
~~~

Air-strafe a bunny-hop nejsou zvláštní funkce. Vzniknou samy z toho, že `accelerate` omezuje jen průmět rychlosti do směru přání.

**Profily pohybu jako data** (1 herní jednotka ≈ 2,54 cm):

| Parametr | QUAKE3 | CS | HALF-LIFE |
|---|---|---|---|
| max. rychlost | 320 u = 8,13 m/s | 250 u = 6,35 m/s | 320 u = 8,13 m/s |
| zrychlení na zemi | 10 | 5 | 10 |
| tření | 6 | 4 | 4 |
| stop-rychlost | 100 u = 2,54 m/s | 75 u = 1,9 m/s | 100 u |
| zrychlení ve vzduchu | 1 | 10 | 10 |
| strop přání ve vzduchu | bez stropu | 30 u = 0,76 m/s | 30 u |
| gravitace | 800 u/s² = 20,3 m/s² | 800 | 800 |
| rychlost výskoku | 270 u/s = 6,86 m/s (výška 1,16 m) | ~268 | ~268 |

Sloupec QUAKE3 je spolehlivý (5/5), CS a HALF-LIFE ber jako výchozí odhad k doladění (3/5). Důležité je, že gravitace těchto her je dvojnásobek zemské; s 9,81 působí skok „plovoucím“ dojmem.

**F4 — Kamera jsou dvě čísla.** `yaw` a `pitch` jako skaláry, pitch omezený na ±89°, pořadí rotace `YXZ`. Posun myši se násobí citlivostí, **ne** `dt`.

**F5 — Zbraň v ruce druhým průchodem.** Vlastní scéna a kamera se stálým zorným polem (cca 65°), mezi průchody `renderer.clearDepth()`. Světla pro zbraň zvlášť nebo přes prostředí. S postprocesem jako druhý `RenderPass` s vymazáním hloubky.

**F6 — Zásahy proti kolizním tvarům.** Okamžitá zbraň = paprsek Rapieru s kolizními skupinami; zóny zásahu (hlava, trup, končetiny) jako samostatné tvary na kostech nebo analytické kapsle. `THREE.Raycaster` proti vykreslovaným meshům ne.
Střely: v každém kroku paprsek z minulé do nové pozice (nebo CCD), jinak rychlá střela proletí tenkou zdí.

**F7 — Zbraně a nepřátelé jsou data.** Tři archetypy zbraní pokrývají žánr:
- okamžitá (vzor zpětného rázu, rozptyl z pohybu, násobitele zón),
- střela (rychlost, plošné poškození s úbytkem, impuls → raketový skok),
- zblízka s krytem (okno vykrytí ve krocích, odražení střely s příznakem).

**F8 — AI: automat + vnímání s rozpočtem + spravedlnost.**
- Stavy s výslovnými přechody (`IDLE → PATROL → ALERT → COMBAT → STAGGER → DEAD`).
- Viditelnost paprskem 5–10× za sekundu, rozloženě mezi nepřátele; sluch přes událost `noise`.
- Navigace: navigační síť nebo mřížkové pole směrů k hráči; nikdy „otoč se na hráče a jdi“.
- Útok má viditelný nápřah. Počet současně útočících omezuje „žeton útoku“.

**F9 — Level jsou data a spouštěče** (odkaz Half-Life):

~~~js
{ id: 'btn1', type: 'button', pos: [..], on: 'use',   target: 'door1', input: 'open', delay: 0.5 }
{ id: 'trg2', type: 'trigger', box: [..], on: 'enter', target: 'wave2', input: 'start', once: true }
~~~

Level může vzniknout v Blenderu: export glTF, kolizní tvary a spouštěče jako prázdné objekty s vlastními vlastnostmi (`col_`, `spawn_`, `trigger_`), importér je převede na data.

**F10 — Pocit ze střelby má rozpočet.** Záblesk 50 ms, značka zásahu, třes podle nastavení, variace výšky zvuku, částice z poolu. Všechno jako data u zbraně.

**F11 — Zámek kurzoru podle protokolu Shellu** (`02_SHELL` oddíl 3).

---

## 3. Amatérismy tohoto žánru

| Příznak | Místo toho |
|---|---|
| `position += směr * rychlost * dt` | F3 + kontrolér postavy |
| zemská gravitace 9,81 | profil pohybu (≈ 20 m/s²) |
| kamera se časem naklání | F4 |
| zbraň prochází zdí | F5 |
| nepřítel běží rovnou za hráčem skrz sloupy | F8 |
| poškození bez zón, paprsek proti meshi | F6 |
| střela proletí zdí při zrychleném čase | F2 + F6 |
| každý výstřel alokuje vektory a zvuk | pooly, Web Audio |
| level natvrdo v kódu | F9 |
| dřep na Ctrl | viz tabulka kláves v Shellu |

---

## 4. Milníky

| Milník | Obsah | Hotovo, když |
|---|---|---|
| M1 | místnost z krabic, pohyb podle profilu, skok, jedna okamžitá zbraň, terč, F3 s rychlostí v m/s | testy T1–T3 |
| M2 | jeden nepřítel s automatem, zdraví, smrt, výhra/prohra, uložení | T4–T6 |
| M3 | tři archetypy zbraní a tři nepřátelé z dat, katalog | nová zbraň = jen data |
| M4 | level z dat, spouštěče, předměty | level jde vyměnit bez změny kódu |
| M5 | pocit, zvuk, výkon, attract mode | rozpočty na slabém stroji |

---

## 5. Varianta A — web (Three.js + Rapier + esbuild)

- Kontrolér: `world.createCharacterController(offset)`, `enableAutostep`, `enableSnapToGround`, `setMaxSlopeClimbAngle`; v kroku `computeColliderMovement` → `computedMovement()`, `computedGrounded()`.
- Kolizní skupiny hned od M1: svět, hráč, nepřítel-tělo, nepřítel-zóny, střely, trosky.
- Ladicí vrstva kolizí: `world.debugRender()`.
- Opakované objekty přes `InstancedMesh`, jedno směrové světlo se stínem, počet bodových světel omezený nastavením.

## 6. Varianta B — engine (Godot 4.7)

| Téma | Postup a pasti |
|---|---|
| pohyb | `CharacterBody3D` + vlastní `friction/accelerate` + `move_and_slide()`, `floor_snap_length`, `floor_max_angle` |
| **schody** | Godot je sám neřeší; potřebuješ krok nahoru přes `test_move` / tvarový dotaz. Častý zádrhel |
| krok fyziky | `physics_ticks_per_second = 120` a zapnutá fyzikální interpolace |
| fyzika | u nových projektů od 4.6 výchozí Jolt; ověř, co má tvůj projekt |
| myš | `MOUSE_MODE_CAPTURED`, posun z události bez `delta` |
| zbraň v ruce | `SubViewport` s vlastní kamerou, nebo úprava projekce ve shaderu |
| zásahy | `PhysicsRayQueryParameters3D` s maskou; zóny jako tvary na `BoneAttachment3D` |
| navigace, animace | `NavigationRegion3D` + `NavigationAgent3D`, `AnimationTree`: tady engine šetří nejvíc práce |
| web export | jen Compatibility: méně světel a efektů, balík desítky MB |

---

## 7. Napojení na Shell

- **Akce:** vpřed, vzad, vlevo, vpravo, skok, dřep, útok, vedlejší útok, použít, zbraň 1–4, další/předchozí, rychlé uložení/nahrání, mapa.
- **Nastavení navíc:** zorné pole, citlivost, inverze Y, zaměřovač, třes, profil pohybu (vývojář), počet světel, stíny.
- **Katalog:** nepřátelé a zbraně z registru; u nepřítele zobrazení zón zásahu.
- **Vrstvy:** kolize, zóny, stavy AI nad hlavou, navigace, paprsky s dozníváním 2 s.
- **Uložení:** hráč, zbraně a munice, nepřátelé, střely, stav spouštěčů, čas.
- **Attract:** kamera po křivce arénou, boti proti sobě (stejné AI s jinou stranou).

---

## 8. Akceptační testy

| # | Test | Podmínka |
|---|---|---|
| T1 | 2 s vpřed po rovině | rychlost = max. rychlost profilu ±5 % |
| T2 | série výskoků s úkrokem (profil QUAKE3) | rychlost > 1,2 × max. rychlost |
| T3 | rozběh proti zdi při time-scale 5 | hráč zůstane uvnitř místnosti |
| T4 | schod 0,3 m a svah 50° | schod vyjde, na svahu sklouzne |
| T5 | zásah hlavy / trupu / končetiny | poškození podle násobitelů |
| T6 | ulož → nahraj; a totéž + 60 kroků | stav shodný; odchylka do tolerance |
| T7 | 500 výstřelů | halda neroste, počet objektů scény stálý |
| T8 | 20 nepřátel v boji | krok ≤ 2 ms, volání ≤ rozpočet |

---

## 9. Zadání k vložení (M1)

~~~text
Projekt: střílečka z první osoby, case 10, varianta A. Platí 01_CORE, 02_SHELL, 10_CASE_FPS.
Iterace: M1 „hračka“. Kostra M0 a Shell už existují.
Udělej POUZE: systém physics (Rapier, kolizní skupiny), systém player (invarianty F2–F4,
profil QUAKE3 z dat, kontrolér postavy), místnost 20×20 m z krabic se schodem 0,3 m a rampou,
jednu okamžitou zbraň proti terči, F3 přehled (rychlost v m/s, na zemi ano/ne, ms kroku).
Nedělej: nepřátele, více zbraní, zvuk, textury, menu navíc.
Hotovo, když projdou testy T1–T4 a T7 z case 10. Vypiš změřený krok a počet volání.
~~~

---

## 10. Zamyšlení

### Konzilium pěti expertů

- **Programátor pohybu:** „Dokud nemám graf rychlosti při skákání, nic dalšího nepíšu. Tři funkce a tabulka profilu jsou celé tajemství; zbytek je ladění čísel.“
- **Fyzik enginu:** „Jedna autorita. Kinematický kontrolér není fyzikálně věrný a je to tak správně, hráč nemá být bedna. Dynamiku nech bednám a troskám.“
- **Návrhář AI:** „Hráč nevnímá chytrost, vnímá čitelnost. Nápřah, zvuk a žeton útoku udělají víc než plánovač cest.“
- **Technický výtvarník:** „Druhý průchod pro zbraň je povinný, jinak budeš donekonečna posouvat ořez kamery. Rozpočet světel si urči dřív než první louči.“
- **Tester a nástrojař:** „Chci `sim()` bez čekání a snímek stavu. Bez toho se u dvacáté zbraně bojíš cokoli změnit.“

Spor: 120 Hz (programátor pohybu) proti 60 Hz (výtvarník kvůli výkonu). Závěr: 120 Hz pro pohyb a střely je levné, drahé je kreslení; AI a vnímání ať běží řidčeji.

### FAQ

1. **Proč ne rovnou engine?** Pro arénu ve webu máš plnou kontrolu a sdílení odkazem. Engine se vyplatí s animovanými postavami a velkými levely.
2. **Stačí 60 Hz?** Na pohyb ano, rychlé střely a tenké zdi pak hlídej paprskem. 120 Hz dává rezervu při zrychleném čase.
3. **Potřebuju Octree?** Ne, pokud máš Rapier.
4. **Jak udělat, aby zbraň „kopala“?** Zpětný ráz kamery jako vzor v datech + rychlý návrat, záblesk, zvuk s variací, krátké zastavení animace.
5. **Proč se hráč zasekává o hrany?** Chybí automatický krok nebo je kapsle moc široká; ukaž si kolizní vrstvu.
6. **Jak na boty místo sítě?** Stejné tělo jako hráč, jiný řidič (zásada 5). Bot míří s reakční dobou a chybou.
7. **Kolik nepřátel najednou?** Tolik, kolik unese rozpočet kroku a čitelnost; začni u 10–20.
8. **Jak ukládat uprostřed boje?** Každý systém vrací čistá data včetně střel; obnova přes registr.
9. **Proč se při zpomalení všechno chová jinak?** Někde se násobí `dt` místo přísunu času, nebo běží `setTimeout`.
10. **Kde vzít level?** Krabice v datech pro M1–M3, potom Blender a glTF s pojmenovanými pomocnými objekty.

### 5× proč

Problém: po několika týdnech nejde přidat nový typ nepřítele, aniž se rozbije střelba.
1. Proč? Nepřítel, zbraň a hráč si sahají do společných proměnných.
2. Proč? Neexistoval kontrakt systému; první verze vznikla jako jeden soubor.
3. Proč? První zadání chtělo menu, zbraně, nepřátele i level najednou.
4. Proč? Chyběl milník, který by řekl „teď jen pohyb“.
5. Proč? Nebylo napsáno, co je jádro hry a podle čeho se pozná, že je hotové.

Kořen: chybějící definice jádra a měřitelného prvního milníku. Lék: karta projektu, M1 jen pohyb, testy T1–T4.

### Mentální modely

- **Occamova břitva:** jedna fyzika, jeden zdroj pravdy o kolizích. Hybrid ospravedlň měřením, ne dojmem.
- **První principy:** střílečka = bod pohledu + paprsek + zpětná vazba. Všechno ostatní je obsah.
- **Inverze:** jak hru spolehlivě zkazit? Proměnný krok, gravitace 9,81, zbraň ve světové scéně, AI bez nápřahu. Seznam invariantů je tahle otázka obrácená.
- **Druhý řád důsledků:** přemapovatelné klávesy znamenají, že nápověda a tutoriál musí číst aktuální vazby; ukládání znamená, že každý nový systém musí umět `snapshot`. Počítej s tím při každém přidání.

### ELI20

Střílečka stojí na pocitu z pohybu, a ten je dán pár čísly a třemi krátkými funkcemi, které vymysleli v id Software před třiceti lety. Když je opíšeš správně, hra se „hýbe jako Quake“ i s šedými krabicemi. Počítač mezitím počítá svět v pevných malých krocích, aby se choval pokaždé stejně, ať máš rychlý nebo pomalý stroj. Zbraň, kterou vidíš v ruce, se kreslí zvlášť navrch, proto neprojde zdí. A nepřátelé nejsou chytří, jsou čitelní: napřáhnou se, ty stihneš uhnout, a máš pocit férového souboje.
