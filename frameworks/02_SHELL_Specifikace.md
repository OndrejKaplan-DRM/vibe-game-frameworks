# Shell — specifikace (Level 1)

Shell je všechno kolem hry: titulní obrazovka, menu, nastavení, ukládání, katalog, vývojářské nástroje, načítání. Tohle je náhrada „univerzálního promptu na menu“ z Level 0.

**Tři rozhodnutí, která ho odlišují od Level 0:**
1. Shell je **knihovna** (`src/shell/`), napsaná jednou a přenášená mezi hrami. Nepíše se znovu s každou hrou.
2. Shell **nezná engine**. Neví, co je `renderer` nebo `camera`. Hra se k němu hlásí přes adaptér.
3. Shell vykreslí **jen to, co hra deklaruje**. Chybějící schopnost znamená chybějící položku, ne slepé tlačítko.

---

## 1. Adaptér: jediná vazba mezi hrou a Shellem

~~~js
export const adapter = {
  meta: { id: 'arena', title: 'Aréna', subtitle: '', version: VERSION, tone: 'hard' }, // hard | retro | kid

  state: {                          // povinné: Shell musí znát režim a jeho změny
    mode() { return E.mode; },
    onMode(fn) { /* zavolej fn(režim) při každé změně */ },
  },

  settings: SETTINGS_DEFS,          // oddíl 2
  actions:  ACTIONS,                // oddíl 3

  game: {
    newGame(opts) {}, resume() {}, pause() {}, quit() {},
    startAttract() {}, stopAttract() {},   // volitelné
    summary() { return 'Vlna 3 · 85 % zdraví'; },
  },

  save: {                           // volitelné → bez toho není „Uložit / Nahrát“
    snapshot() {}, restore(data) {},
    thumbnail() { /* vykresli snímek a vrať canvas */ },
  },

  catalog: {                        // volitelné → bez toho není katalog
    categories: [...], list() {}, stats(id) {}, sound(id) {},
    preview(id, target) { /* vykresli entitu do předané oblasti, vrať dispose() */ },
  },

  dev: {                            // volitelné → bez toho není vývojářská záložka
    stats() {},                     // čísla pro F3
    layers: [{ id: 'colliders', label: 'Kolize', set(on) {} }],
    views:  [{ id: 'blueprint', label: 'Výkres' }], setView(id) {},
    tweaks: [...DEFS], commands: { god() {}, spawn(id, n) {} },
  },

  time: { setScale(x) {}, stepOnce() {} },   // volitelné
};
Shell.mount(adapter);
~~~

Nový žánr Shell nemění. Mění se jen to, co adaptér nabídne. Rozcestník `genreProfile` z Level 0 tím odpadá.

---

## 2. Nastavení: deklarace s `apply` a `probe`

~~~js
{ id: 'fov', page: 'obraz', label: 'Zorné pole', type: 'range', min: 60, max: 110, step: 1, def: 90,
  apply: v => { camera.fov = v; camera.updateProjectionMatrix(); },
  probe: () => camera.fov,                 // co engine SKUTEČNĚ má
  when:  () => true }                      // volitelná podmínka zobrazení
~~~

- Typy: `range`, `select`, `toggle`, `action` (tlačítko), `key`.
- Změna se projeví hned. Ukládá se automaticky s viditelným potvrzením, nebo tlačítkem „Uložit změny“ (`persist: 'auto' | 'button'`). Vždy je k dispozici „Obnovit výchozí“.
- Formát uloženého nastavení má verzi; neznámé klíče se ignorují, chybějící a neplatné doplní výchozí hodnota.
- **Test proti placebu:** pro každou deklaraci nastav jinou než výchozí hodnotu a ověř, že `probe()` vrací totéž. Tím se zákaz slepých prvků z Level 0 stává měřitelným.

Upřesnění z prvního použití (Shell S1):

| Vlastnost deklarace | K čemu |
|---|---|
| registrace bez `probe` vyhodí chybu | slepý prvek se ke Shellu vůbec nepřipojí; nečeká se až na test |
| `tolerance` | porovnání s `probe` u hodnot, které engine zaokrouhluje (měřítko vykreslení na celé body) |
| `persist: false` | položky, které nemá smysl ukládat (celou obrazovku prohlížeč bez gesta nezapne); po startu se neaplikují |
| `watch(cb)` | hodnota se může změnit mimo nastavení (celá obrazovka klávesou Esc); bez toho se rozejde menu a skutečnost |
| `apply` smí vrátit `Promise` | když selže, hodnota se vrátí k tomu, co hlásí `probe` |
| `format(v)` | popisek hodnoty („60 %“) |

- Nastavení se ukládají synchronně do `localStorage` (se zálohou v paměti), aby šla použít před prvním snímkem. Asynchronní IndexedDB patří až k uloženým pozicím (oddíl 5).
- „Uloženo“ se ukazuje jen u položek, které se opravdu ukládají.
- **Rychlost hry a vývojářské měřítko času** jsou dva činitele jedné hodnoty: `timeScale = hra × vývojář`. `probe` rychlosti hry proto vrací `timeScale / vývojář`.

### Zásobník obvyklých položek (ber, co hra umí)

| Stránka | Položky | Poznámka |
|---|---|---|
| **Hra** | obtížnost, rychlost hry, seed + „náhodný“, autosave, jazyk | obtížnost = sada násobitelů v datech |
| **Obraz** | celá obrazovka, měřítko vykreslení 50–150 %, kvalita (předvolba), zorné pole / zoom, limit snímků, třes kamery, jas, HUD měřítko | viz upozornění níže |
| **Zvuk** | hlavní, hudba, efekty, prostředí, rozhraní, ztlumit na pozadí, test zvuku | hudba výchozí na 50 % |
| **Ovládání** | tabulka akcí, citlivost myši, inverze Y, předvolby (šipky / WASD) | mrtvá zóna jen s gamepadem |
| **Přístupnost** | velikost písma, omezit záblesky a třes, titulky | |

Upozornění k obrazu:
- Prohlížeč nemění rozlišení displeje. „Rozlišení“ je měřítko vykreslení: `pixelRatio = min(devicePixelRatio, 2) × měřítko`.
- Limit snímků přes vynechávání v `requestAnimationFrame` je plynulý jen pro dělitele obnovovací frekvence (60 na 120Hz displeji ano, 60 na 144Hz ne). „120“ nabízej jen tam, kde to displej umí.
- „Kvalita“ je předvolba, která nastaví skupinu jiných položek. Nesmí to být druhá skrytá sada hodnot.

---

## 3. Vstup

- Akce se vážou na **`event.code`** (fyzická klávesa), popisek se bere z `navigator.keyboard.getLayoutMap()`, kde je k dispozici, jinak z tabulky. Na české klávesnici je `Backquote` klávesa `;`.
- Přemapování: klik na řádek, stisk, kontrola kolizí, výměna nebo odmítnutí.
- Při hře `preventDefault` pro mezerník, šipky, Tab a kontextové menu (pravé tlačítko).

**Klávesy, se kterými se v prohlížeči nepočítá:**

| Klávesa | Problém | Řešení |
|---|---|---|
| `Esc` | při zámku kurzoru nebo celé obrazovce ho prohlížeč spotřebuje | pauzu řiď událostí `pointerlockchange` / `fullscreenchange` |
| `F5` | obnovení stránky | rychlé uložení na `F7`, nahrání `F9` |
| `Ctrl+W`, `Ctrl+T`, `Ctrl+N` | zavřít / nová karta, nejde zachytit | dřep nedávej ve výchozím stavu na Ctrl |
| `Ctrl+Shift+D` | záložky v Chromu | vývojářský režim přes `?dev` nebo pětiklik na číslo verze |
| `F11` | celá obrazovka prohlížeče, API o ní neví | vlastní tlačítko s Fullscreen API |
| `Alt`, `Meta` | fokus menu prohlížeče / systému | nenabízet k mapování |

**Zámek kurzoru (střílečky):**
1. Zámek se žádá jen z kliknutí.
2. Ztráta zámku (`pointerlockchange`) = pauza.
3. Po uvolnění klávesou Esc prohlížeč nový zámek krátce odmítá (Chrome ~1,25 s, v Aréně naměřeno až ~2,5 s). `requestPointerLock()` vrací slib: odmítnutí zachyť a nech tlačítko „Pokračovat“ aktivní se vzkazem „klikni znovu“.
4. Režim bez zámku pro testy a prostředí, kde zámek není povolen.

Gamepad a dotyk jsou samostatné schopnosti. Když je hra nedeklaruje, nejsou v menu.

**Orientace:** hra v `meta.orientation` řekne, jestli chce šířku. Shell pak na dotykovém zařízení drženém na výšku ukáže výzvu k otočení a hru zapauzuje; po otočení hra čeká v pauze. Úzké okno na počítači výzvu neukazuje. Zamknout orientaci jde jen v celé obrazovce a jen v některých prohlížečích, proto je výzva základ a zámek jen pokus navíc.

**Pauza bez klávesnice:** telefon nemá Esc. Shell proto při hře vždy ukazuje tlačítko pauzy (aspoň 48 px). Prvky Shellu ležící nad herní plochou nesmí spouštět herní akci; hra bere dotyk jen z plochy samotné.

---

## 4. Zvuk

~~~text
zdroje → [hudba | efekty | prostředí | rozhraní] → hlavní → kompresor/limiter → výstup
~~~

- `AudioContext` se odemyká prvním gestem. Při skryté kartě ztlumit (volitelně).
- Omezení hlasů na sběrnici (např. 16 efektů), minimální odstup stejného zvuku 30 ms, drobná variace výšky.
- Dlouhé a syčivé smyčky unavují: výchozí hlasitost nízko, automatické ztišení po čase, hudba s pauzami. Méně je více.
- Každý zvuk má v datech zdroj a licenci.

---

## 5. Ukládání

**Vrstva úložiště** `Store`: IndexedDB → localStorage → paměť. Když zbude jen paměť (některé iframy), Shell to **řekne**: „V tomto prostředí se pozice neuchovají.“ Tiché selhání je horší než omezení.

**Záznam slotu:**

~~~js
{ format: 1, gameId, gameVersion, slot, kind: 'manual' | 'quick' | 'auto',
  time: '2026-11-19T14:23:00+01:00', playSeconds, summary, thumb, data }
~~~

- Sloty: rychlý (`F7` / `F9`), automatický (2 rotující), ruční (výchozí 6). „Pokračovat“ bere nejnovější.
- **Náhled:** hra v `thumbnail()` vykreslí snímek a vrátí canvas v téže úloze. Shell ho zmenší na 320×180, zkusí WebP, **zkontroluje prefix `data:image/webp`**, jinak JPEG 0,6. Velikost zaloguje (cíl ≤ 15 kB).
- **Zápis:** nový záznam, pak přepnutí ukazatele; předchozí rychlý a automatický slot zůstává jako záloha. Při plném úložišti smaž nejstarší automatický, zkus znovu, pak hlášení.
- **Čtení:** kontrola `gameId` a `format`, migrace `migrate(data, odVerze)`. Poškozený slot = hláška, ne pád.
- **Export / import** jednoho slotu jako `.json`, import prochází stejnou kontrolou.
- Ukládat lze v režimech `playing` a `paused`. V attract mode nikdy.
- Karta slotu: náhled 16:9, upravitelný popis (předvyplněný z `summary()`), datum `DD.MM.RRRR HH:MM:SS`, odehraný čas, tlačítka Nahrát / Přepsat / Smazat / Export.

---

## 6. Katalog (bestiář, atlas, katalog těles, soupiska bojovníků)

- Tři panely: seznam s filtrem, živý náhled, data. Na telefonu pod sebou.
- **Jeden renderer.** Druhý `WebGLRenderer` pro náhled je past: prohlížeče omezují počet WebGL kontextů a slabší zařízení o kontext přijdou. Hra při pauze vykreslí náhledovou scénu hlavním rendererem do oblasti, kterou jí Shell předá (viewport / scissor). U 2D her stejný princip s jedním plátnem.
- Náhled: otáčení, zoom, přepínání animací, zvuk.
- Tón `hard`: přesná čísla z registru (ne opsaná ručně). Tón `kid`: velký obrázek, tlačítko zvuku, jedna věta, žádné tabulky.
- „Spawnovat do hry“ jen ve vývojářském režimu.
- Volitelně odemykání záznamů až po setkání ve hře.

---

## 7. Vývojářská sada

- Přístup: `?dev` v URL nebo pětiklik na číslo verze. V tónu `kid` nikdy v hlavním menu.
- **F3 ve čtyřech stupních:** vypnuto → text (snímky, ms snímku, ms kroku, entity, volání, trojúhelníky, pozice, rychlost, stav) → + vrstvy → + graf časů snímků s čarami 60 a 30.
- **Vrstvy** deklaruje hra. Kolize v Rapieru nejlevněji přes `world.debugRender()` (hotové úsečky a barvy), ostatní vrstvy vlastní: zranitelné zóny, stavy AI, navigace, paprsky s dozníváním, mřížka.
- **Pohledy** deklaruje hra: standardní, drátěný, bez stínování, výkres.
- **Čas:** stupně `0 · 0,05 · 0,1 · 0,25 · 0,5 · 1 · 2 · 5`, krok po jednom.
- **Ladicí hodnoty:** stejný formát jako nastavení, neukládají se mezi běhy (nebo do zvláštního klíče).
- **Konzole** (`Backquote`): příkazy z adaptéru, nápověda, historie, doplňování.

**Výkres (blueprint) v Three.js, s pastmi:**
- Původní materiály si ulož a při odchodu vrať. Pozadí `#08101a`, výplň tmavá s `polygonOffset`, hrany `EdgesGeometry(geom, 15)` barvou `#00f5d4`.
- Hrany počítej jednou na geometrii a drž v mezipaměti; u velkých meshů hlídej paměť.
- Kostěné a instancované meshe se s `EdgesGeometry` nedeformují. Pro ně použij obrys shaderem nebo kolizní tvary.

---

## 8. Attract mode

- Hra běží s AI řízením nebo přehrává záznam vstupů (viz Řízení ≠ tělo).
- Vstup hráče je odpojen; libovolná klávesa vede do menu.
- Neukládá, nezapisuje skóre, zvuk je ztlumený.
- Snížená zátěž (30 snímků, nižší kvalita), aby menu zůstalo svižné na slabém stroji. Jde vypnout.
- `backdrop-filter: blur` nad živým plátnem je na integrované grafice drahý. V attract mode ho nahraď poloprůhlednou vrstvou; rozmazání nech pro pauzu, kde se obraz vykreslí jednou a smyčka stojí.

---

## 9. Vzhled, tóny, rozložení

- **Písmo:** Calibri a Arial Narrow jsou jen na Windows. Pro stejný vzhled všude přibal volné písmo s českou diakritikou (Carlito je metricky shodné s Calibri; úzké alternativy Barlow Condensed, Roboto Condensed) a systémová písma nech jako zálohu.
- **Titul:** velký název z `meta.title`, styl podle tónu; projekt může dodat vlastní vykreslení (SVG, plátno).
- **Aby menu nevypadalo jako webová stránka:** žádné výchozí prvky prohlížeče a posuvníky, žádné označování textu, ovládání klávesnicí i gamepadem (fokus, potvrzení, zpět), zvuk na fokus a potvrzení, vlastní kurzor.
- **Esc** vždy o úroveň zpět, s ochranou 300 ms proti dvojímu přepnutí. Po zavření podobrazovky se fokus vrací na položku, ze které se otevřela.
- **Pohyb fokusu po řádcích:** nahoru a dolů mezi řádky (na řádku s volbami padne fokus na tu zvolenou), vlevo a vpravo uvnitř řádku; posuvník si šipky vlevo a vpravo zpracuje sám.
- V řádku nastavení má popisek jen šířku, kterou potřebuje; při dvou stejných sloupcích se volby zalamují.
- **Rozložení:** jednotka odvozená z menšího rozměru okna; zlomy pro telefon na výšku, tablet, plochu a velkou obrazovku sledovanou z dálky. Reaguj na `resize` i na změnu `devicePixelRatio` (okno přetažené na jiný monitor nebo televizi). Testuj 360×640, 1366×768, 1920×1080, 3840×2160.
- **Tón `kid`:** cíle aspoň 48 px, ikony a hlas místo textu u předčtenářů, nastavení za rodičovskou pojistkou (podržet 3 s), žádná nevratná akce bez potvrzení, žádné vývojářské prvky.
- **Texty** v jedné tabulce (čeština výchozí), žádné řetězce natvrdo v komponentách.

---

## 10. Načítání a selhání

- Fáze startu mají předem dané váhy → procenta nikdy necouvnou.
- Nejdřív to, co uživatel uvidí v první minutě; zbytek líně.
- Malá technická konzole na načítací obrazovce je v pořádku (paměť, fáze).
- `webglcontextlost` → pauza a srozumitelná hláška; `webglcontextrestored` → obnova.
- Bez WebGL: text s vysvětlením, ne bílá stránka.

---

## 11. Pořadí stavby Shellu

Shell se staví jako vlastní malý projekt se zkušební hrou. Doporučuju jako zkušební hru rovnou arkádu z casu 40.

| Krok | Obsah | Test |
|---|---|---|
| **S0** | adaptér, režimy, titul, start, pauza, Esc, tlačítko pauzy pro dotyk, pauza při skryté kartě | přechody režimů, čítač kroků v pauze stojí |
| **S1** | nastavení z deklarací, ukládání, `apply/probe` | každá položka projde, reset vrátí výchozí |
| **S2** | akce a přemapování, protokol zámku kurzoru, zvukové sběrnice | kolize kláves, odmítnutý zámek neshodí hru |
| **S3** | správce pozic, náhledy, export/import, vrstva úložiště | ulož → nahraj → stejný stav; plné úložiště; poškozený slot |
| **S4** | katalog, vývojářská sada, attract mode, tóny, rozložení | snímky ve 4 rozlišeních, attract neukládá |

---

## 12. Shell v enginu (Godot 4.7)

| Web | Godot |
|---|---|
| knihovna `src/shell/` | autoload `Shell` (scéna `.tscn` + skripty) |
| adaptér jako objekt | uzel hry s dohodnutými metodami (`has_method`) |
| `event.code` | `InputEventKey.physical_keycode` |
| vrstva úložiště | `user://`, nastavení přes `ConfigFile` |
| náhled | `await RenderingServer.frame_post_draw` → `get_viewport().get_texture().get_image()` → `resize(320, 180)` → `save_webp(cesta, true, 0.5)` (druhý parametr `lossy` musí být `true`) nebo `save_jpg` |
| pauza | `get_tree().paused`, Shell s `PROCESS_MODE_ALWAYS` |
| pohledy | `viewport.debug_draw`; pro drátěný pohled na startu `RenderingServer.set_debug_generate_wireframes(true)` |
| výkres | celoobrazovkový shader s `hint_depth_texture` a `hint_normal_roughness_texture` (jen Forward+); ve webovém exportu (Compatibility) použij obrysy z geometrie |

---

## 13. Co Shell záměrně nedělá

Vykreslování světa, fyziku, herní logiku, načítání herních assetů, síť. Když se to do něj začne tlačit, patří to do systému hry a do adaptéru.
