# Case 50 — planetka a simulace života (Oliverova planetka · „Sims“ · středověk · zkáza světa)

Předpoklad: `01_CORE` a `02_SHELL`.

Level 0 tu spojil tři hry do jedné specifikace s režimem „vše v jednom“. Architektonické vhledy jsou dobré (Utility AI, mřížka buněk, instancování), ale rozsah je past. Tady je totéž rozložené do vrstev, z nichž každá jde dodat samostatně.

---

## 1. Rozsah a vrstvy

**Jádro jednou větou:** *dívám se na malý svět, který žije i beze mě, a můžu do něj vstoupit.*

| Vrstva | Co přidává | Samostatně hratelné jako |
|---|---|---|
| **1 Chůze po kouli** | planetka, hrdina, kamera, sběr | arkáda na kouli |
| **2 Život** | obyvatelé s potřebami, chytré objekty, den a noc | pozorovací simulace |
| **3 Vstup do postavy** | pohled očima obyvatele nebo zvířete, převzetí řízení | prohlídka světa |
| **4 Zásahy shora** (volitelné) | počasí, oheň, voda, události | „boží“ pískoviště |

Pořadí je závazné. Vrstva 4 bez hotové vrstvy 2 nemá na co působit.

**Není:** tři hry spuštěné naráz od prvního dne; věrná klimatická nebo epidemiologická simulace (jde o model na hraní a tak ho označ).

---

## 2. Invarianty

**P1 — Svět jsou data, obraz je pohled.** Stav = buňky + agenti + stavby. Simulace běží pomalu (5–10 kroků za sekundu), vykreslení 60× za sekundu polohy agentů prolíná. Zrychlení simulace = víc kroků, ne delší krok. Výsledek po stejném herním čase je pak stejný při 1× i 100×.

**P2 — Orientace na kouli přírůstkově.** Lék z Level 0 (`setFromUnitVectors(osaY, normála)`) zahazuje směr pohledu a na opačné straně planetky se láme. Správně:

~~~js
// v každém kroku pro každého chodce (a stejně pro kameru)
upNew.copy(pos).normalize();
qAlign.setFromUnitVectors(upOld, upNew);      // malé pootočení mezi dvěma kroky
actor.quaternion.premultiply(qAlign);         // směr pohledu zůstane zachován
upOld.copy(upNew);

// zatáčení: otočení kolem místního „nahoru“
actor.quaternion.premultiply(qYaw.setFromAxisAngle(upNew, dYaw));

// krok vpřed: po tečně, pak zpět na povrch
pos.addScaledVector(forwardTangent, speed * dt).setLength(R + vyskaTerenu(pos));
~~~

Tíha míří do středu; globální gravitaci fyzikálního světa vypni a dodávej ji tělesům sama. Kontrolér postavy v Rapieru umí nastavit vlastní směr „nahoru“ (ověř název metody ve své verzi).

**P3 — Topologii světa zvol vědomě.**

| Volba | Kdy | Poznámka |
|---|---|---|
| bez mřížky: spojitá koule + navigační graf | malá planetka s vesnicemi a cestami | nejjednodušší, stačí pro vrstvy 1–3 |
| krychle promítnutá na kouli (6 × N × N) | potřebuješ buňky (oheň, voda, biomy) | sousedé se počítají snadno, mírné zkreslení |
| geodetická síť (šestiúhelníky + 12 pětiúhelníků) | záleží ti na rovnoměrnosti | tabulka sousedů předem |
| rovina | údolí, město | nejméně práce |

**P4 — Rozhodování: Utility AI s pěti pojistkami.**

~~~js
// objekt nabízí akce:  { akce: 'jist', potreba: 'hlad', zisk: 50, trvani: 5, mist: 1 }
skore = nalehavost(potreba) * zisk / (1 + k * vzdalenost) * povaha * (1 + sum)
// nalehavost roste strmě, když potřeba klesá: ((100 − uroven) / 100) ** 2
~~~

1. **Setrvačnost:** rozdělaná akce má bonus (cca 20 %), jinak agent kmitá mezi dvěma cíli.
2. **Rezervace:** objekt s jedním místem si agent zamluví před cestou. Bez toho jdou dva do jedné postele.
3. **Rozložené přemýšlení:** v jednom kroku se rozhoduje jen část agentů (například 10). Cena je stálá bez ohledu na počet.
4. **Nouze má přednost:** útěk před nebezpečím přeruší cokoli.
5. **Vysvětlitelnost:** každé rozhodnutí si pamatuje tři nejlepší kandidáty se skóre. Bez „inspektoru myšlenek“ se emergentní chování nedá ladit.

Akce sama je malý automat: jdi → použij → dokonči, s možností přerušení.

**P5 — Den, noc a rozvrh z křivek.** Čas dne mění rychlost úbytku potřeb (spánek v noci, hlad ráno a večer). „Život“ vesnice z toho vznikne bez skriptování jednotlivců.

**P6 — Cesty.** Navigační graf nebo síť na kouli, hledání cesty s mezipamětí, žádné přepočítávání každý snímek. Místní vyhýbání jednoduchým odstupem.

**P7 — Řízení ≠ tělo** (`01_CORE` 4.3). Pohled očima obyvatele = kamera na hlavě, AI běží dál. Převzetí = výměna řidiče. Zvíře s jiným viděním = stejná kamera s jiným filtrem a zorným polem. Attract mode a testy používají totéž.

**P8 — Kreslení podle počtu.** Stromy, kameny, domy přes instancování. Desítky kostěných postav jednotlivě, vzdálené s řidší animací. Volné sady modelů sjednoť na vstupu: měřítko, osa „nahoru“, materiály.

**P9 — Buňkové jevy (vrstva 4): dvojí buffer a aktivní seznam.**
- Nový stav se počítá ze starého do druhého pole a pak se pole prohodí. Zápis na místě šíří oheň podle pořadí průchodu.
- Počítají se jen buňky v aktivním seznamu (hoří, teče), ne celá planeta.
- Běh pomalu (2–5× za sekundu), seedovaná náhoda.
- Jevy působí na potřeby agentů (bezpečí), ne přímo na jejich kód.

**P10 — Ukládání.** Agenti jako data, buňky jako typovaná pole (binárně, do IndexedDB), verze formátu s migrací.

**P11 — Tón.** Dětská verze: žádné katastrofy, mírné události (déšť, duha, slavnost), obyvatelům se nic zlého neděje.

**P12 — Vyvážení je testovatelné.** „Při dostatku zdrojů nikdo neumře hlady“ je test, ne naděje.

---

## 3. Amatérismy tohoto žánru

| Příznak | Místo toho |
|---|---|
| chůze po kouli přes Eulerovy úhly a globální gravitaci | P2 |
| postava se na druhé straně planety přetočí | P2 přírůstkově |
| obyvatelé řízení jedním velkým `switch` | P4 |
| agent kmitá mezi jídlem a spaním | setrvačnost |
| dva agenti na jedné židli | rezervace |
| každý agent přemýšlí každý snímek | rozložení |
| „proč to udělal?“ a nikdo neví | inspektor myšlenek |
| oheň se šíří rychleji na východ | dvojí buffer |
| zrychlení času mění výsledek | P1 |
| tři hry v jednom zadání | vrstvy 1–4 |
| tisíc stromů = tisíc objektů | instancování |

---

## 4. Milníky

| Milník | Obsah | Hotovo, když |
|---|---|---|
| M1 | planetka, hrdina, kamera, P2, sběr předmětů | T1, T2 |
| M2 | 10 agentů, 3 potřeby, 4 chytré objekty, inspektor myšlenek | T3, T4 |
| M3 | den a noc, cesty, vesnice z dat, 40–60 agentů | T5, T6 |
| M4 | pohled očima a převzetí postavy, katalog obyvatel a staveb | T7 |
| M5 | uložení, zrychlení času, zvuk prostředí, výkon | T8, T9 |
| M6 (volitelně) | buňky a jeden jev (déšť nebo oheň) | T10 |

---

## 5. Varianta A — web (Three.js + Rapier)

- Terén jako koule s výškovou funkcí; `vyskaTerenu(pos)` je jediný zdroj výšky pro kreslení i chůzi.
- Agenti nepotřebují fyzikální tělesa; stačí poloha na povrchu a odstup. Fyziku nech hrdinovi a volným předmětům.
- Simulační krok odděl od fyzikálního: fyzika 60–120 Hz, rozhodování 5–10 Hz.

## 6. Varianta B — engine (Godot 4.7)

| Téma | Postup a pasti |
|---|---|
| gravitace | `Area3D` s bodovou gravitací působí na `RigidBody3D`. `CharacterBody3D` ji nedostane: nastav `up_direction`, tíhu přičti ručně a bázi otáčej podle P2 |
| navigace | `NavigationRegion3D` zapečená z meshe planetky + `NavigationAgent3D` |
| množství | `MultiMeshInstance3D` |
| web | jen Compatibility; počítej s méně efekty |
| souběh s webovou verzí | sdílej datové soubory (vesnice, objekty, potřeby, křivky dne); co je v datech, se neportuje |

---

## 7. Napojení na Shell

- **Akce:** pohyb, skok, použít, přepnout pohled, vstoupit do postavy, rychlost času, pauza.
- **Nastavení navíc:** rychlost simulace, délka dne, hustota vegetace, režim vidění.
- **Katalog:** obyvatelé, zvířata, stavby, rostliny; v dětském tónu atlas s obrázkem a zvukem.
- **Vývojář:** inspektor myšlenek (čára k cíli, tři kandidáti se skóre, graf potřeb), vrstvy (navigace, rezervace, buňky jako barevná mapa), spawn, rychlost 1–100×.
- **Uložení:** čas, agenti, objekty a rezervace, buňky, poloha kamery nebo postavy.
- **Attract:** planetka se pomalu otáčí, život běží.

---

## 8. Akceptační testy

| # | Test | Podmínka |
|---|---|---|
| T1 | chůze kolem planety přes oba póly | směr pohledu se plynule mění, žádné přetočení |
| T2 | kamera při obchůzce | „nahoru“ kamery se mezi snímky nezmění skokem |
| T3 | 10 agentů, 10 herních minut, dost zdrojů | žádná potřeba neklesne na nulu |
| T4 | dva agenti, jedna postel | druhý zvolí jinou akci |
| T5 | 60 agentů | rozhodování ≤ 1 ms na krok |
| T6 | agent mezi dvěma stejně dobrými cíli | nezmění cíl víc než jednou |
| T7 | převzetí a vrácení postavy | AI pokračuje bez resetu potřeb |
| T8 | stejný seed při 1× a 100× po stejném herním čase | stejný stav |
| T9 | ulož → nahraj | stejný stav včetně rezervací |
| T10 | oheň na symetrické ploše | šíří se symetricky |

---

## 9. Zadání k vložení (M1)

~~~text
Projekt: planetka, case 50, varianta A. Platí 01_CORE, 02_SHELL, 50_CASE.
Iterace: M1 (vrstva 1). Kostra a Shell existují.
Udělej POUZE: kouli s výškovou funkcí, hrdinu řízeného přes Controller/Pawn,
orientaci a kameru podle P2 (přírůstkové zarovnání, žádné Eulerovy úhly),
tíhu do středu, 10 předmětů ke sběru, F3 přehled.
Topologie: bez mřížky. Nedělej: obyvatele, stavby, den a noc, buňky.
Hotovo, když projdou T1 a T2.
~~~

---

## 10. Zamyšlení

### Konzilium pěti expertů

- **Návrhář simulací:** „Hráč nevidí vzorce, vidí příběhy. Když si u studny dva povídají, protože oba měli žízeň a potřebu společnosti, je to hotové.“
- **Programátor AI:** „Utility AI bez setrvačnosti a rezervací vypadá jako mraveniště v panice. A bez výpisu důvodů ji neodladíš.“
- **Matematik:** „Na kouli neexistuje souřadná síť bez singularity. Proto se orientace přenáší krok za krokem, ne počítá z absolutních úhlů.“
- **Technický výtvarník:** „Pohádkový vzhled je hlavně světlo a paleta. Sjednoť sady modelů, jinak to vypadá jako sklad.“
- **Pedagog:** „Dítě se chce na obyvatele dívat a dát jim jméno. Zásahy shora až pro starší.“

Spor: programátor chce mřížku buněk od začátku, návrhář ji nepotřebuje. Závěr: bez mřížky pro vrstvy 1–3, mřížka až s první buňkovou událostí.

### FAQ

1. **Je Oliverova planetka arkáda, nebo simulace?** Simulace života na kouli s možností vstoupit do postavy; arkádový sběr je vrstva 1.
2. **Proč ne stavový automat pro obyvatele?** Počet přechodů roste s každou potřebou a objektem; skórování roste jen o řádek dat.
3. **Jak často má agent přemýšlet?** Jednou za 1–2 sekundy herního času, rozloženě.
4. **Proč se mi postava na pólu přetočí?** Orientace počítaná z absolutní osy; P2.
5. **Potřebuju mřížku buněk?** Až pro oheň, vodu nebo biomy.
6. **Kolik obyvatel unese prohlížeč?** Desítky kostěných postav bez potíží; stovky s řidší animací a instancováním.
7. **Jak udělat pohled očima zvířete?** Kamera na hlavě + filtr vidění; řízení se nemění.
8. **Jak ladit „divné“ chování?** Inspektor myšlenek a seed pro zopakování.
9. **Web, nebo Godot?** Web pro sdílení; Godot jako souběžný experiment nad stejnými daty.
10. **Kdy přidat katastrofy?** Až vrstva 2 obstojí v testech vyvážení; v dětské verzi vůbec.

### 5× proč

Problém: obyvatelé se chovají nesmyslně (kmitají, stojí, hromadí se).
1. Proč? Každý každou chvíli mění cíl.
2. Proč? Skóre se přepočítává bez setrvačnosti a bez rezervací.
3. Proč? Rozhodování bylo napsáno jako jeden vzorec bez pojistek.
4. Proč? Nebylo vidět, proč se agent rozhodl, takže chyby zůstaly skryté.
5. Proč? Ladicí nástroj se plánoval „až nakonec“.

Kořen: emergentní systém bez pozorovatelnosti. Lék: inspektor myšlenek v M2, dřív než třetí potřeba.

### Mentální modely

- **Occamova břitva:** bez mřížky, dokud není důvod; tři potřeby před šesti.
- **První principy:** život ve hře = potřeby, které klesají + místa, která je doplňují + cesta mezi nimi.
- **Inverze:** jak svět umrtvit? Všichni dělají totéž ve stejnou chvíli. Proto povaha, šum a rozvrh z křivek.
- **Druhý řád důsledků:** každá nová potřeba mění rovnováhu všech ostatních; každý nový objekt mění dopravu. Test vyvážení pouštěj po každé změně dat.

### ELI20

Představ si malou kouli s vesničkami. Každý obyvatel má pár ukazatelů (hlad, únava, chuť na společnost), které pomalu klesají. Věci kolem „volají“: postel nabízí spánek, jabloň jídlo. Obyvatel si spočítá, co se mu teď nejvíc vyplatí, a jde tam. Nikdo mu nepíše scénář, a přesto ráno jdou lidé k jídlu a večer domů. Nejtěžší je kupodivu chůze po kouli: „nahoru“ je na každém místě jinde, takže si postava svou orientaci nese s sebou a v každém kroku ji o kousek pootočí.
