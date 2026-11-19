# Rozšíření — realtime strategie a otevřený svět (kratší karty)

Tyhle dva žánry přidala Gemini nad rámec tvého seznamu. Vzory v Level 0 jsou tu správné, nepoužitelný je rozsah jednoho zadání. Nechávám je jako karty se žebříčkem kroků; plný case z nich udělej, až se k některému skutečně dostaneš.

---

## A. Realtime strategie (StarCraft / Warcraft)

**Jádro jednou větou:** *označím skupinu, pošlu ji někam a ona tam dorazí rozumně.*

### Co z Level 0 platí

- Jedno pole směrů (flow field) na rozkaz místo hledání cesty pro každou jednotku.
- Jednotky jako kruhy v rovině, měkké odtlačování přes prostorový hash. Žádná fyzikální tělesa.
- Mlha války se třemi stavy jako malá textura.
- Výběr obdélníkem v souřadnicích obrazovky.

### Co doplňuju

1. **Rozkazy jsou data ve frontě s číslem kroku.** Z toho plynou záznamy bitev, opakovatelné testy a attract mode z nahrávky (stejný princip jako stav bojovky).
2. **Simulace 10–20 kroků za sekundu**, vykreslení prolíná. Dvě stě jednotek při 120 Hz je zbytečná cena.
3. **Hledání cíle s rozpočtem:** každá jednotka hledá nepřítele jen občas a jen v sousedních buňkách hashe.
4. **Hlavička registru:** jednotka, budova, vylepšení jako data; strom závislostí se z nich počítá, nekreslí ručně.
5. **AI soupeř ze skriptu pořadí staveb**, ne „inteligence“. Stačí tři skripty a rozhodnutí, kdy útočit.

### Žebříček

| Krok | Obsah | Hotovo, když |
|---|---|---|
| R1 | 20 jednotek, výběr, rozkaz k přesunu, odstup | skupina projde brankou bez zaseknutí |
| R2 | pole směrů, 200 jednotek | krok simulace v rozpočtu, rozkaz bez záseku |
| R3 | boj: dosah, prodleva, hledání cíle | dvě skupiny se střetnou, výsledek je opakovatelný |
| R4 | jedna surovina, dělníci, jedna výrobní budova | ekonomická smyčka běží 10 minut |
| R5 | mlha války | nepřítel mimo dohled není vidět ani vybratelný |
| R6 | soupeř ze skriptu | odehraje celou partii |

Druhá surovina, hrdinové, kouzla a strom vylepšení až potom, každé jako vlastní iterace.

---

## B. Otevřený svět (jádro ve stylu GTA)

**Jádro jednou větou:** *jdu, nasednu, jedu a město kolem žije.*

### Co z Level 0 platí

- **Řízení ≠ tělo**: hráč přepíná mezi postavou a vozidlem výměnou řízeného těla.
- **Vozidlo jako jedno tuhé těleso se čtyřmi paprsky** (pružina, tlumič, podélná a boční síla). Rapier i Godot to mají hotové.
- **Bublina**: doprava a chodci existují jen v prstenci kolem hráče a recyklují se.
- **Hledanost jako eskalační automat** se ztrátou kontaktu.

### Co opravuju

1. **Odhad „2 500 řádků za odpoledne“ neplatí.** Řádový rozpad podle rozsahu podobných systémů (jistota 3/5):

| Systém | Řádky |
|---|---|
| vozidlo, ladění, telemetrie | 600–900 |
| pohyb pěšky a zbraně (viz case 10) | 1 200–2 000 |
| město z dat a graf silnic | 800–1 500 |
| řidiči a doprava | 800–1 500 |
| chodci | 500–1 000 |
| hledanost a policie | 800–1 500 |
| minimapa | 300–500 |
| **celkem bez testů a Shellu** | **zhruba 5–9 tisíc** |

   Je to pořád zlomek skutečné hry a pořád to jde, jen po krocích a v týdnech.

2. **Spawn mimo zorné pole.** Level 0 přesouvá vozidla „před hráče ve směru jízdy“, tedy do záběru. Nové entity se rodí za rohem nebo za hranicí viditelnosti, mizí tam, kam hráč nevidí.
3. **Doprava nejdřív na kolejích.** Auta sledují graf pruhů jako vláčky; fyzikální těleso dostanou až při srážce nebo v blízkosti hráče.
4. **Ladění vozidla potřebuje telemetrii** (stlačení pružin, skluz) dřív než město.

### Žebříček

| Krok | Obsah | Hotovo, když |
|---|---|---|
| O1 | jedno vozidlo na ploše s rampou, telemetrie | jde řídit, driftovat a neskáče samo |
| O2 | postava ↔ vozidlo | nástup, výstup, kamera se plynule změní |
| O3 | město 4×4 bloky z dat, graf silnic, doprava na kolejích | auta jezdí a stojí na křižovatkách |
| O4 | bublina s poolem | počet entit stálý, nic se neobjevuje v záběru |
| O5 | hledanost 1–2 | pronásledování a ztráta kontaktu |

Vrtulník, vyšší stupně hledanosti, model poškození a počasí až potom.

### K dovětku o GTA VI

- Konzolová verze cílí na 30 snímků za sekundu, rozpočet snímku je tedy 33,3 ms, ne 16,67 ms.
- Rozpad snímku po fázích a počty řádků kódu v Level 0 nemají zdroj; Rockstar je nezveřejňuje.
- Historie enginu (RenderWare → vlastní RAGE, Euphoria) a data vydání sedí.
- Podstata přirovnání platí: prototyp ukazuje principy, skutečná hra je tisíce výjimek a obsahu.
