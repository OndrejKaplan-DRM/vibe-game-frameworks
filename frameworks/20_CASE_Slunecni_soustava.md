# Case 20 — Sluneční soustava: model, přelety, povrchy

Předpoklad: `01_CORE` a `02_SHELL`. Case zobecňuje to, co řeší Soustava 200 a Kosmická výprava, pro další projekty stejného druhu (planetárium, let lodí, přistání na ploše ~1 km²).

---

## 1. Rozsah

**Je:** Slunce a N těles se správnou polohou, orientací a velikostí v čase; hvězdné pozadí; přeskok kamerou; let lodí; návštěva malé plochy na povrchu.
**Není:** N-tělesová gravitační simulace planet (polohy jsou funkce času, ne výsledek integrace), plynulý sestup z oběžné dráhy až ke kamínku na jednom meshi, síťová hra.

**Jádro jednou větou:** *dívám se na správné místo ve správný čas a můžu se tam přesunout.*

---

## 2. Invarianty

**V1 — Tři souřadné soustavy, přechody výslovně.**
1. **Pravda:** heliocentrická ekliptikální J2000, `float64`, metry. Tady žijí tělesa, loď i kamera.
2. **Obraz:** souřadnice vůči kameře, `float32`. Každý snímek `obraz = pravda_tělesa − pravda_kamery`, odečítá se v 64 bitech, do GPU jde až rozdíl. Kamera je pro GPU vždy v počátku.
3. **Povrch:** místní soustava východ–sever–nahoru v bodě přistání, vlastní scéna a vlastní fyzikální svět.

Přechod mezi soustavami je změna režimu s předávací funkcí, ne plynulé kouzlo.

Proč nestačí jen plovoucí počátek: krok `float32` je 16,4 km ve vzdálenosti Země od Slunce a **0,5 m už na poloměru Země**. Glóbus a kilometrová plocha s kameny proto nemůžou být tentýž mesh.

**V2 — Jeden čas.** `simTime` = juliánské datum (dynamický čas) ve `float64`. Polohy těles jsou čisté funkce `poloha(těleso, simTime)`. Zrychlení času mění rychlost, jakou `simTime` roste, takže je přesné při libovolném násobku a jde pustit pozpátku. Integruje se jen loď. Rozhraní ukazuje gregoriánské datum; mimo ověřený rozsah modelu varuje.

**V3 — Kamera je připoutaná k tělesu.** Poloha kamery = `poloha(ohnisko, simTime) + posun`. Jinak při zrychlení 1 den/s uteče Země kameře o 2,6 milionu km za každou sekundu.

**V4 — Data se stahují, nevypisují.** Model píše importér a validátor, ne čísla.

| Co | Odkud |
|---|---|
| planety (střední elementy a jejich změny) | JPL, tabulka přibližných poloh planet |
| malá tělesa | JPL Small-Body Database |
| měsíce | JPL, střední elementy satelitů (pozor na referenční rovinu) |
| pól a rotace těles | zpráva pracovní skupiny IAU pro kartografické souřadnice |
| fyzikální údaje | planetární přehledy NSSDC |
| hvězdy | Yale Bright Star Catalog nebo HYG |
| hotový výpočet poloh | knihovna `astronomy-engine` (volná licence) jako reference |

Každý soubor: zdroj, datum stažení, jednotky, licence. Validační skript porovná polohy s referenční efemeridou pro sadu dat a vypíše chybu v úhlových minutách.

**V5 — Rozpočet chyby podle účelu.** Prohlídka snese stupně, konjunkce úhlové minuty, zatmění ještě méně. Měsíc proto nejde počítat jednou Keplerovou elipsou; potřebuje poruchové členy nebo tabelovanou efemeridu.

**V6 — Orientace = pól + rotace.** Směr osy (rektascenze a deklinace pólu) a úhel W(t) dají kvaternion. Samotný „sklon osy“ neurčuje, kam osa míří, a prstence nebo roční období pak vyjdou špatně.

**V7 — Seznam těles je datový soubor s definicí.** „200 největších“ je u těles za Neptunem nejistý pojem (průměry se odhadují). Rozhodni kritérium (největší a nejznámější), zapiš zdroj a datum, počet nech volný.

**V8 — Hloubka: vyber jednu strategii a změř ji.**
- obrácený Z-buffer (v three.js parametr rendereru, vyžaduje rozšíření `EXT_clip_control`; název parametru se mezi verzemi měnil, ověř v dokumentaci své verze),
- logaritmický buffer (funguje všude, ale stojí výkon, což je na integrované grafice znát),
- dva průchody: vzdálená scéna a blízká scéna, každá s vlastním rozsahem.

**V9 — Čáry drah mají stejný problém jako planety.** Vrcholy dráhy Neptunu ve `float32` mají krok stovky km; při přiblížení čára tělesem neprochází. Úsek dráhy u kamery přepočítávej v 64 bitech vůči kameře.

**V10 — Zvětšení je přiznané.** Režimy měřítka jsou označené, 1:1 je vždy dostupné, při přiblížení se měřítko vrací ke skutečnosti. Ikony těles v logaritmickém měřítku.

**V11 — Let lodí: kinematický pohon, poctivě pojmenovaný.**

Fakta (přepočítáno):

| Cíl ze Země při 0,1c | Doba |
|---|---|
| Měsíc | 12,8 s |
| Mars | 30 min (nejblíž) až 3,7 h |
| Jupiter | 5,8 až 8,9 h |
| Saturn / Titan | 11 až 15 h |
| Pluto | ~53 h |

Zabrzdit z 0,1c při 10 g trvá 3,5 dne a 31 AU. „Autentická fyzika“ a „0,1c mezi planetami“ se tedy vylučují; pohon je herní zařízení a hra to má říct.

Pravidla:
1. Loď se integruje ve `float64`.
2. **Proti proletění:** v každém kroku test úsečky (stará → nová poloha) proti koulím všech těles. Je to 200 levných testů a žádné těleso nejde minout.
3. **Regulátor rychlosti bez skoků:** `v_max = min(0,1c, k · výška_nad_nejbližším_tělesem)`, platí vždy, bez podmínky na vzdálenost. (Podmínka `D < 100R` z Level 0 dává u malých těles skok rychlosti.)
4. Dlouhé přelety: zrychlení času s lodí „na kolejích“, nebo střih.
5. Volitelně věrné relativistické efekty: aberace posouvá hvězdy ke směru letu až o 5,7°, Dopplerův posuv +10,6 % vpřed a −9,5 % vzad, γ = 1,005.

**V12 — Povrch: tři světy, jeden postup.**

| | Země | Mars | Titan |
|---|---|---|---|
| tíhové zrychlení | 9,81 m/s² | 3,72 m/s² | 1,35 m/s² |
| hustota vzduchu u povrchu | 1,225 kg/m³ | 0,020 kg/m³ | ~5,3 kg/m³ |
| tlak | 101 kPa | 0,6 kPa | 147 kPa |
| sluneční tok nad atmosférou | 1361 W/m² | ~586 W/m² | ~15 W/m² |
| terminální rychlost člověka (odhad škálováním) | ~54 m/s | ~260 m/s | ~10 m/s |
| obloha | modrá | okrová, u Slunce namodralá | oranžový zákal |

- Tíha jako vektor ve fyzikálním světě, odpor vzduchu `F = −½ ρ |v| v · C·A` jako síla v každém kroku.
- **Směr Slunce** z téhož kvaternionu orientace jako glóbus (V6) a zeměpisných souřadnic místa. Test: podsluneční bod spočítaný oběma cestami se shoduje.
- **Jas řeší expozice.** Rozdíl osvětlení Země a povrchu Titanu je zhruba tisícinásobný. Dva režimy: „oko“ (expozice se přizpůsobí) a „pevná expozice“ (uvidíš, jaká je tam tma).
- **Terén:** pro Zemi a Mars existují skutečné výškové modely, pro Titan ne. Kde je povrch domyšlený, napiš to na kartě místa.
- Vyber jedno konkrétní místo. Kraken Mare a místo přistání sondy Huygens jsou dvě různé lokality.

**V13 — Orientace uživatele.** Stálá mapka „kde jsem“, návratové body, popisky podle priority, dráhy odstupňované podle významu a vzdálenosti. Přelet kamerou interpoluje logaritmus vzdálenosti.

**V14 — Paměť a start.** Rozpočet textur, velké mapy až při přiblížení, ukazatel načítání, který necouvá, předem načtené to, co se ukáže v první minutě.

**V15 — Telefon a velká obrazovka od začátku**, ne jako záplata.

---

## 3. Amatérismy tohoto žánru

| Příznak | Místo toho |
|---|---|
| Slunce v počátku scény, planety na skutečných souřadnicích | V1 |
| elementy drah „z hlavy“ | V4 |
| sklon osy jako jedno číslo | V6 |
| Měsíc jako elipsa a pak záhadně posunutá zatmění | V5 |
| kamera ujíždí při zrychleném čase | V3 |
| loď proletí měsícem | V11 |
| `near = 0.1`, `far = 1e14` a běžný buffer | V8 |
| čára dráhy mimo planetu | V9 |
| Titan buď černý, nebo nasvícený jako Země | V12 expozice |
| zvětšená tělesa bez upozornění | V10 |
| druhý renderer pro katalog | `02_SHELL` oddíl 6 |

---

## 4. Milníky

| Milník | Obsah | Hotovo, když |
|---|---|---|
| M1 | čas, Slunce–Země–Měsíc, plovoucí počátek, kamera připoutaná k tělesu, bez textur | polohy pro 3 data sedí s referencí v rozpočtu chyby |
| M2 | planety, orientace, výběr tělesa, přeskok kamerou | validační tabulka, test třesu |
| M3 | datová linka pro N těles a hvězdy, dráhy, úrovně detailu | nové těleso = řádek v datech |
| M4 | loď, regulátor, test proletění, zrychlení času | 1000 náhodných náletů bez proletění |
| M5 | jedno místo na povrchu (Mars má nejlepší data), potom další | shoda směru Slunce, fyzika podle tabulky |
| M6 | katalog, hloubka Shellu, zařízení, publikace | rozpočty na slabém stroji |

---

## 5. Varianta A — web (doporučená)

- `Number` je `float64`: celá nebeská mechanika je přesná bez knihoven.
- Těla těles jako koule s texturou a úrovněmi detailu; hvězdy jako body s velikostí podle jasnosti a barvou podle indexu B−V, pevně v nekonečnu (pohybují se jen s natočením kamery).
- Výběr tělesa podle vzdálenosti průmětu na obrazovce, ne paprskem do pixelové koule.
- Povrch přes Rapier: výšková mapa jako `heightfield`, vlastní tíha, odpor vzduchu ručně.

## 6. Varianta B — engine

| Engine | Stav |
|---|---|
| Godot 4.7 | skripty počítají v 64 bitech, transformace uzlů v běžném sestavení ve 32; plovoucí počátek je nutný. Obrácený Z-buffer má od verze 4.3 vestavěný. Objemová mlha jen ve Forward+; webový export běží v Compatibility |
| Unity 6 | transformace 32bitové, plovoucí počátek ručně |
| Unreal 5 | velké světové souřadnice v jádru, ale pro vibe-coding nevhodný (`01_CORE` oddíl 3) |

Technika „promítni vzdálená tělesa na bližší slupku se zachovaným úhlovým průměrem“ funguje, pokud vzdálenosti mapuješ monotónně (např. logaritmem); jinak se tělesa špatně překrývají.

---

## 7. Napojení na Shell

- **Katalog** = katalog těles: náhled se správným tvarem a osou, porovnání velikosti, tlačítka Přejít / Letět / Navštívit povrch (jen kde existuje).
- **Nastavení navíc:** měřítko těles, dráhy (úrovně), popisky, souhvězdí, režim expozice, přisvětlení.
- **Vývojář:** datum a čas, rychlost času (pauza, 1×, minuta/s, hodina/s, den/s, rok/s), chyba proti referenci pro vybrané těleso, vrstvy (osy rotace, sféry vlivu, ekliptikální síť).
- **Uložení:** `simTime`, režim, ohnisko a posun kamery, stav lodi v 64 bitech, nastavení zobrazení.
- **Attract:** zrychlený čas, kamera pomalu obíhá vybrané těleso.
- **Pohled „výkres“:** drátěné sféroidy, všechny dráhy, uzly, osy; na povrchu vrstevnice.

---

## 8. Akceptační testy

| # | Test | Podmínka |
|---|---|---|
| T1 | polohy vybraných těles pro 10 dat | chyba pod rozpočtem (V5) |
| T2 | kamera 1 m od objektu ve vzdálenosti 30 AU | obrazová poloha se od pravdy liší < 1 cm |
| T3 | 100 let vpřed a zpět | polohy shodné |
| T4 | zrychlení 1 den/s u Země | kamera drží vzdálenost od ohniska |
| T5 | 1000 náletů 0,1c na těleso o průměru 300 km | žádné proletění |
| T6 | přiblížení regulátorem | rychlost bez skoků, výška nikdy záporná |
| T7 | podsluneční bod dvěma cestami | shoda do 0,1° |
| T8 | pád na třech světech | ustálená rychlost podle tabulky ±15 % |
| T9 | ukazatel načítání | neklesá |

---

## 9. Zadání k vložení (M1)

~~~text
Projekt: model Sluneční soustavy, case 20, varianta A. Platí 01_CORE, 02_SHELL, 20_CASE.
Iterace: M1. Kostra a Shell existují.
Udělej POUZE: systém time (simTime jako juliánské datum, rychlost času), systém ephemeris
(Slunce, Země, Měsíc; polohy jako funkce času z datového souboru nebo knihovny, žádná čísla z paměti),
systém view (plovoucí počátek: pravda float64, obraz vůči kameře; kamera připoutaná k ohnisku),
validační skript proti referenci pro 3 data. Koule bez textur.
Nedělej: další tělesa, hvězdy, loď, povrch, textury.
Hotovo, když projdou T1 (3 tělesa), T2, T3, T4. U každého datového souboru uveď zdroj a datum.
Kde si nejsi jistá konstantou nebo názvem API, napiš to.
~~~

---

## 10. Zamyšlení

### Konzilium pěti expertů

- **Nebeský mechanik:** „Polohy jsou funkce času. Jakmile začnete planety integrovat, ztratíte vratnost i přesnost. Integrujte jen to, co řídí hráč.“
- **Grafický programátor:** „Plovoucí počátek řeší polohy, ne hloubku ani vrcholy velkých meshů. Jsou to tři různé problémy s přesností a každý má jiný lék.“
- **Datový kurátor:** „Chci u každého čísla vědět, odkud je a kdy bylo staženo. Jinak nerozeznáte chybu modelu od chyby dat.“
- **Návrhář rozhraní:** „Ve vesmíru se lidé ztrácejí během deseti sekund. Mapka, návrat domů a klidné popisky jsou důležitější než další textura.“
- **Fyzik atmosfér:** „Na povrchu rozhodují tři čísla: tíha, hustota a světlo. A světlo řešte expozicí, lidské oko to dělá taky.“

Spor: věrnost (mechanik) proti čitelnosti (návrhář) u měřítka těles. Závěr: přiznané režimy měřítka s návratem na 1:1.

### FAQ

1. **Proč se planeta zblízka třese?** Souřadnice ve `float32` daleko od počátku; V1.
2. **Proč čára dráhy míjí planetu?** Tentýž problém u vrcholů čáry; V9.
3. **Stačí Keplerovy elementy?** Na prohlídku ano, na zatmění ne; V5.
4. **Odkud vzít 200 těles?** Z databází JPL importérem; seznam je datový soubor s kritériem.
5. **Proč má Uran špatně natočené prstence?** Chybí směr pólu, sklon nestačí; V6.
6. **Jak letět 0,1c a neproletět měsícem?** Test úsečky proti koulím a spojitý regulátor; V11.
7. **Je 0,1c s brzděním u planety fyzikálně možné?** Ne (31 AU při 10 g). Je to herní pohon.
8. **Proč je Titan černý?** Skutečný jas bez přizpůsobení expozice; V12.
9. **Engine, nebo web?** Web: 64 bitů zadarmo, sdílení odkazem, telefon.
10. **Jak poznám, že model nelže?** Validační tabulka a viditelný rozsah platnosti.

### 5× proč

Problém: zatmění v modelu nesedí s historickým záznamem.
1. Proč? Měsíc je o stupeň vedle.
2. Proč? Počítá se z jedné Keplerovy elipsy.
3. Proč? Všechna tělesa dostala stejnou metodu z jedné tabulky.
4. Proč? Nebyl stanoven rozpočet chyby podle účelu.
5. Proč? Data se brala jako výplň, ne jako požadavek s vlastní přesností.

Kořen: přesnost dat nebyla součástí zadání. Lék: V4 a V5, validace jako první milník.

### Mentální modely

- **Occamova břitva:** analytické dráhy místo simulace gravitace; jedno místo na povrchu místo plynulého sestupu.
- **První principy:** co počítač skutečně umí? 24 bitů mantisy na GPU, 53 na CPU. Z toho plyne celá architektura.
- **Inverze:** jak vyrobit nevěrohodný model? Čísla z paměti, skryté zvětšení, žádný rozsah platnosti.
- **Druhý řád důsledků:** zrychlení času zasáhne kameru, zvuk, loď i načítání textur; každá nová funkce se musí zeptat, co udělá při 1 rok/s.

### ELI20

Sluneční soustava je obrovská a počítačová grafika počítá s čísly, která mají jen asi sedm platných číslic. U Saturnu by tak nejmenší krok byl přes sto kilometrů a všechno by se třáslo. Trik je držet skutečné polohy v přesnějších číslech mimo grafiku a grafice posílat jen vzdálenosti od kamery, která stojí pořád uprostřed. Planety se nepohánějí simulací, jejich poloha se prostě vypočítá z data, proto jde čas libovolně zrychlit i vrátit. A let desetinou rychlosti světla je herní zkratka: skutečná loď by brzdila několik dní a přes celou soustavu.
