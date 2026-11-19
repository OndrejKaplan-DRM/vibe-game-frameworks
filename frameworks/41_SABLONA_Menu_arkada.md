# 41 · Šablona nabídek pro arkádu (A-MENU v1)

Vzor: nabídky hry Dinoš 2.7 (rozbor a známka jsou v repu `Dinosaurus`, `docs/SHELL_HODNOCENI.md`). Šablona z nich bere obsah a tón, přidává, co chybělo, a dává tomu pevný tvar.

Navazuje na [02_SHELL_Specifikace.md](02_SHELL_Specifikace.md) a [40_CASE_Arkada.md](40_CASE_Arkada.md).

## 1. Jádro: katalog není menu

Zadání znělo „mám rád předimenzovaná menu, zaslepit položky si můžu kdykoli“. Šablona to bere doslova, s jednou podmínkou.

- **Katalog** je úplný seznam všeho, co nabídky arkády můžou obsahovat: 128 položek na 18 obrazovkách. Je záměrně větší, než kterákoli hra potřebuje.
- **Menu** je to, co z katalogu vidí hráč. Vidí jen položky, které hra opravdu zapojila.
- **Zaslepit** položku znamená nedat jí vazbu, nebo ji vypnout úrovní. Nic se nemaže a kdykoli jde vrátit.

Podmínka: do menu se nedostane položka, která nic nedělá. Dinoš ukazuje proč. „Podrobné stíny“ se v náhradním vykreslení zobrazují a nemají žádný účinek; klíč `renderer` se ukládá a nikde nečte. Obojí vzniklo tak, že nabídka byla napsaná dřív nebo jinde než funkce. Předimenzované menu bez téhle pojistky skončí jako sbírka přepínačů, kterým hráč přestane věřit.

Katalog je v [`src/shell/catalog/arcade.js`](../src/shell/catalog/arcade.js), výpis po obrazovkách v [41a_KATALOG_arkada_vypis.md](41a_KATALOG_arkada_vypis.md), klikací náhled v `dist/sablona-menu-arkada.html`.

## 2. Tři úrovně

| Úroveň | Položek | Co znamená |
|---|---|---|
| **A · základ** | 38 | Bez toho nabídky neobstojí. Hra se ke každé musí vyjádřit: zapojit ji, nebo napsat, proč ji nemá. |
| **B · doporučené** | 39 | Dělá z nabídek hotový výrobek. |
| **C · nadstavba** | 51 | Předimenzování. Bere se podle chuti a času. |

Původ: 65 položek je převzato z Dinoše beze změny, 18 je v Dinošovi jinak nebo jen zčásti, 45 je nových.

## 3. Mapa obrazovek

```
Načítání ──► Hlavní menu ──► Hrát ──► Ve hře ──► Výsledky ──► Hrát znovu / Do menu
                 │                       │
                 │                       └─► Pauza ──► Pokračovat / Začít znovu / Nastavení / Jak hrát / Do menu
                 ├─► Klidný režim, Volný režim, Výběr úseku, Denní výzva
                 ├─► Jak hrát
                 ├─► Nastavení: Hra · Zvuk · Obraz · Ovládání · Svět · Data
                 ├─► Rekordy · Průvodce · O hře
                 └─► Vývojář (jen ?dev)

Rychlá lišta (zvuk, pauza, celá obrazovka) je vidět stále.
Systémová okna: potvrzení, výzva k otočení, pauza při ztrátě okna.
```

| Obrazovka | Položek | A | B | C |
|---|---|---|---|---|
| Načítání | 5 | 3 | 1 | 1 |
| Hlavní menu | 17 | 6 | 4 | 7 |
| Rychlá lišta | 6 | 2 | 1 | 3 |
| Nastavení · Hra | 7 | 2 | 2 | 3 |
| Nastavení · Zvuk | 8 | 3 | 2 | 3 |
| Nastavení · Obraz | 10 | 0 | 5 | 5 |
| Nastavení · Ovládání | 8 | 1 | 1 | 6 |
| Nastavení · Svět | 3 | 0 | 0 | 3 |
| Nastavení · Data | 5 | 2 | 1 | 2 |
| Jak hrát | 6 | 2 | 2 | 2 |
| Rekordy a statistiky | 4 | 0 | 1 | 3 |
| Průvodce | 2 | 0 | 0 | 2 |
| O hře | 4 | 3 | 0 | 1 |
| Ve hře | 10 | 4 | 5 | 1 |
| Pauza | 8 | 4 | 3 | 1 |
| Výsledky | 8 | 4 | 2 | 2 |
| Systémová okna | 3 | 2 | 1 | 0 |
| Vývojář | 14 | 0 | 8 | 6 |

Dinoš má 11 voleb na jedné dlouhé stránce. Katalog jich má pro hráče 32 na šesti stránkách; se samotným základem a doporučenými jich je 15.

## 4. Co se z Dinoše bere, co se mění, co přibylo

**Bere se beze změny**

- Tři vstupy do hry: soutěžní běh, klidný režim bez prohry, volné hřiště.
- Čtyři hlasitosti (celková, hudba, zvuky, prostředí).
- Obtížnost jako tři pojmenované stupně s větou, odkdy platí.
- Rada po prohře a kontextové rady na začátku.
- Rekord zvlášť pro každou obtížnost; klidný a vývojářský běh ho nezapisují.
- Živé pozadí za menu, stavový popisek světa, název skladby.
- Vývojář: skok na úsek, vložení prvku, nezranitelnost, kolize, hudební režie, katalog modelů.
- Vlastní hlas textů. Šablona dává neutrální popisky („Pauza“); hra si je přepíše („Chvilka v kapradí“).

**Mění se**

| V Dinošovi | V šabloně | Proč |
|---|---|---|
| Vývojář v menu pro každého | jen s `?dev` | hotová hra nemá hráči nabízet nezranitelnost |
| Vývojářské počasí se propíše do uloženého nastavení | vývojářské volby se nikdy neukládají | test `t5` to hlídá u celého katalogu |
| „Začít znovu“ a „Do háje“ bez dotazu | potvrzení, výchozí fokus na „Zpět“ | jeden překlep nesmí zahodit běh |
| Stíny se ukazují i tam, kde nic nedělají | volba má podmínku, kdy má smysl | žádný slepý prvek |
| Zaškrtávátko „dotyková tlačítka vždy“ | výběr automaticky / vždy / nikdy | hráč s klávesnicí u dotykového notebooku je chce schovat |
| Výběr skladby jen ve Vývojáři | volitelně i hráči | hudba je část zážitku |
| Katalog prvků ve Vývojáři a v nápovědě | vlastní obrazovka Průvodce | je to obsah pro hráče |
| Jedna dlouhá stránka nastavení | šest stránek | na telefonu na šířku se dlouhá stránka nevešla |

**Přibylo**

- **O hře**: verze, autoři, původ a licence dat. Do základu patří hned, jak hra obsahuje cizí modely, hudbu nebo písmo.
- **Data**: obnovení výchozích hodnot, stav ukládání, smazání rekordů, záloha do souboru.
- **Obraz**: kvalita, měřítko vykreslení, omezení pohybu, omezení snímků.
- **Ovládání**: rozložení kláves, přemapování, velikost a strany dotykových tlačítek, gamepad, vibrace.
- **Hra**: rychlost hry jako pomůcka, odpočet po pauze, jazyk.
- **Menu**: Pokračovat, Denní výzva, Rekordy, Ukončit.
- **Výsledky**: srovnání s rekordem, sdílení, seed běhu.
- **Systémová okna**: potvrzení a výzva k otočení.

## 5. Pravidla

1. **Viditelné = zapojené.** Volba má `apply` a `probe`, akce má `run`. Bez toho ji `bindCatalog` odmítne.
2. **Jedna deklarace na položku.** Popisek, typ, meze, výchozí hodnota, ukládání a podmínka jsou na jednom místě. Obrazovka, úložiště i test se generují z ní.
3. **Volba říká, kdy začne platit**: hned, od dalšího běhu, nebo po novém načtení.
4. **Ničivá akce se ptá.**
5. **Vývojářské položky jsou jen v `?dev` a neukládají se.**
6. **Nejvýš sedm ovládacích prvků základu na obrazovku.** Víc znamená další stránku, ne delší seznam.
7. **Klávesnice projde vším.** Šipky a Tab chodí, Enter potvrzuje položku pod fokusem, Esc vrací o úroveň, fokus se po zavření vrací, odkud přišel.
8. **Každá obrazovka se vejde nebo posouvá** na čtyřech velikostech: počítač, telefon na výšku, telefon na šířku, tablet.
9. **K základu se hra vyjádří celému.** Buď vazba, nebo `{ na: 'důvod' }`. Zpráva `missingRequired` musí být prázdná, než se hra vydá.
10. **Stav „nemám“ má důvod.** „Hra nemá hudbu“ je odpověď; mlčení není.

Pravidla 1, 5, 6, 9 a 10 hlídá kód a test `test/t5_katalog.mjs`. Pravidla 7 a 8 hlídají testy Shellu (`t2`, `t4`), zatím jen pro obrazovky, které Shell už umí. Pravidlo 4 je zatím jen značka `danger` v katalogu; potvrzovací okno Shell dostane v kroku S2. Pravidla 2 a 3 platí pro volby; akce a údaje Shell z katalogu zatím nekreslí.

## 6. Jak se šablona použije

```js
import { ARCADE_CATALOG } from './shell/catalog/arcade.js';
import { bindCatalog, toSettingsDefs } from './shell/catalog/bind.js';

const bound = bindCatalog(ARCADE_CATALOG, {
  'title.play':     { run: () => game.newGame() },
  'set.vol.master': { apply: (v) => audio.setVolume(v / 100), probe: () => audio.getVolume() * 100 },
  'set.difficulty': { def: 'lov', options: ['klid', 'lov', 'dravec'], apply: setPace, probe: getPace },
  'set.vol.music':  { na: 'hra nemá hudbu' },
});

bound.report;            // { total, wired, na, unwired, byTier, missingRequired }
toSettingsDefs(bound);   // deklarace pro createSettings ze Shellu S1
```

1. Otevři náhled, vypni úrovně a zaslep položky, které nechceš. Dole se skládá řádek s výběrem.
2. Ke zbytku napiš vazby. Co hra nemá, dostane `na` s důvodem.
3. Spusť `npm test`. Dokud `missingRequired` není prázdné, nabídky nejsou hotové.

## 7. Kde je arkáda z tohoto repa

Verze 0.2 má z katalogu 19 položek: 13 ze 38 základních a 6 doporučených. Dalších 13 vědomě nemá (hudba, stíny, počasí, druhé vykreslování). Shell zatím nečte katalog přímo; mapa `src/games/arkada/catalog-map.js` jen zapisuje stav a test hlídá, že sedí s deklaracemi hry. Přímé napojení je krok S2.

## 8. Otázky

**Není 128 položek moc?** Pro hráče ano, pro katalog ne. Hráč Dinoše by z katalogu viděl kolem sedmdesáti položek, hráč jednoduché arkády dvacet. Katalog je jídelní lístek, ne talíř.

**Proč nenechat nezapojené položky šedé, ať je vidět, co přijde?** Šedý prvek hráč zkusí, nic se nestane a příště nevěří ani těm funkčním. Šedé položky patří do pohledu `?dev`, kde je má vidět vývojář.

**Co když hra potřebuje volbu, která v katalogu není?** Přidá se do katalogu, s úrovní a původem. Stránka „Svět“ je vyhrazená pro volby jedné konkrétní hry.

**Jde šablona použít pro jiný žánr?** Obrazovky Načítání, Nastavení, Pauza, O hře a Systémová okna ano. Hlavní menu, Ve hře a Výsledky jsou psané pro běh na skóre; střílečka nebo bojovka dostane vlastní katalog se stejným tvarem.

**Co když se mi tón nelíbí?** Popisky jsou výchozí. Vazba je smí přepsat, takže „Do menu“ může být „Do háje“.
