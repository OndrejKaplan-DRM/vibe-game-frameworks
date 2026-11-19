# Společné jádro — zásady, postup, kontrakt (Level 1)

Platí pro všechny casy. Čti jednou, pak se k němu vracej přes odkazy z casů.
Vychází z toho, co se ti osvědčilo v Aréně v2 a Soustavě 200, a z žánrových vhledů Level 0.

---

## 1. Dvanáct zásad

| # | Zásada | Proč |
|---|---|---|
| 1 | **Kód místo promptu.** Co se opakuje (Shell, smyčka, testovací háčky), žije jako kód v repu. Zadání je krátké a odkazuje na soubory. | Dlouhý prompt se pokaždé přepíše trochu jinak a stojí výstupní kapacitu. |
| 2 | **Kontrakt před obsahem.** Nejdřív rozhraní (systém, adaptér, události), potom první funkce. | Rozhraní se mění draho, obsah levně. |
| 3 | **Jedna pravda.** Každá hodnota, seznam a definice existuje na jednom místě (registr, deklarace nastavení, datový soubor). | Třetí kopie téhož čísla je budoucí chyba. |
| 4 | **Pevný krok, čas jako vstup.** Simulace běží v pevném kroku; zrychlení a zpomalení mění přísun času, nikdy délku kroku. | Jinak se při zrychlení mění fyzika a nic nejde zopakovat. |
| 5 | **Řízení ≠ tělo.** Kdo rozhoduje (hráč, AI, záznam, test) je oddělený od toho, co se hýbe. | Attract mode, testy, AI i dětský režim jsou pak jen jiný „řidič“. |
| 6 | **Stav jsou data, obraz je pohled.** Herní stav jde uložit, porovnat a obnovit bez rendereru. | Ukládání, testy a port do jiného enginu z toho padají zadarmo. |
| 7 | **Data nejsou z paměti modelu.** Efemeridy, katalogy, konstanty her se stahují ze zdroje, s datem a kontrolou. | Model napíše věrohodně vypadající číslo i tehdy, když ho neví. |
| 8 | **Měř, nevěř.** Každý milník má testy a rozpočty. Tvrzení o výkonu bez měření se nepíše. | „Mělo by to stačit“ je nejdražší věta projektu. |
| 9 | **Jedna novinka na iteraci.** Nový systém, nebo nový obsah, nebo refaktor; ne dvě věci naráz. | Když se něco rozbije, víš čím. |
| 10 | **Deklarované schopnosti.** Hra říká, co umí; Shell ukáže jen to. | Slepé tlačítko nevznikne, protože ho nemá kdo vykreslit. |
| 11 | **Vratnost.** Git od prvního dne, stabilní a vývojová větev, verze v kódu, záloha před větší změnou. | Odvaha experimentovat stojí na jistotě návratu. |
| 12 | **Požadavky nevyšumí.** Každý požadavek dostane číslo a stav v `REQUIREMENTS.md` ve stejné odpovědi, kdy zazněl. | Tři sešny stará věc se jinak ztratí pod novějšími. |

---

## 2. Karta projektu (vyplň před prvním řádkem kódu)

Deset odpovědí, každá na jeden řádek. Uloží se jako `docs/PROJECT_CARD.md`.

1. **Jádro hry jednou větou** (jedno sloveso): „běžím, skáču a sbírám“, „mířím a střílím“, „dívám se, jak žijí“.
2. **Co hra není** (tři věci, které do ní nepatří, i když lákají).
3. **Publikum a zařízení:** kdo, na čem (notebook s integrovanou grafikou, telefon, tablet, televize).
4. **Referenční slabý stroj** pro měření (konkrétní model).
5. **Distribuce:** artefakt, GitHub Pages, jeden soubor na flashku, desktopová aplikace.
6. **Varianta:** A (web bez enginu) nebo B (engine) a proč. Viz oddíl 3.
7. **Tón:** dospělý technický, retro, dětský. U dětského: čte dítě? Pokud ne, rozhraní nesmí stát na textu.
8. **Zdroje dat a assetů** s licencí (CC0, vlastní, placený tarif).
9. **Rozpočty** (oddíl 6) upravené pro tento projekt.
10. **První hratelný milník** (M1) a datum, kdy ho chceš vidět.

---

## 3. Varianta A (web) × B (engine)

| Kritérium | A: Three.js / Canvas + Rapier + esbuild | B: Godot 4.7 (hlavní), Unity 6 (možné) |
|---|---|---|
| Model vidí celý projekt | ano, vše je text | Godot ano (scény `.tscn` jsou text), Unity částečně |
| Sdílení odkazem, telefon | přirozené | web export Godotu jede jen v režimu Compatibility (WebGL 2), balík desítky MB |
| Automatické testy | Playwright bez grafické karty | `godot --headless`, složitější snímky obrazu |
| Kostěné animace, velké levely, světla | ruční práce | silná stránka enginu |
| Desktopová aplikace | přes obal (Tauri, Electron) | přímo |
| 64bitová matematika | zadarmo (`Number`) | skripty ano, transformace uzlů 32bitové (kromě vlastního sestavení) |
| Riziko | pomalé vlastní nástroje pro obsah | „naklikej si to v editoru“, verze API se mění |

**Doporučení po casech:** Sluneční soustava A. Arkáda A. Bojovka A nebo B (rozhoduje balení pro Windows). FPS: A pro arény a menší levely, B jakmile potřebuješ animované postavy a velký svět. Planetka: A, port do Godotu jako experiment se stejnými datovými soubory.

**Unreal 5:** pro vibe-coding přes chat ho nedoporučuju. Assety a Blueprinty jsou binární, model je nevidí; překlad C++ trvá minuty. Dává smysl až s agentem, který má editor na tvém stroji. (4/5)

**Pravidla pro B (text-first, ne „všechno v `_ready()`“):**
- Statická struktura scén smí být v `.tscn` (je to text, model ji napíše). Dynamický obsah z dat v kódu.
- Žádný krok v editoru, který není zapsaný v `docs/EDITOR_STEPS.md`. Ideál je nula kroků.
- Shell jako autoload, mapování vstupů v `project.godot`.
- Uváděj verzi enginu v každém zadání a nech model u nejistého API napsat „ověř v dokumentaci“.
- Port mezi A a B sdílí **datové soubory** (registr entit, nastavení, mapy). Co je v datech, se nepřepisuje.

---

## 4. Architektura (platí pro A i B, názvy se jen přeloží)

### 4.1 Systém a registr

~~~js
// Každá část hry je systém. Pořadí registrace = pořadí kroků i resetů.
const system = {
  name: 'weapons',
  async init(E) {},        // jednou: assety, posluchače
  build() {},              // jednou: statický svět
  reset() {},              // nová hra / před nahráním: vrať vše, co step mění
  step(dt) {},             // pevný krok, jen v režimu 'playing'
  frame(dt, alpha) {},     // každý snímek: animace, kamera, HUD; alpha = podíl mezi kroky
  snapshot() { return {}; },   // čistá data
  restore(s) {},
};
E.add(system);  E.get('weapons');  E.on('explosion', fn);  E.emit('explosion', data);
~~~

Systémy spolu mluví událostmi a přes `E.get`. Žádný systém nesahá jinému do vnitřností.

### 4.2 Čas

~~~js
const STEP = 1/120;          // bojovka a arkáda 1/60, pomalé simulace 1/10 + vlastní interpolace
const MAX_FRAME = 0.1;       // tab na pozadí, zásek: nezapočítej víc než 100 ms
let acc = 0, last = performance.now();

function loop(now) {
  const real = Math.min((now - last) / 1000, MAX_FRAME); last = now;
  if (E.mode === 'playing') acc += real * E.timeScale;      // škáluje se PŘÍSUN času
  const maxSteps = Math.ceil(8 * Math.max(1, E.timeScale));
  let n = 0;
  while (acc + 1e-9 >= STEP && n < maxSteps) { E.step(STEP); acc -= STEP; n++; }   // rezerva na zaokrouhlení
  if (n === maxSteps) acc = 0;                               // dluh zahoď, nespirálu
  E.frame(real, acc / STEP);
  requestAnimationFrame(loop);
}
~~~

- Časovače ve hře se počítají v krocích nebo v herním čase. `setTimeout` a `Date.now()` do herní logiky nepatří (nepřežijí pauzu, zrychlení ani uložení).
- „Rychlost hry“ z nastavení a „time-scale“ z vývojářského panelu jsou jedna hodnota `E.timeScale = nastavení × vývojář`. Krokování po jednom kroku = `E.step(STEP)` při pauze.
- Při skryté kartě (`visibilitychange`) přepni do pauzy.

### 4.3 Řízení a tělo

~~~js
// Controller vyrábí záměr, Pawn ho provádí. Hráč, AI, záznam a test jsou jen různé controllery.
controller.think(pawn, world) -> intent      // { move:[x,y], look:[dx,dy], actions:Set }
pawn.apply(intent, dt)
~~~

Použití: attract mode (AI nebo přehrávaný záznam), automatické testy (skript), převzetí postavy na planetce, asistence v dětském režimu, nastoupení do vozidla.

### 4.4 Registry a data

- `ENTITY_REGISTRY`: definice všeho, co se dá spawnovat a prohlížet v katalogu.
- `SETTINGS_DEFS`: deklarace nastavení (viz Shell).
- `ACTIONS`: herní akce a výchozí klávesy podle `event.code`.
- Datové soubory mají hlavičku: zdroj, datum, jednotky, verze schématu.

### 4.5 Režimy

`boot → attract → menu → playing ⇄ paused → over`. Krok simulace běží jen v `playing` (a v `attract` s AI řízením). Přechody jsou na jednom místě.

---

## 5. Milníky a definice „hotovo“

| Milník | Obsah | Hotovo, když |
|---|---|---|
| **M0 Kostra** | build do jednoho HTML ze `src/`, smyčka, režimy, Shell v základu (titul, start, pauza), testovací háček, git | prázdná hra startuje, pauzuje, test prochází, verze je vidět |
| **M1 Hračka** | jedno jádrové sloveso se šedými krabicemi, F3 přehled | dá se s tím 2 minuty hrát a je jasné, jestli to baví; testy pohybu zelené |
| **M2 Řez** | jedna úplná smyčka výhra/prohra, uložení a nahrání, attract mode | test „ulož → nahraj → stejný stav“ prochází |
| **M3 Obsah z dat** | registr, katalog, další entity pouze přidáním dat | nová entita = jen záznam v datech, kód se nemění |
| **M4 Hloubka Shellu** | plné nastavení, přemapování kláves, sloty s náhledy, vývojářské vrstvy | každá položka nastavení projde testem `apply/probe` |
| **M5 Dotažení** | zvuk, načítání, výkon na slabém stroji, další zařízení, publikace | rozpočty splněny na referenčním stroji, tři kanály distribuce fungují |

Na konci každého milníku: testy zelené, rozpočty změřené, soubor k vyzkoušení odeslaný, `STATE.md` aktualizovaný, commit.

Hluboké menu dostaneš hned od M0, protože Shell je hotová knihovna. To je rozdíl proti Level 0, kde se menu psalo znovu spolu s hrou.

---

## 6. Výchozí rozpočty (web, integrovaná grafika)

| Veličina | Výchozí mez | Poznámka |
|---|---|---|
| Krok simulace | ≤ 2 ms při 120 Hz | z Arény |
| Volání kreslení na pohled | ≤ 400 | z Arény |
| Snímek na referenčním stroji | ≤ 16,6 ms, nikdy přes 33 ms | měř graf, ne průměr |
| Alokace ve smyčce | žádné | dočasné vektory předem |
| Růst haldy při klidné hře | ≤ 1 MB/min | test 5 minut |
| Start do menu | ≤ 5 s, ukazatel nesmí couvat | |
| Uložená pozice | ≤ 200 kB + náhled ≤ 15 kB | změř skutečný náhled |
| Soubor zdrojového kódu | ≤ 600 řádků | jinak rozděl |
| Celá regrese | ≤ 15 min pro běžnou iteraci | plná jen před vydáním |

Čísla jsou výchozí; přepiš je v kartě projektu, ale měj je.

---

## 7. Testy

- Hra vystavuje `window.__game = { start(opts), sim(sekundy, vstupy), key(), get(cesta), stats(), snapshot(), restore() }`.
- `sim()` volá kroky bez čekání na skutečný čas. Testy tak běží rychle i bez grafické karty.
- `sim(sekundy, skript)` na dobu běhu vymění řízení za skriptové. Mezi voláními testu běží skutečná smyčka dál a stav se posouvá; kde na tom záleží, hru kolem `sim()` zapauzuj.
- Logiku drž v modulu bez DOM. Většina testů pak běží přímo v Node a prohlížeč je potřeba jen na Shell a vstupy.
- Povinné testy každého casu: start bez chyb v konzoli, pauza zastaví čítač kroků, ulož/nahraj dá stejný stav, stejný seed a vstupy dají stejný výsledek, každé nastavení projde `apply/probe`, rozpočet kroku.
- Test se píše ve stejné iteraci jako funkce. Počty v testech ber z dat, ne natvrdo.
- Náhodný test, který občas padne, spusť dvakrát a pak teprve hledej chybu; časové limity měř na klidném stroji.

---

## 8. Repo a dokumenty

~~~text
projekt/
├── src/
│   ├── core/        engine.js (registr, sběrnice, smyčka), rng.js, store.js
│   ├── shell/       knihovna Shellu (viz 02_SHELL)
│   ├── game/        systémy hry
│   ├── data/        registry, mapy, datové soubory se zdrojem
│   └── main.js      VERSION, registrace systémů, adaptér
├── test/            h.js + t1_*.js …
├── tools/           importéry dat, sondy výkonu
├── docs/
│   ├── PROJECT_CARD.md
│   ├── REQUIREMENTS.md   ID | požadavek tvými slovy | datum | stav | verze | test
│   ├── DECISIONS.md      datum | rozhodnutí | zvažované možnosti | proč | jak vrátit
│   ├── STATE.md          verze, co funguje, známé chyby, další krok
│   └── DATA_SOURCES.md   soubor | zdroj | URL | datum | licence
├── build.mjs
└── dist/            jeden HTML soubor
~~~

Stavy požadavku: nový → plánovaný → hotový | odložený | zamítnutý. Na konci iterace se vypíší všechny, které nejsou hotové.

---

## 9. Protokol sešny a zadání k vložení

**Začátek sešny:** přečti `STATE.md`, `REQUIREMENTS.md`, poslední předávku. Zopakuj cíl iterace jednou větou a vyjmenuj, co se měnit nebude.

**Konec iterace:** testy, rozpočty, verze, `STATE.md`, commit, soubor k vyzkoušení.

### Zadání M0 (nový projekt)

~~~text
Stavíme nový projekt podle sady Level 1.
Přečti: 01_CORE, 02_SHELL a case [číslo]. Karta projektu je níže.
Cíl této iterace je POUZE milník M0: kostra, build do jednoho HTML, smyčka s pevným krokem,
režimy, Shell napojený přes adaptér, testovací háček window.__game, jeden kouřový test, git.
Žádná herní mechanika. Žádné funkce z M1 a dál.
Na konci: testy, změřený krok a start, STATE.md, soubor k vyzkoušení.
Kde si nejsi jistá názvem API nebo číslem, napiš to a nevymýšlej.
[KARTA PROJEKTU]
~~~

### Zadání iterace

~~~text
Iterace [N], verze [X]. Jedna novinka: [co].
Nesmí se změnit: [seznam]. Dotčené požadavky: [ID z REQUIREMENTS.md].
Hotovo, když: [měřitelné podmínky + test].
Než začneš psát, vypiš v pěti řádcích plán a rizika. Po dokončení vypiš, co zůstalo otevřené.
~~~

### Zadání revize (nezávislá kontrola, i jiným modelem)

~~~text
Zkontroluj [soubor/systém] proti invariantům casu [číslo] a zásadám 01_CORE.
Pro každý invariant: splněn / porušen / nelze posoudit, s řádkem kódu.
Hledej zvlášť: čas mimo pevný krok, druhou kopii téže hodnoty, položku nastavení bez účinku,
alokace ve smyčce, stav, který se neukládá. Nenavrhuj nové funkce.
~~~

---

## 10. Kdy zastavit a přestavět

- Oprava jedné věci rozbije dva nesouvisející testy → vrať se a hledej chybějící rozhraní.
- Stejná hodnota je na třetím místě → přesuň do dat.
- Systém čte vnitřní proměnné jiného systému → událost nebo dotaz přes registr.
- Soubor přesáhl 600 řádků → rozděl podle odpovědnosti.
- Iterace obsahuje víc než jednu novinku → rozděl ji.
- Nevíš, proč se něco chová, jak se chová → nejdřív vývojářská vrstva, která to ukáže, potom oprava.

---

## 11. Typické amatérismy napříč žánry

| Příznak | Místo toho |
|---|---|
| fyzika s proměnným `dt` z `Clock.getDelta()` | pevný krok, akumulátor |
| `setTimeout` pro herní děje | čítače v krocích |
| jeden soubor s globálními proměnnými | systémy, sběrnice |
| `new Vector3()` ve smyčce | dočasné objekty předem, pooly |
| paprsky proti vykreslovaným meshům | dotazy proti kolizním tvarům |
| pohyb myší násobený `dt` | myš je už posun, `dt` tam nepatří |
| klávesy podle `event.key` | `event.code` (rozložení klávesnice) |
| náhodnost přes `Math.random()` v logice | seedovaný generátor, zvlášť pro hru a pro efekty |
| ukládání „co půjde“ přes `JSON.stringify` | `snapshot/restore` po systémech, verze formátu |
| zvuk přes `new Audio()` na každý výstřel | Web Audio, buffery, omezení počtu hlasů |
| čísla velikostí a výkonu z hlavy | změřit a zapsat |
| tisíc objektů = tisíc meshů | instancování |
| „dodělám testy potom“ | test ve stejné iteraci |
| nová funkce na neuzavřeném základu | nejdřív zelené testy, pak další krok |
