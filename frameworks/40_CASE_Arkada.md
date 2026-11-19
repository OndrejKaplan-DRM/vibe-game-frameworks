# Case 40 — arkáda (běžec, sběrač)

Předpoklad: `01_CORE` a `02_SHELL`.

Level 0 arkádu jako samostatný case nemá; dinosaura schoval do simulace života. Je to přitom nejlepší první projekt: malý rozsah, okamžitá zpětná vazba a ideální **zkušební hra pro Shell**. Doporučuju ji postavit jako první a Shell na ní dotáhnout.

---

## 1. Rozsah

**Je:** jedna obrazovka nebo nekonečný běh, jedno až dvě slovesa (skok, úhyb), sbírání, vyhýbání, skóre.
**Není:** plošinovka s levely a editorem, příběh, inventář.

**Jádro jednou větou:** *skočím ve správnou chvíli a ono to cinkne.*

Dvě podoby se stejnými invarianty: **běžec** (svět ujíždí, hráč skáče) a **sběrač** (hráč se volně pohybuje po ploše).

---

## 2. Invarianty

**A1 — Skok se navrhuje výškou a časem, ne gravitací.**

~~~js
// návrhové veličiny: výška skoku h, čas do vrcholu t
const g  = 2 * h / (t * t);      // např. h = 1,2 m, t = 0,35 s → g = 19,6 m/s²
const v0 = 2 * h / t;            //                              → v0 = 6,86 m/s
~~~

Tři drobnosti, které dělají rozdíl mezi „hranatým“ a příjemným skokem:
- **proměnná výška:** při puštění tlačítka během stoupání se rychlost nahoru zkrátí (např. na polovinu),
- **kojotí čas:** skok jde ještě ~6 kroků po opuštění hrany,
- **paměť stisku:** stisk platí ~6 kroků (včetně kroku stisku) a provede se po dopadu.

Tři upřesnění z prvního použití (arkáda M1):

1. **Minimální výška skoku je také návrhová veličina.** Pouhé ťuknutí (dotyk, malé dítě) musí s rezervou přeskočit nejnižší překážku. Zkrátit skok proto jde až po nastoupání výšky

~~~js
// f = koeficient zkrácení (např. 0,5), hMin = nejnižší skok, h = plný skok
const cutAfterHeight = (hMin - h * f * f) / (1 - f * f);   // h = 1,2, hMin = 1,0, f = 0,5 → 0,93 m
~~~

   Bez toho dá ťuknutí skok kolem 0,4 m a bednu 0,6 m nepřekoná nikdy.

2. **Krok počítej přesně.** Pro stálé zrychlení `y += v·dt − ½·g·dt²; v −= g·dt`. Obvyklé „nejdřív rychlost, potom poloha“ dá při 60 Hz skok o ~5 % nižší, než je navrženo, a test výšky neprojde.

3. **Pořadí v kroku rozhoduje, co „6 kroků“ znamená:** stisk → pohyb → dopad → doplnění kojotího času → skok → odpočty. V tomto pořadí platí stisk 5 kroků před dopadem i skok 6 kroků za hranou.

**A2 — Pevný krok 60 Hz**, pauza při skryté kartě. Bez ní hráč „zemře“, zatímco se dívá jinam.

**A3 — Obtížnost je křivka v datech.** Rychlost, hustota a výběr vzorů jako funkce uběhnuté vzdálenosti, se stropem. Strop rychlosti plyne z reakční doby:

~~~text
čas na reakci = viditelná vzdálenost před hráčem / rychlost
dospělý: ≥ 0,6 s      malé dítě: ≥ 1,2 s
~~~

**A4 — Překážky ze vzorů, ne z čisté náhody.** Knihovna vzorů (pole `{odstup, typ}`), generátor je skládá. Každý vzor je prokazatelně průchozí: mezera ≥ dráha skoku při dané rychlosti + rezerva. Ověřuje to robot v testu, ne dojem.

**A5 — Dva generátory náhody se seedem.** Jeden pro hru (vzory), druhý pro efekty (částice). Přidání efektu pak nezmění průběh hry se stejným seedem.

**A6 — Shovívavé kolize.** Zranitelná oblast hráče menší než obrázek (cca 70 %), oblast sbírání větší (magnet). Kruhy nebo obdélníky, nic složitějšího.

**A7 — Pooly a přesun počátku.** Překážky a částice se recyklují. U nekonečného běhu se po každých N metrech odečte posun od všech poloh, aby souřadnice nerostly. (Stejný princip jako plovoucí počátek ve vesmíru, jen v malém.)

**A8 — Jedno sloveso, tři vstupy.** Klávesa, dotyk kdekoli na obrazovce, tlačítko gamepadu vedou na tutéž akci. První vstup zároveň odemyká zvuk. „Kdekoli“ znamená celou herní plochu včetně okrajů kolem plátna; tlačítko pauzy ze Shellu skok spustit nesmí. Stisk kratší než jeden krok se nesmí ztratit (zapamatuj ho do příštího kroku).

**A9 — Šťáva je součást zadání.** Zvuk sběru se stoupající výškou při sérii, krátké zmáčknutí a natažení postavy při odrazu a dopadu, částice, počitadlo, které poskočí. Na tomhle arkáda stojí víc než na počtu funkcí.

**A10 — Dětský režim je jiná hra, ne jiná barva.**
- žádná prohra, nebo měkká (postavička se oklepe a běží dál),
- rozhraní bez textu pro předčtenáře: ikony, zvuk, hlas,
- cíle dotyku aspoň 48–64 px, jedno tlačítko,
- delší reakční čas (A3), pomalejší růst obtížnosti nebo žádný,
- krátké kolo (2–3 minuty) s jasným koncem a pochvalou,
- nastavení za rodičovskou pojistkou.

**A11 — Skóre a rekord** se ukládají místně; žádné účty.

**A12 — Logické rozlišení a okraje.** Hra počítá v pevných jednotkách a škáluje se do okna; otočení telefonu ji nesmí rozbít. Pevný poměr 16:9 je na telefonu drženém na výšku jen úzký pruh: rozhodni předem, jestli hra požádá o otočení, nebo na výšku ukáže užší výřez světa.

**A13 — Assety s licencí** (volné sady CC0) zapsané v `DATA_SOURCES.md`.

---

## 3. Amatérismy tohoto žánru

| Příznak | Místo toho |
|---|---|
| gravitace a síla skoku laděné pokusem | A1 |
| skok „nebere“ těsně u hrany | kojotí čas, paměť stisku |
| nepřekonatelná kombinace překážek | A4 + robot |
| hra běží dál na skryté kartě | A2 |
| po deseti minutách se obraz třese | A7 přesun počátku |
| kolize přesně podle obrázku | A6 |
| dětský režim = jen jiné barvy | A10 |
| každá překážka nový objekt | pooly |
| zvuk až „nakonec“ | A9 od M1 |

---

## 4. Milníky

| Milník | Obsah | Hotovo, když |
|---|---|---|
| M1 | postava, skok podle A1 se třemi drobnostmi, jedna překážka, jeden předmět, zvuk sběru | T1, T2; dvě minuty tě to baví |
| M2 | vzory, křivka obtížnosti, skóre, konec a nové kolo, rekord | T3, T4 |
| M3 | další překážky a předměty z dat, atlas zvířátek / předmětů v katalogu | nový předmět = data |
| M4 | dětský režim, dotyk, gamepad | T6 |
| M5 | šťáva, hudba, attract mode, publikace | rozpočty, 3 rozlišení |

Shell tu staví kroky S0–S4 souběžně (viz `02_SHELL` oddíl 11).

---

## 5. Varianta A — web (Canvas 2D)

- Canvas 2D stačí; WebGL až při stovkách částic.
- Vrstvy pozadí s paralaxou jako opakované pruhy.
- Sprity v jednom atlasu.

## 6. Varianta B — engine (Godot 4.7)

- Tady je fyzika a signály enginu v pořádku: `CharacterBody2D`, `Area2D` pro sběr, `AnimatedSprite2D`.
- Skok podle A1 stejně, engine gravitaci nenavrhne za tebe.
- Dobrý první projekt na seznámení s enginem; data vzorů a křivek sdílej s webovou verzí.

---

## 7. Napojení na Shell

Lehký profil: adaptér deklaruje jen to, co hra má.

- **Akce:** skok (a případně úhyb), pauza.
- **Nastavení:** hlasitosti, obtížnost / dětský režim, celá obrazovka.
- **Katalog** (volitelný): atlas zvířátek a plodů s velkým obrázkem a zvukem.
- **Vývojář** (`?dev`): boxy, seed, rychlost času, robot, nesmrtelnost.
- **Uložení:** rekord a nastavení; rozehraná hra se u arkády ukládat nemusí.
- **Attract:** robot hraje sám.

---

## 8. Akceptační testy

| # | Test | Podmínka |
|---|---|---|
| T1 | skok z klidu; ťuknutí na jeden krok | výška = h ±2 %, čas do vrcholu = t ±1 krok; ťuknutí dá skok ≥ hMin a bednu jde přeskočit v okně ≥ 12 kroků |
| T2 | stisk 5 kroků před dopadem; skok 5 kroků za hranou | oba se provedou |
| T3 | všechny vzory při nejnižší a nejvyšší rychlosti | robot je projde |
| T4 | stejný seed dvakrát | stejné pořadí překážek, i po přidání efektů |
| T5 | 10 minut běhu robotem | počet objektů stálý, souřadnice omezené |
| T6 | dětský režim, 3 minuty bez vstupu | kolo skončí pochvalou, žádná prohra |
| T7 | skrytí karty na 10 s | po návratu pauza, stav beze změny |
| T8 | snímky 360×640, 1366×768, 1920×1080 | nic se nepřekrývá |

---

## 9. Zadání k vložení (M1)

~~~text
Projekt: arkáda (běžec), case 40, varianta A. Platí 01_CORE, 02_SHELL, 40_CASE.
Iterace: M1, zároveň krok S0 Shellu.
Udělej POUZE: postavu se skokem podle A1 (h = 1,2 m, t = 0,35 s, proměnná výška,
kojotí čas 6 kroků, paměť stisku 6 kroků), jednu překážku, jeden předmět ke sběru se zvukem,
pevný krok 60 Hz, pauzu při skryté kartě, vstup klávesou i dotykem, viditelné boxy v režimu ?dev.
Grafika: barevné obdélníky. Nedělej: vzory, obtížnost, menu navíc, grafiku.
Hotovo, když projdou T1, T2, T7.
~~~

---

## 10. Zamyšlení

### Konzilium pěti expertů

- **Návrhář arkád:** „Prvních třicet sekund rozhoduje. Jedno sloveso, okamžitá odměna, žádný návod.“
- **Programátor pocitu ze hry:** „Kojotí čas a paměť stisku hráč nevidí, jen má pocit, že hra poslouchá. Bez nich si stěžuje na ovládání.“
- **Zvukař:** „Sběr musí cinknout hezky i po sté. Stoupající tón v sérii je nejlevnější odměna, jaká existuje.“
- **Dětský psycholog:** „Malé dítě chce působit na svět a vidět odezvu. Prohra pro něj není výzva, je to konec zábavy.“
- **Tester:** „Robot, který hru dohraje, je lepší než hodina ručního zkoušení. A odhalí nefér vzor dřív než dítě.“

Spor: návrhář chce růst obtížnosti, psycholog žádnou prohru. Závěr: dva režimy se stejným jádrem a různými křivkami (A3, A10).

### FAQ

1. **Proč začít arkádou?** Je malá a prověří celý Shell i postup po milnících.
2. **Jak naladit skok?** Zvol výšku a čas do vrcholu, zbytek spočítej (A1).
3. **Proč je hra nefér?** Náhodné překážky bez ohledu na dráhu skoku; použij vzory.
4. **Jak zrychlovat?** Křivkou se stropem podle reakční doby.
5. **Canvas, nebo WebGL?** Canvas 2D, dokud stačí.
6. **Co s dítětem, které nečte?** Ikony, hlas, jedno tlačítko, žádný text v cestě.
7. **Potřebuju ukládání hry?** Jen rekord a nastavení.
8. **Jak udělat, aby to „žilo“?** Zvuk, pružení postavy, částice, pohyb počitadla.
9. **Jak poznám, že je vzor průchozí?** Robot v testu při nejnižší a nejvyšší rychlosti.
10. **Má smysl engine?** Jako první seznámení s Godotem ano; jinak web stačí.

### 5× proč

Problém: hra je po minutě nudná nebo nefér.
1. Proč? Překážky chodí náhodně: jednou nejdou přeskočit, jindy dlouho nic.
2. Proč? Generátor o skoku nic neví.
3. Proč? Skok byl naladěn čísly gravitace od oka.
4. Proč? Skok a generátor nevycházejí ze stejných návrhových veličin.
5. Proč? Obtížnost nebyla zapsaná jako křivka v datech.

Kořen: chybí společný návrhový základ (výška, čas, reakční doba). Lék: A1, A3, A4.

### Mentální modely

- **Occamova břitva:** jedno sloveso. Druhé přidej, až první baví.
- **První principy:** arkáda = vstup → okamžitá odezva → odměna, ve smyčce pod dvě sekundy.
- **Inverze:** jak ji zkazit? Zpožděná odezva, nefér smrt, ticho, text před první hrou.
- **Druhý řád důsledků:** zrychlování zkracuje reakční čas a mění, které vzory jsou průchozí; každá nová překážka potřebuje nový běh robota.

### ELI20

Arkáda je nejkratší možná smyčka: něco zmáčkneš, hned se něco stane a je to příjemné. Skok se nenastavuje gravitací, ale tím, jak vysoko a za jak dlouho má postava vyskočit; zbytek je vzoreček. Hra ti tajně pomáhá: uzná skok o chlup pozdě i o chlup dřív, takže máš pocit, že ovládání sedí. Překážky nejsou náhodné, skládají se z ověřených kousků, které zvládne projít i testovací robot. A pro malé děti se nevypíná obtížnost, staví se jiná hra, ve které se nedá prohrát.
