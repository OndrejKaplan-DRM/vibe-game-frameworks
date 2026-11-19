# Audit Level 0 — konverzace s Gemini 4.0 Argon (10.–12. 11. 2026)

Zpracováno 19. 11. 2026. Podklad: 7 příloh (Shell v1, Shell v2, Case 1–6, dovětek o GTA).
Ověřování: výpočet (float32/float64, doby letu, brzdné dráhy), web (stav GTA VI, Godot, chování prohlížečů), porovnání s tím, co už běží v Aréně v2.
Značení jistoty u mých oprav: (5/5) ověřeno výpočtem nebo primárním zdrojem, (4/5) silná shoda zdrojů, (3/5) pravděpodobné, ověř před použitím.

---

## 1. Verdikt

Level 0 je **dobrá rešerše herních vzorů zabalená do špatného pracovního postupu**.

Co umí: Gemini pojmenovala správné architektonické vzory skoro ve všech žánrech (plovoucí počátek, tři druhy kolizních boxů, Utility AI, flow field, raycast podvozek) a numerika u Sluneční soustavy sedí na jednotky.

Co neumí: celé to stojí na předpokladu „vlož 2 dlouhé prompty a vygeneruj všechno najednou“. To je přesně ten přepálený start, kterému se chceš vyhnout. Šablona zakazuje slepá tlačítka, ale nemá jediný mechanismus, který by to ověřil. Varuje před plýtváním tokeny na menu, a přitom menu nechává při každém projektu psát znovu. Na konci druhé odpovědi se Gemini sama zeptala, jestli nemá Shell napsat jako hotový soubor `game-shell.js`. To byla správná otázka a zůstala bez odpovědi.

Druhý vzorec: **vymyšlená přesnost**. Čísla jako „62 % méně tokenů“, „10–15 % FPS na Radeonu 660M“, „2 500 řádků a jedno odpoledne“, „12 000 000 řádků C++“ nebo rozpad snímku GTA po desetinách milisekundy nemají zdroj. Vedle poctivě spočítaných hodnot (krok float32 u Saturnu 131 km) působí stejně věrohodně, a to je na tom nebezpečné.

Třetí: v několika bodech je Level 0 **pod úrovní toho, co už máš** v Aréně v2 (registr systémů s kontraktem `init/build/reset/step/frame/snapshot/restore`, nastavení z deklarací, testy přes `__arena2`, rozpočty výkonu). Level 1 proto nestavím na Gemini, ale na zobecnění tvého ověřeného jádra, a z Gemini přebírám žánrové vhledy.

---

## 2. Metriky

| Zkratka | Metrika | Co měří |
|---|---|---|
| **P** | Věcná přesnost | sedí fakta, čísla, názvy API |
| **A** | Architektura | jsou navržené vzory správné a úplné |
| **U** | Použitelnost | dá se podle toho rovnou a bezpečně stavět |
| **K** | Konzistence | shodují se verze, čísla a seznamy mezi sebou |
| **C** | Kalibrace | odlišuje ověřené od odhadu, nevymýšlí přesnost |
| **V** | Vhled | pojmenovává skutečné pasti žánru |

Stupnice 1–5 (5 = nejlepší).

| Výstup | P | A | U | K | C | V | Ø |
|---|---|---|---|---|---|---|---|
| Shell v1 (univerzální prompt) | 3 | 3 | 2 | 3 | 2 | 3 | **2,7** |
| Shell v2 (`GameShell v2.0` + kompakt) | 3 | 4 | 3 | 3 | 2 | 4 | **3,2** |
| Case 1 — FPS | 3 | 3 | 3 | 4 | 3 | 4 | **3,3** |
| Case 2 — Sluneční soustava | 4 | 4 | 3 | 3 | 3 | 5 | **3,7** |
| Case 3 — bojovka | 4 | 4 | 4 | 3 | 4 | 5 | **4,0** |
| Case 4 — život / zkáza / planetka | 3 | 3 | 2 | 2 | 3 | 4 | **2,8** |
| Case 5 — RTS | 4 | 4 | 3 | 4 | 3 | 4 | **3,7** |
| Case 6 — GTA jádro (specifikace) | 3 | 4 | 2 | 3 | 1 | 4 | **2,8** |
| Dovětek o GTA VI | 3 | – | – | 3 | 2 | 4 | **3,0** |
| **Level 0 celkem** | | | | | | | **≈ 3,2** |

Nejlepší výstup je bojovka: tam Gemini opravdu šla proti tvému očekávání („odpočinek“) a měla pravdu. Nejslabší jsou první Shell (monolit) a Case 4 (tři hry v jedné).

---

## 3. Co je dobré a do Level 1 přebírám

1. **Datově řízené menu**: jedna deklarace položek, UI se z ní vykreslí samo, skrytá položka použije výchozí hodnotu.
2. **`ENTITY_REGISTRY` jako jediný zdroj** pro spawner i bestiář.
3. **Zákaz slepých ovládacích prvků** jako princip (v L1 dostává test).
4. **Attract mode jako stav téhož enginu.** Je to víc než ozdoba: hra, která umí běžet sama bez hráče, má oddělené řízení od světa.
5. **Ukládání přes čistá data**, obnova přes registr, nikdy `JSON.stringify` na scénu.
6. **Náhled**: vykreslit a sejmout v téže úloze, zmenšit na 320×180.
7. **Pauza řízená událostí `pointerlockchange`**, ne klávesou.
8. **CAD/blueprint režim přes `EdgesGeometry`** jako diagnostika i styl.
9. **Rozdíl web × engine**: „editor-centric trap“ je skutečná a dobře pojmenovaná past.
10. **Sluneční soustava**: rozbor float32, plovoucí počátek, 64bitová pravda na CPU, časová komprese, přiznané zvětšení těles s návratem na 1:1.
11. **Bojovka**: zákon celých snímků, Pushbox ≠ Hurtbox ≠ Hitbox, relativní směry ve vstupním bufferu, hitstop, přetlak v rohu, zákaz fyzikálního enginu, páska vstupů a frame meter.
12. **Utility AI a „reklamy“ objektů**, mřížka buněk v typovaných polích, instancování.
13. **RTS**: flow field na rozkaz, separace přes prostorový hash, třístavová mlha.
14. **GTA**: oddělení řízení od těla (possession), raycast podvozek, bublina dopravy, eskalační automat.
15. **Dělení na hry soustředěné na hráče a na systém** (Case 4 úvod).
16. Přirovnání **JCVI-syn3.0 × člověk** k rozdílu prototyp × AAA hra.

---

## 4. Systémové vady (táhnou se všemi výstupy)

**S1 — Prompt místo kódu.** Shell je text, který má model pokaždé znovu přepsat do tisíců řádků. Správně je Shell knihovna v repu a prompt na ni jen odkazuje.

**S2 — Všechno najednou.** Žádné milníky, žádné akceptační podmínky, žádné testy. „Žádné `// TODO`“ bez ověření vede k tomu, že model nedodělky schová, ne že je nenapíše.

**S3 — Chybí kontrakt Shell ↔ hra.** Shell podle L0 sahá přímo na `renderer.setPixelRatio`, `camera.fov`, fyziku. Každá hra se pak drátuje ručně a Shell nejde přenést.

**S4 — Vymyšlená přesnost** (viz verdikt). U každého čísla bez zdroje předpokládej odhad.

**S5 — Data z paměti modelu.** „Exaktní tabulka NASA JPL“ pro 35 těles a „kompaktní katalog“ dalších 165 by vznikly halucinací. Totéž katalog hvězd.

**S6 — Více verzí téže pravdy.** Plná a kompaktní šablona se liší (seznam potřeb agentů ve třech verzích, 20 vs. 21 těles, 50R vs. 100R, hitstop 4–8 vs. 5–9, 5 vs. 6 slotů). Tvrzení „100 % požadavků při −62 % tokenů“ tedy neplatí už z principu.

**S7 — Rozbité vnoření kódu.** Blok ```` ```markdown ```` obsahuje další ```` ``` ````, takže se šablona při kopírování rozpadne (v přílohách je to vidět). V L1 používám `~~~`.

**S8 — Slepá místa prohlížeče.** Rozebráno v tabulce níže (F5, Ctrl+W, Ctrl+Shift+D, `~` na české klávesnici, Safari a WebP, prodleva zámku kurzoru, úložiště v iframu). Úplně chybí dotyk, gamepad a velké/rozšířené plochy, přitom tvoje publikum je z velké části na telefonu.

**S9 — Čas se násobí do pevného kroku.** `FIXED_DT * timeScale` ruší smysl pevného kroku.

**S10 — Žádné rozpočty.** Cílový hardware, počet volání kreslení, doba kroku, velikost balíku, paměť, doba startu: nic z toho není definováno.

**S11 — Varianta „engine“ je z poloviny nálepka.** Godot je rozpracovaný, Unity občas zmíněno, Unreal nikde nemá obsah. A „všechno v `_ready()`“ je přestřelené: scény Godotu jsou textové soubory, model je umí psát.

**S12 — Rozcestník neškáluje.** `genreProfile` má 4 hodnoty; RTS dostalo `SIMULATION`, GTA `FPS_ACTION`. Podmíněná logika Shellu podle žánru je tím pro nové casy nedefinovaná.

---

## 5. Věcné chyby a nepřesnosti

### Shell v1 a v2

| # | Tvrzení v L0 | Stav | Oprava | Jistota |
|---|---|---|---|---|
| 1 | WebP 0,4 z Full HD plátna má 15–30 kB | podhodnoceno, neměřeno | herní snímek 1080p vychází řádově na desítky až stovky kB; 320×180 kolem 10 kB je věrohodné; **měř a loguj** | 4/5 |
| 2 | `toDataURL('image/webp')` funguje všude | ne | Safari dlouhodobě vracel potichu PNG; kontroluj prefix výsledku, záloha JPEG (Aréna už JPEG používá) | 4/5 |
| 3 | `preserveDrawingBuffer` stojí 10–15 % FPS na Radeonu 660M | číslo bez zdroje | princip „vykresli a sejmi v téže úloze“ je správný | 5/5 princip |
| 4 | localStorage má tvrdých 5 MB na doménu | přibližně | limit je na origin, liší se, v iframu může chybět úplně; potřebuješ vrstvu úložiště se zálohou | 4/5 |
| 5 | Quicksave na `F5` | kolize | F5 je obnovení stránky; Aréna má F7/F9 | 5/5 |
| 6 | Skrytý DevMode přes `Ctrl+Shift+D` | kolize | v Chromu „přidat všechny karty do záložek“; použij `?dev` v URL nebo vícenásobný klik | 4/5 |
| 7 | Konzole na `~` | závisí na rozložení | na české klávesnici je to klávesa `;`; važ na `event.code === 'Backquote'` | 5/5 |
| 8 | (nezmíněno) | chybí | `Ctrl+W` zavře kartu a nejde zachytit; dřep na Ctrl + chůze na W je v prohlížeči past | 5/5 |
| 9 | 150 ms debounce řeší ESC a zámek kurzoru | neřeší | Chrome po ESC nový zámek ~1,25 s odmítá (v Aréně naměřeno ~2,5 s); „Pokračovat“ musí odmítnutí ustát | 5/5 |
| 10 | Mrtvá zóna (deadzone) v nastavení | placebo | gamepad není nikde specifikován; položka nemá na co působit | 5/5 |
| 11 | Písmo Calibri / Arial Narrow | jen Windows | na Androidu, iOS, Linuxu není; přibal volné písmo (Carlito je metricky shodné s Calibri) | 5/5 |
| 12 | Kompakt má o 62 % méně tokenů a 100 % obsahu | neověřitelné, a neplatí | verze se liší (viz S6) | 5/5 |
| 13 | `backdrop-filter: blur` přes živé plátno | drahé | na integrované grafice se rozmazání přepočítává každý snímek; v pauze vykresli jednou a smyčku zastav | 4/5 |

### Case 1 — FPS

| # | Tvrzení v L0 | Stav | Oprava | Jistota |
|---|---|---|---|---|
| 14 | Rozdělená autorita Octree + Rapier | zbytečně složité | Rapier má kinematický kontrolér postavy (schody, sklon, přichycení k zemi) i paprsky; dvě kopie statického světa jsou dvě pravdy. Ty už jedeš jen na Rapieru | 5/5 |
| 15 | `stepOffset` v Octree | neexistuje | Octree schody neřeší, musel by se dopsat | 4/5 |
| 16 | `FIXED_DT * shell.timeScale` | chyba | při 5× je krok 41,7 ms: raketa 40 m/s skočí o 1,7 m, tunelování; škáluj přísun času do akumulátoru | 5/5 |
| 17 | `airAccelerate = 2.5` jako „Quake/CS“ | ani jedno | bez vzorce `accelerate()` a stropu rychlosti ve vzduchu air-strafe nevznikne | 4/5 |
| 18 | Godot `save_webp(path, false, 0.4)` | chyba | druhý parametr je `lossy`; s `false` se kvalita ignoruje a soubor je bezztrátový | 4/5 |
| 19 | Godot `depth_roughness_texture` | neexistuje | `hint_depth_texture` a `hint_normal_roughness_texture` (druhé jen ve Forward+) | 4/5 |
| 20 | Godot `DEBUG_DRAW_WIREFRAME` stačí přepnout | neúplné | nejdřív `RenderingServer.set_debug_generate_wireframes(true)`, před načtením meshů | 4/5 |
| 21 | Unreal 5 C++ jako volba | bez obsahu | pro vibe-coding přes chat nevhodné (binární assety, Blueprinty, dlouhé překlady) | 4/5 |

### Case 2 — Sluneční soustava

| # | Tvrzení v L0 | Stav | Oprava | Jistota |
|---|---|---|---|---|
| 22 | Krok float32: 16,4 km u Země, 131 km u Saturnu; float64 ~1 mm u Pluta | **správně** | přepočítáno: 16 384 m, 131 072 m, 0,98 mm | 5/5 |
| 23 | 0,1c = 29 979 km/s, 499,65 km za snímek, γ = 1,005, Měsíc 12,8 s, Titan 11 h | **správně** | | 5/5 |
| 24 | Mars v opozici 26 min | nepřesné | 30 min při nejtěsnějším přiblížení (54,6 mil. km), běžná opozice ~43 min, nejdál 3,7 h | 5/5 |
| 25 | Soustava „po Sednu“ měří ~10¹³ m | o řád vedle | Eris v odsluní 1,46·10¹³ m, Sedna ~1,4·10¹⁴ m | 4/5 |
| 26 | Dopplerův posuv ±10,5 % | nesymetrické | vpřed +10,6 %, vzad −9,5 % | 5/5 |
| 27 | Terminální rychlost člověka na Titanu ~7 m/s | podhodnoceno | škálováním √(g/ρ) z 54 m/s vychází ~9,6 m/s; Mars stejným postupem ~260 m/s | 4/5 |
| 28 | Gravitace, hustoty, tlaky, sluneční konstanty tří světů | **správně** | Mars 586 W/m², Saturn 14,8 W/m² přepočítáno | 5/5 |
| 29 | Automatická brzda `v = min(0,1c; 0,8·(D−R))` při `D < 100R` | chyba | pro tělesa s R < ~375 km (většina z 200) limit při zapnutí skokem spadne (R = 150 km: z 29 979 na 11 880 km/s); v úvodu je navíc 50R. Chybí test protnutí úsečky s koulí | 5/5 |
| 30 | „Exaktní tabulka JPL“ vypsaná modelem | metodická chyba | data se stahují a validují, model píše jen importér | 5/5 |
| 31 | Seznam 21 „největších měsíců a planetek“ | nekonzistentní | dvě verze s jinými členy; Phobos (22 km) a Deimos mezi 200 největších nepatří | 5/5 |
| 32 | Orientace přes `axialTiltDeg` | nestačí | sklon neurčuje směr osy v prostoru; potřebuješ pól (α₀, δ₀) a rotaci W(t) podle IAU | 5/5 |
| 33 | Keplerovy elementy pro vše | nestačí pro Měsíc | zatmění vyžadují poruchové členy nebo tabelovanou efemeridu | 4/5 |
| 34 | „Kraken Mare / Huygens Site“ | dvě různá místa | Kraken Mare je kolem 68° s. š., Huygens přistál poblíž rovníku na suché pláni | 4/5 |
| 35 | Titan: intenzita světla 0,15 (web) vs. 0,05 (engine) vs. 0,1 % skutečnost | bez modelu expozice | rozdíl jasu 1000× řeší expozice, ne ruční intenzity | 4/5 |
| 36 | Godot: `VolumetricFog`, logaritmický buffer | neplatí plošně | objemová mlha je jen ve Forward+, webový export Godotu běží v režimu Compatibility; Godot má od 4.3 obrácený Z-buffer sám | 4/5 |
| 37 | Prahy přechodu na povrch 50 / 10 / 20 km, přelet 2,0 / 2,5 s | nekonzistentní | jedno číslo v datech | 5/5 |
| 38 | (nezmíněno) | chybí | krok float32 na poloměru Země je 0,5 m: plocha 1 km² nemůže být tentýž mesh jako glóbus | 5/5 |
| 39 | (nezmíněno) | chybí | brzdění z 0,1c při 10 g trvá 3,5 dne a 31 AU; „autentická fyzika“ a „0,1c mezi planetami“ se vylučují, pohon je nutné přiznat jako kinematický | 5/5 |

### Case 3 — bojovka

| # | Tvrzení v L0 | Stav | Oprava | Jistota |
|---|---|---|---|---|
| 40 | `1 frame = 1/60 s * shell.timeScale` | rozpor se zákonem celých snímků | zpomalení = méně tiků za sekundu, tik zůstává celý | 5/5 |
| 41 | „Rollback-ready“ stav | s floaty ne | pozice v celých sub-pixelech, žádné `Math.sin` v logice | 4/5 |
| 42 | (nezmíněno) | chybí | pravidlo „jeden úder zasáhne cíl jednou“; bez něj zásah padá v každém aktivním snímku | 5/5 |
| 43 | DNA „MKII / UMK3“ + special cancel + overhead/low | míchá éry | klasické MK I–II je podle mého nejlepšího vědomí bez přerušování do speciálů a bez high/low mixupu (blok tlačítkem); rozhodni profil vědomě | 3/5 |
| 44 | Teleport `D, B, HK` | drobnost | v MKII Scorpion `D, B, HP`; kopí, led a torpédo sedí | 4/5 |
| 45 | (nezmíněno) | chybí | dva hráči na jedné klávesnici narazí na ghosting kláves; chybí čištění protisměrů (SOCD) | 5/5 |
| 46 | Procedurální kloubové rigy v Canvasu | jde proti tvé zkušenosti | vektorový vzhled už jsi jednou odmítl; cesta k „digitalizovanému“ vzhledu vede přes předrenderované sprity | 4/5 |

### Case 4 — život, zkáza, planetka

| # | Tvrzení v L0 | Stav | Oprava | Jistota |
|---|---|---|---|---|
| 47 | Orientace na kouli: `setFromUnitVectors(Y, normála)` | lék má vlastní singularitu | ztrácí směr pohledu a na jižním pólu se láme; správně je přírůstkové zarovnání z minulého „nahoru“ na nové | 5/5 |
| 48 | Godot: `Area3D` bodová gravitace + `up_direction` a postava chodí sama | neúplné | gravitace oblasti působí na `RigidBody3D`, `CharacterBody3D` ji musí dostat ručně a bázi je třeba otáčet | 4/5 |
| 49 | Potřeby agentů | tři různé seznamy | 5, 6 a jiných 6; interval rozhodování 1 s vs. 2 s | 5/5 |
| 50 | Oliverova planetka = arkáda s dinosaurem | chybná klasifikace | Gemini neznala projekt; je to středověká planetka s vesnicemi a obyvateli, tedy simulace života na kouli. Tvoje námitka byla správná | 5/5 |
| 51 | `HYBRID_SANDBOX` (vše v jednom) | rozsahová past | tři hry se staví po sobě, každá jako samostatně dodatelný milník | 5/5 |
| 52 | (nezmíněno) | chybí | celulární automat potřebuje dvojí buffer, jinak se oheň šíří podle pořadí průchodu polem | 5/5 |

### Case 5, Case 6 a dovětek o GTA

| # | Tvrzení v L0 | Stav | Oprava | Jistota |
|---|---|---|---|---|
| 53 | RTS: flow field, prostorový hash, 3 stavy mlhy | **správně** | výhrada jen k rozsahu jednoho promptu (ekonomika + hrdinové + AI velitel + mlha) | 4/5 |
| 54 | Jádro GTA má ~2 500 řádků a postavíš ho za odpoledne | přehnané | specifikace 6A sama vyjmenovává 3 těla, 5 zbraní, model poškození, město, semafory, dopravu, chodce, 5 stupňů policie, minimapu a Shell; reálně řád 10–20 tisíc řádků a týdny iterací | 4/5 |
| 55 | „92 % práce není programování“, 500 000 modelů, 12 mil. řádků C++ | bez zdroje | Rockstar počty řádků nezveřejňuje | 5/5 |
| 56 | Vydání 19. 11. 2026, preload od 12. 11., PC neoznámeno, GamesBeat: PC v 1. čtvrtletí 2027 | **správně** | potvrzeno zdroji | 5/5 |
| 57 | Rozpočet snímku 16,67 ms (60 FPS) | chybná premisa | konzolová verze cílí na 30 FPS, tedy 33,3 ms | 5/5 |
| 58 | Rozpad snímku 1,5 + 2,5 + 3,0 + 8,0 + 1,6 ms | vymyšleno | fáze navíc běží souběžně, ne za sebou | 4/5 |
| 59 | RenderWare → EA 2004 → vlastní RAGE, první Table Tennis 2006, Euphoria od NaturalMotion | **správně** | | 5/5 |
| 60 | „RAGE 9“ | neoficiální označení | Rockstar generace enginu veřejně nečísluje | 3/5 |
| 61 | Zdroje (g2a.com, tinyfish.ai, flowup.shop, xfar.org) | slabé | e-shopy a SEO blogy; odkazované „interaktivní schéma“ v textu není | 5/5 |

---

## 6. Level 0 → Level 1: co se mění

| Oblast | Level 0 | Level 1 |
|---|---|---|
| Podoba Shellu | prompt, pokaždé znovu generovaný | knihovna v repu + krátké zadání |
| Vazba Shell ↔ hra | Shell sahá do enginu | kontrakt adaptéru, hra se hlásí sama |
| Slepé prvky | zákaz slovem | každá položka má `apply` a `probe`, test je projde |
| Skrývání položek | ruční přepínače | hra deklaruje, co umí; co neumí, se nevykreslí |
| Postup | jeden výstřel | milníky M0–M5, jedna novinka na iteraci |
| Ověření | žádné | akceptační testy u každého casu, rozpočty |
| Čas | násobení `dt` | škálování přísunu času, krok pevný |
| Data | z paměti modelu | ze zdrojů, s validací a datem stažení |
| Engine | „všechno v `_ready()`“ | text-first, Godot jako hlavní, Unreal otevřeně odmítnut |
| Žánry | výčet ve Shellu | profil = sada schopností, nový žánr Shell nemění |
| Arkáda | chybí | samostatný case a zároveň zkušební hra Shellu |
| Požadavky | v hlavě a v chatu | `REQUIREMENTS.md` s čísly a stavem |

---

## 7. Zdroje ověření

- Výpočty: `numpy.spacing` pro float32/float64, doby letu, brzdné dráhy, škálování terminální rychlosti (skript v pracovní složce sešny).
- GTA VI, datum a preload: fox10tv.com (15. 10. 2026), gtaboom.com, techradar.com.
- GTA VI, PC verze: gameluster.com, digitaltrends.com (zpráva GamesBeat o 1. čtvrtletí 2027), bloxodes.com.
- GTA VI, 30 FPS: techradar.com, tweaktown.com, pushsquare.com, hwbusters.com.
- Godot 4.7 (stabilní 18.–19. 6. 2026, aktuálně 4.7.2, web jen WebGL 2): phoronix.com, linuxiac.com, app.cinevva.com, ziva.sh.
- Godot obrácený Z-buffer od 4.3: godotengine.org/article/introducing-reverse-z. Jolt výchozí u nových projektů od 4.6: docs.godotengine.org.
- Safari a WebP z plátna: bugs.webkit.org #226950, yomotherboard.com (12. 11. 2026).
- Zámek kurzoru po ESC: specifikace Pointer Lock (citace na discourse.threejs.org), MDN, discourse.threejs.org (1,25 s v Chromu).
- three.js `reversedDepthBuffer` a cena logaritmického bufferu: threejs.org/docs, discourse.threejs.org.

Neověřeno (ber jako 3/5): konstanty pohybu CS a Half-Life, pravidla bloku v klasickém MK, přesná dostupnost `hint_normal_roughness_texture` podle rendereru, čísla velikostí WebP.
