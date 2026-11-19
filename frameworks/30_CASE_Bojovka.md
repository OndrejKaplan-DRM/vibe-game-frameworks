# Case 30 — 2D bojovka (styl Mortal Kombat)

Předpoklad: `01_CORE` a `02_SHELL`. Z Level 0 je tohle nejlépe zvládnutý žánr; přebírám jeho kostru a doplňuju, co chybělo (determinismus v celých číslech, pravidlo jednoho zásahu, vstup dvou hráčů, výroba grafiky).

---

## 1. Rozsah

**Je:** souboj jeden na jednoho, hráč proti AI nebo dva hráči u jednoho stroje, kola, speciální údery, dorážka, tréninkový režim.
**Není:** síťová hra (ale stav je na ni připravený), příběhový režim, 3D aréna.

**Jádro jednou větou:** *čtu soupeře a trefím ho o snímek dřív.*

**První MVP:** 2 bojovníci, 1 aréna, trénink. Víc až po něm.

---

## 2. Invarianty

**B1 — Čas je celý snímek.** Logika běží po ticích 1/60 s. Funkce `tick(stav, vstupy)` nemá parametr `dt`. Zpomalení a zrychlení mění počet tiků za sekundu, krokování je jeden tik. Všechny délky v datech jsou celá čísla snímků.

**B2 — Celá čísla i v prostoru.** Pozice a rychlosti v celých setinách pixelu, žádné `Math.sin` ani dělení s desetinným výsledkem v logice. Stejné vstupy pak dají stejný zápas na každém stroji.

**B3 — Stav je prostý datový objekt.**

~~~js
stav = { tik, casovac, kolo,
  p: [ { x, y, vx, vy, smer, zdravi, akce, snimekAkce, hitstop, omraceni, zasazenoId, buffer:[...] }, {...} ],
  strely: [...], krevNaZemi: [...], rng }
~~~

Tady je `JSON.stringify(stav)` v pořádku, protože stav neobsahuje nic než data. Z toho zadarmo: uložení, záznam zápasu (stačí seed a vstupy), přetáčení v tréninku, attract mode z nahrávky, přesné testy.

**B4 — Tři druhy boxů jako data ke každému snímku animace.**

| Box | Počet | Účel |
|---|---|---|
| tělo (pushbox) | 1 | bojovníci neprojdou skrz sebe |
| zranitelné (hurtbox) | 2–3 | hlava, trup, nohy; mění se podle postoje |
| útočný (hitbox) | 0–N | existuje jen v aktivních snímcích úderu |

Boxy jsou vztažené k patě bojovníka a zrcadlí se podle směru. Kreslí se a ladí **nástrojem** v tréninkovém dóju (tažením myší, export do dat), ne odhadem v kódu.

**B5 — Údery jsou data, výhoda se počítá.**

~~~js
{ id: 'vysokyKop', naprah: 7, aktivni: 3, navrat: 14,
  zasah: { skoda: 12, omraceni: 18, odstrk: 600, vyhoz: 0 },
  blok:  { skoda: 1,  omraceni: 11, odstrk: 800 },
  uroven: 'HIGH', hitstop: 6, prerusit: [], zvuk: 'kop2' }
// výhoda při bloku (zásah prvním aktivním snímkem) = blok.omraceni − (aktivni − 1) − navrat
~~~

Výhodu v tabulce nepíšeš ručně; nástroj ji spočítá a zobrazí. Když nesedí s návrhem, mění se data.

**B6 — Pevné pořadí v ticku.**
1. vstupy do bufferů (relativní směry)
2. brána hitstopu (při hitstopu se jen čte vstup)
3. přechody stavů, start úderů
4. pohyb
5. vytlačení těl, stěny, přetlak v rohu
6. zásahy obou směrů nad stejným snímkem stavu → seznam zásahů
7. uplatnění zásahů (oboustranná výměna je možná)
8. otočení čelem, kde je to dovoleno
9. časovače, konec kola

**B7 — Jeden úder zasáhne cíl jednou.** Každé spuštění úderu má identifikátor; cíl si pamatuje poslední, který ho zasáhl. Vícenásobné zásahy se zadávají výslovně jako skupiny. Bez toho padne zásah v každém aktivním snímku.

**B8 — Vstup.**
- Vzorkuje se jednou za tik, podle `event.code`.
- Buffer posledních 60 tiků, směry relativně k soupeři (`vpřed`, `vzad`), aby sekvence fungovaly po přeskočení.
- Čištění protisměrů: vlevo + vpravo = nic.
- Tolerance: okno mezi kroky sekvence (cca 10–14 snímků), krátká paměť stisku tlačítka (cca 5 snímků).
- **Dva hráči na jedné klávesnici:** běžné klávesnice nepřenesou libovolnou kombinaci současně stisknutých kláves. Do stránky ovládání dej zkoušečku, která ukáže, kolik kláves naráz dorazí, a podporu gamepadu.

**B9 — Profil mechanik je vědomá volba.**

| | KLASIK (duch MK I–II) | MODERNÍ |
|---|---|---|
| blok | tlačítkem | tlačítkem nebo držením vzad |
| vysoký/nízký/overhead mixup | ne | ano |
| přerušení úderu do speciálu | ne | ano |
| základní údery | společné všem, liší se speciály | vlastní pro každého |
| práce na datech | malá | velká |

Level 0 pod hlavičkou „MKII“ popsal moderní profil. Pro tvůj záměr dává smysl KLASIK: jedna sada základních úderů a pár speciálů na bojovníka. (Popis klasických pravidel ber s jistotou 3/5 a ověř na originálu.)

**B10 — Grafika je oddělená od logiky identifikátorem snímku.** Logika zná `snimekAnimace`, ne obrázek. Vzhled jde vyměnit bez zásahu do boje:
1. zástupné figury (kapsle s boxy) pro M1–M2,
2. **předrenderované sprity z 3D modelu** (Blender, pevná kamera, jeden rig pro všechny snímky): dává „digitalizovaný“ dojem devadesátých let a stejné proporce v každém snímku,
3. ruční doladění klíčových snímků.

Procedurální kloubové figury kreslené kódem dávají vektorový vzhled; ten už jednou nevyhovoval.

**Paměť spritů si spočítej předem:** snímek 400×500 px v RGBA je 0,8 MB; 150 snímků na bojovníka je 120 MB v grafické paměti. Proto ořez na obsah, atlasy, zrcadlení místo druhé sady, načítání jen dvou bojovníků zápasu.

**B11 — AI hraje přes stejné vstupy.** Čte stav, vyrábí stisky jako hráč, s reakční dobou ve snímcích a mírou chyb podle obtížnosti. Nesmí reagovat na vstup hráče v témže ticku.

**B12 — Zpětná vazba zásahu je součást dat úderu:** hitstop, třes, zvuk v témže ticku, částice, stopy na zemi do samostatného plátna.

**B13 — Vykreslení je čtenář stavu.** Pevné logické rozlišení (např. 1920×1080) škálované do okna s okraji.

**B14 — Vlastní postavy a jména.** Hra v duchu žánru ano, kopie cizích postav ne.

---

## 3. Amatérismy tohoto žánru

| Příznak | Místo toho |
|---|---|
| časování úderů přes `setTimeout` nebo milisekundy | B1 |
| jeden obdélník na postavu | B4 |
| úder zasáhne pětkrát | B7 |
| sekvence přestanou fungovat po přeskočení | B8 relativní směry |
| útočník zatlačí soupeře v rohu donekonečna | B6 krok 5 |
| současný zásah vyhraje ten, kdo je první v poli | B6 krok 6 |
| fyzikální engine a jeho signály pro zásahy | vlastní průniky obdélníků |
| boxy „od oka“ v kódu | nástroj v dóju |
| výhoda při bloku opsaná ručně | B5 výpočet |
| AI, která čte tvoje tlačítka | B11 |
| nejdřív deset bojovníků, potom boj | MVP 2 + 1 |

---

## 4. Milníky

| Milník | Obsah | Hotovo, když |
|---|---|---|
| M1 | dvě kapsle, chůze, skok, dřep, 3 základní údery z dat, boxy viditelné, krokování | T1–T4 |
| M2 | zdraví, blok, omráčení, hitstop, roh, kolo, výhra; záznam a přehrání | T5–T7 |
| M3 | vstupní buffer, 2 speciály na bojovníka, střela, AI protivník | T8, T9 |
| M4 | dójo: editor boxů, tabulka dat, měřič snímků, páska vstupů | změna boxu bez zásahu do kódu |
| M5 | grafika z předrenderovaných spritů, zvuk, hlasatel, dorážka, aréna | paměťový rozpočet |

---

## 5. Varianta A — web (Canvas 2D nebo WebGL)

- `tick()` je čistý modul bez přístupu k DOM; vykreslení a zvuk ho jen čtou.
- Sprity v atlasech, kreslení `drawImage` s ořezem; při mnoha vrstvách WebGL.
- Krev a stopy do zvláštního plátna podlahy, které se jen překresluje přes pozadí.
- Balení pro Windows rozhodni v kartě projektu (obal kolem webové verze, nebo varianta B).

## 6. Varianta B — engine (Godot 4.7)

- Logika v čistých třídách s celými čísly, volaná z `_physics_process` při 60 ticích.
- **Žádné** `RigidBody2D`, `CharacterBody2D` ani signály `area_entered` pro boj. Průniky přes vlastní obdélníky.
- Engine slouží jako vykreslovač, zvuk, vstup (`physical_keycode`) a export.
- Kreslení boxů přes `_draw()`.

Rozdíl proti arkádě (case 40): tam je fyzika enginu v pořádku, tady ne. Stejné 2D, opačný závěr, protože tady rozhoduje jeden snímek.

---

## 7. Napojení na Shell

- **Akce (pro dva hráče):** směry, vysoký/nízký úder, vysoký/nízký kop, blok.
- **Katalog** = soupiska bojovníků a laboratoř snímků: přehrání úderu, posuvník po snímcích, boxy, tabulka (škoda, úroveň, nápřah, aktivní, návrat, výhoda při bloku a zásahu).
- **Vývojář / trénink:** páska vstupů, měřič snímků pro oba hráče (nápřah, aktivní, návrat, omráčení, nezranitelnost), krok o tik, nekonečné zdraví, záznam a přehrání figuríny, pohled „výkres“ s pravítkem vzdáleností.
- **Uložení:** celý `stav` + seed.
- **Attract:** přehrávání nahraných zápasů nebo AI proti AI.
- **Tón `kid`:** bez krve a dorážek, komiksové efekty.

---

## 8. Akceptační testy

| # | Test | Podmínka |
|---|---|---|
| T1 | každý úder z dat | délka = nápřah + aktivní + návrat; útočný box jen v aktivních snímcích |
| T2 | úder s 3 aktivními snímky do stojícího cíle | právě jeden zásah |
| T3 | oba udeří tak, že aktivní snímky padnou na stejný tik | oba dostanou zásah |
| T4 | dřep pod vysokým úderem | bez zásahu |
| T5 | zásah v rohu | odstrk se přenese na útočníka |
| T6 | záznam vstupů → přehrání | otisk koncového stavu shodný |
| T7 | výhoda při bloku z nástroje | shodná s měřením v simulaci |
| T8 | sekvence speciálu z obou stran | funguje stejně |
| T9 | 10 000 tiků náhodných vstupů | žádné `NaN`, pozice v aréně, těla se na konci tiku nepřekrývají |

---

## 9. Zadání k vložení (M1)

~~~text
Projekt: 2D bojovka, case 30, varianta A. Platí 01_CORE, 02_SHELL, 30_CASE.
Iterace: M1. Kostra a Shell existují.
Udělej POUZE: modul fight/tick.js (čistá funkce nad datovým stavem, invarianty B1–B7, celá čísla),
data tří základních úderů a boxů, vykreslení dvou zástupných figur s viditelnými boxy
(tělo modře, zranitelné zeleně, útočné červeně), krokování po ticích, ovládání dvou hráčů podle event.code.
Nedělej: zdraví, blok, speciály, AI, grafiku postav, zvuk.
Hotovo, když projdou T1–T4. Profil mechanik: KLASIK.
~~~

---

## 10. Zamyšlení

### Konzilium pěti expertů

- **Návrhář soubojů:** „Hra je tabulka snímků. Kdo ji nemá před očima, ladí naslepo. Výhoda při bloku rozhoduje, čí je tah.“
- **Programátor jádra:** „Celá čísla a čistá funkce tiku. Za odměnu máte záznamy, testy na bit přesné a jednou možná i síť.“
- **Animátor:** „Nápřah prodává sílu, návrat prodává risk. A boxy se nemají krýt s obrázkem přesně; zranitelná zóna menší než postava působí férověji.“
- **Programátor AI:** „Soupeř, který reaguje ve stejném snímku, je podvodník. Dejte mu reakční dobu a občasnou chybu, bude působit lidsky.“
- **Soutěžní hráč:** „Poznám hru podle zpoždění vstupu a hitstopu. Když úder nezastaví čas na pár snímků, nemá váhu.“

Spor: animátor chce plynulé mezisnímky, programátor celé snímky. Závěr: logika po ticích, vykreslení může mezi pózami prolínat, ale boxy se řídí tikem.

### FAQ

1. **Proč ne fyzikální engine?** Jeho zpracování kolizí má vlastní pořadí a zpoždění; tady rozhoduje jeden snímek.
2. **Kolik bojovníků na začátek?** Dva. Druhý může být první s jinými speciály.
3. **Jak udělat úder „těžký“?** Hitstop 5–8 snímků, třes, zvuk ve stejném ticku, odstrk.
4. **Proč mi nejde speciál po přeskočení?** Směry v bufferu musí být relativní k soupeři.
5. **Jak nakreslit postavy?** Zástupné figury, potom předrenderované sprity z 3D modelu.
6. **Dva hráči na jedné klávesnici?** Jde to, ale ověř zkoušečkou, kolik kláves naráz klávesnice přenese; nabídni gamepad.
7. **Jak ukládat?** Celý stav je datový objekt; uložení je jeho kopie.
8. **Jak ladit boxy?** Nástrojem v dóju s krokováním, ne v kódu.
9. **Klasická, nebo moderní pravidla?** KLASIK je menší a bližší MK I–II; rozhodni před M1.
10. **Engine, nebo web?** Obojí funguje; rozhoduje balení a to, v čem se ti lépe testuje.

### 5× proč

Problém: údery nemají váhu a hra působí jako parodie.
1. Proč? Zásah nemá okamžitou zpětnou vazbu a časování je rozmazané.
2. Proč? Animace, kolize a zvuk běží každý podle svého času.
3. Proč? Hra nestojí na celých snímcích jako jediné jednotce.
4. Proč? Byla pojata jako obecná 2D arkáda.
5. Proč? Nebyl rozpoznán zákon žánru: čas je diskrétní a data úderů jsou návrh hry.

Kořen: špatně zvolený model času. Lék: B1, B5, B12 od prvního milníku.

### Mentální modely

- **Occamova břitva:** profil KLASIK, společné základní údery, obdélníky místo polygonů.
- **První principy:** bojovka = dva stavové automaty + tabulka snímků + průniky obdélníků.
- **Inverze:** jak ji zkazit? Milisekundy, jeden box, fyzikální engine, AI čtoucí vstupy.
- **Druhý řád důsledků:** každý nový bojovník násobí práci na boxech a vyvážení; každý nový mechanismus (přerušení, žonglování) mění hodnotu všech dosavadních úderů.

### ELI20

V bojovce se nepočítá na sekundy, ale na snímky, kterých je šedesát za sekundu. Každý úder má tři fáze: nápřah, kdy ještě nezraňuje, pár aktivních snímků, kdy zraňuje, a návrat, kdy jsi odkrytý. Kolem postav jsou neviditelné obdélníky: jedny říkají, kde tě lze trefit, druhé, kde právě trefuješ. Když se červený obdélník jednoho potká se zeleným druhého, je to zásah a hra se na okamžik zastaví, aby rána měla váhu. Celé umění je v tabulce těch čísel; grafika přijde až potom.
