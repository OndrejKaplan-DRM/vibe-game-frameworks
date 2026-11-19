# Katalog nabídek pro arkádu – výpis

Generováno z `src/shell/catalog/arcade.js` (katalog arcade v1) příkazem `npm run preview:catalog`. Neupravovat ručně.

Úroveň: A základ, B doporučené, C nadstavba. Sloupec „Arkáda v0.2“: ano = hra položku má, text = proč ji nemá, prázdné = čeká.

## Načítání

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `boot.progress` | Průběh načítání | údaj | A | Dinoš |  |  | Text, co se právě děje, a lišta. |
| `boot.error` | Chyba s důvodem | údaj | A | Dinoš |  |  | Lidská věta, ne výpis z konzole. |
| `boot.retry` | Zkusit znovu | tlačítko | A | Dinoš |  |  | jen když: načtení selhalo |
| `boot.fallback` | Oznámení úsporného vykreslení | údaj | B | Dinoš |  | jedno vykreslování | jen když: hra má náhradní vykreslení |
| `boot.tip` | Tip během načítání | údaj | C | nové |  |  |  |

## Hlavní menu

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `title.play` | Hrát | tlačítko | A | Dinoš |  | ano | Dinoš: „Vyrazit na stezku“. Jediné zvýrazněné tlačítko. |
| `title.continue` | Pokračovat | tlačítko | C | nové |  |  | jen když: hra ukládá rozehraný postup |
| `title.practice` | Klidný režim | tlačítko | B | Dinoš |  |  | Bez prohry, nezapisuje rekordy. Dinoš: „Klidná výprava“. |
| `title.free` | Volný režim | tlačítko | C | Dinoš |  |  | Hřiště bez cíle. Dinoš: „Poběhat si v háji“. |
| `title.levels` | Výběr úseku | tlačítko | C | Dinoš, jinak |  |  | jen když: hra má úseky a hráč je odemkl; V Dinošovi jen ve Vývojáři. |
| `title.daily` | Denní výzva | tlačítko | C | nové |  |  | Stejný seed pro všechny hráče toho dne. |
| `title.help` | Jak hrát | tlačítko | A | Dinoš |  |  |  |
| `title.settings` | Nastavení | tlačítko | A | Dinoš |  | ano |  |
| `title.records` | Rekordy | tlačítko | B | nové |  |  |  |
| `title.collection` | Průvodce | tlačítko | C | Dinoš, jinak |  |  | V Dinošovi část nápovědy a Vývojáře. |
| `title.about` | O hře | tlačítko | A | nové |  |  | Povinné, jakmile hra obsahuje cizí modely, hudbu nebo písmo. |
| `title.dev` | Vývojář | tlačítko | B | Dinoš, jinak |  |  | jen ?dev; V Dinošovi viditelné každému hráči. |
| `title.quit` | Ukončit | tlačítko | C | nové |  | běží v prohlížeči | jen když: hra běží jako aplikace, ne v prohlížeči |
| `title.best` | Rekord pro zvolenou obtížnost | údaj | A | Dinoš |  |  |  |
| `title.controls` | Řádek s ovládáním | údaj | B | Dinoš |  |  | Podle zařízení: klávesy, nebo gesta. |
| `title.version` | Verze a způsob vykreslení | údaj | A | Dinoš |  | ano |  |
| `title.attract` | Živé pozadí | údaj | C | Dinoš |  |  | Scéna hry běží za menu. |

## Rychlá lišta

Je vidět v menu i ve hře.

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `bar.mute` | Zvuk zapnout / vypnout | tlačítko | A | Dinoš |  |  |  |
| `bar.pause` | Pauza | tlačítko | A | Dinoš |  | ano | jen když: běží hra |
| `bar.fullscreen` | Celá obrazovka | tlačítko | B | Dinoš |  |  | jen když: prohlížeč ji dovolí |
| `bar.nextTrack` | Další skladba | tlačítko | C | Dinoš |  | hra zatím nemá hudbu | jen když: hra má víc skladeb |
| `bar.nowPlaying` | Název skladby | údaj | C | Dinoš |  | hra zatím nemá hudbu |  |
| `bar.env` | Stav světa | údaj | C | Dinoš |  |  | Dinoš: počasí, čas a úsek. |

## Nastavení · Hra

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `set.difficulty` | Obtížnost | přepínač voleb | A | Dinoš | další běh |  | Tři stupně s vlastními jmény. Dinoš: Pohoda, Výprava, Dravec. |
| `set.gameSpeed` | Rychlost hry | výběr | B | nové | hned | ano | Pomůcka pro přístupnost; mimo 100 % se rekordy nezapisují. |
| `set.shake` | Otřesy kamery | zap / vyp | A | Dinoš | hned |  | Výchozí hodnota podle systémového omezení pohybu. |
| `set.hints` | Rady ve hře | zap / vyp | B | Dinoš, jinak | hned |  | Dinoš radí prvních 230 m bez možnosti vypnout. |
| `set.resumeCountdown` | Odpočet po pauze | zap / vyp | C | nové | hned |  |  |
| `set.autoPause` | Pauza při opuštění okna | zap / vyp | C | nové | hned |  |  |
| `set.language` | Jazyk | výběr | C | nové | hned |  | jen když: hra má víc než jeden jazyk |

## Nastavení · Zvuk

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `set.vol.master` | Celková hlasitost | posuvník | A | Dinoš | hned | ano |  |
| `set.vol.music` | Hudba | posuvník | A | Dinoš | hned | hra zatím nemá hudbu | jen když: hra má hudbu |
| `set.vol.sfx` | Zvuky | posuvník | A | Dinoš | hned |  |  |
| `set.vol.ambience` | Prostředí | posuvník | B | Dinoš | hned | hra nemá zvuky prostředí | jen když: hra má zvuky prostředí; Dinoš: „Prales“. |
| `set.testSound` | Zkouška zvuku | tlačítko | B | nové |  | ano |  |
| `set.nextTrack` | Další skladba | tlačítko | C | Dinoš |  | hra zatím nemá hudbu | jen když: hra má víc skladeb |
| `set.jukebox` | Výběr skladby | výběr | C | Dinoš, jinak | hned | hra zatím nemá hudbu | neukládá se; V Dinošovi jen ve Vývojáři. |
| `set.muteOnBlur` | Ztišit při neaktivním okně | zap / vyp | C | nové | hned |  |  |

## Nastavení · Obraz

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `set.quality` | Kvalita obrazu | výběr | B | nové | hned |  |  |
| `set.renderScale` | Měřítko vykreslení | posuvník | B | nové | hned | ano |  |
| `set.shadows` | Stíny | zap / vyp | B | Dinoš | hned | plátno 2D bez stínů | jen když: vykreslování stíny umí; V Dinošovi se ukazuje i tam, kde nic nedělá. |
| `set.fullscreen` | Celá obrazovka | zap / vyp | B | Dinoš, jinak | hned | ano | neukládá se; jen když: prohlížeč ji dovolí |
| `set.reducedMotion` | Omezit pohyb | zap / vyp | B | nové | hned |  | Vypne otřesy, záblesky a částice přes celou obrazovku. |
| `set.particles` | Částice a efekty počasí | výběr | C | nové | hned |  |  |
| `set.fpsCap` | Omezení snímků | výběr | C | nové | hned |  |  |
| `set.renderer` | Vykreslování | výběr | C | Dinoš, jinak | po načtení | jedno vykreslování | jen když: hra má dvě vykreslování; V Dinošovi se hodnota ukládá, ale nikde nečte. |
| `set.showFps` | Ukazatel snímků | zap / vyp | C | nové | hned |  |  |
| `set.contrast` | Výraznější ukazatele | zap / vyp | C | nové | hned |  |  |

## Nastavení · Ovládání

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `set.touchButtons` | Dotyková tlačítka | výběr | A | Dinoš, jinak | hned |  | Dinoš má jen zaškrtávátko „vždy“. |
| `set.keyScheme` | Rozložení kláves | výběr | B | nové | hned |  |  |
| `set.rebind` | Přemapovat klávesy | tlačítko | C | nové |  |  |  |
| `set.touchSize` | Velikost dotykových tlačítek | posuvník | C | nové | hned |  |  |
| `set.swipe` | Gesta tahem | zap / vyp | C | Dinoš, jinak | hned |  | V Dinošovi vždy zapnutá. |
| `set.mirror` | Prohodit strany tlačítek | zap / vyp | C | nové | hned |  |  |
| `set.vibration` | Vibrace | zap / vyp | C | nové | hned |  | jen když: zařízení vibrace umí |
| `set.gamepad` | Gamepad | údaj | C | nové |  |  | Stav připojení a přiřazení tlačítek. |

## Nastavení · Svět

Stránka pro volby jedné konkrétní hry.

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `set.world.weather` | Počasí | výběr | C | Dinoš | hned | hra nemá počasí |  |
| `set.world.daylight` | Denní doba | výběr | C | Dinoš | hned | hra nemá denní dobu |  |
| `set.world.timeScale` | Rychlost času světa | výběr | C | Dinoš | hned | hra nemá čas světa |  |

## Nastavení · Data

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `set.reset` | Obnovit výchozí nastavení | tlačítko | A | nové |  | ano | potvrzení |
| `set.storage` | Stav ukládání | údaj | A | nové |  | ano | „Uloženo“, nebo varování, že se v tomto prostředí nic neuchová. |
| `set.clearRecords` | Smazat rekordy | tlačítko | B | nové |  |  | potvrzení |
| `set.export` | Zálohovat data do souboru | tlačítko | C | nové |  |  |  |
| `set.import` | Obnovit data ze souboru | tlačítko | C | nové |  |  | potvrzení |

## Jak hrát

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `help.controls` | Ovládání | údaj | A | Dinoš |  |  | Generuje se z mapy vstupů, ne ručně. |
| `help.goal` | Cíl a pravidla | údaj | A | Dinoš, jinak |  |  | Dvě až tři věty. |
| `help.elements` | Průvodce prvky hry | údaj | B | Dinoš |  |  | Z dat hry: překážka, jak ji zvládnout, odkdy se objevuje. |
| `help.modes` | Režimy | údaj | B | Dinoš |  |  |  |
| `help.tips` | Tipy | údaj | C | Dinoš |  |  |  |
| `help.try` | Vyzkoušet v klidném režimu | tlačítko | C | nové |  |  |  |

## Rekordy a statistiky

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `rec.best` | Rekord pro každou obtížnost | údaj | B | Dinoš, jinak |  |  | Dinoš ukazuje jen ten pro právě zvolenou. |
| `rec.last` | Posledních deset běhů | údaj | C | nové |  |  |  |
| `rec.totals` | Součty za celou dobu | údaj | C | nové |  |  |  |
| `rec.achievements` | Úspěchy | údaj | C | nové |  |  |  |

## Průvodce

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `col.entries` | Karty prvků s obrázkem | údaj | C | Dinoš, jinak |  |  | Dinoš: katalog 43 modelů a 10 drobností ve Vývojáři. |
| `col.unlock` | Odemykání podle postupu | údaj | C | Dinoš, jinak |  |  |  |

## O hře

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `about.version` | Verze a datum sestavení | údaj | A | Dinoš, jinak |  |  |  |
| `about.credits` | Autoři a nástroje | údaj | A | nové |  |  |  |
| `about.licences` | Původ a licence dat | údaj | A | nové |  |  | Z docs/DATA_SOURCES.md, ne z paměti. |
| `about.changes` | Co je nového | údaj | C | nové |  |  |  |

## Ve hře

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `hud.score` | Skóre | údaj | A | Dinoš |  | ano |  |
| `hud.progress` | Hlavní míra postupu | údaj | A | Dinoš |  |  | Dinoš: metry. |
| `hud.countdown` | Odpočet před startem | údaj | A | Dinoš |  |  |  |
| `hud.touch` | Dotyková tlačítka | údaj | A | Dinoš |  |  | jen když: dotykové zařízení |
| `hud.mode` | Režim a obtížnost | údaj | B | Dinoš |  |  |  |
| `hud.combo` | Kombo | údaj | B | Dinoš |  |  |  |
| `hud.status` | Stav hráče | údaj | B | Dinoš |  |  | Dinoš: štít. |
| `hud.hint` | Kontextová rada | údaj | B | Dinoš |  |  |  |
| `hud.toasts` | Hlášky | údaj | B | Dinoš |  |  | Nejvýš tři, nikdy přes kartu pauzy. |
| `hud.speed` | Rychlost | údaj | C | Dinoš |  |  |  |

## Pauza

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `pause.resume` | Pokračovat | tlačítko | A | Dinoš |  | ano |  |
| `pause.restart` | Začít znovu | tlačítko | A | Dinoš, jinak |  | ano | potvrzení; V Dinošovi bez potvrzení. |
| `pause.settings` | Nastavení | tlačítko | A | Dinoš |  | ano |  |
| `pause.toMenu` | Do menu | tlačítko | A | Dinoš, jinak |  | ano | potvrzení; Dinoš: „Do háje“, bez potvrzení. |
| `pause.help` | Jak hrát | tlačítko | B | nové |  |  |  |
| `pause.keys` | Připomenutí kláves pro návrat | údaj | B | Dinoš |  |  |  |
| `pause.dev` | Vývojář | tlačítko | B | Dinoš |  |  | jen ?dev |
| `pause.stats` | Dosavadní výsledek běhu | údaj | C | nové |  |  |  |

## Výsledky

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `res.title` | Nadpis: konec, nebo nový rekord | údaj | A | Dinoš |  |  |  |
| `res.stats` | Čísla běhu | údaj | A | Dinoš |  |  | Čtyři až šest údajů. Dinoš: vzdálenost, skóre, jantar, kousnutí. |
| `res.again` | Hrát znovu | tlačítko | A | Dinoš |  |  | Výchozí fokus; Enter spustí další běh. |
| `res.toMenu` | Do menu | tlačítko | A | Dinoš |  |  |  |
| `res.reason` | Důvod konce s radou | údaj | B | Dinoš |  |  |  |
| `res.best` | Srovnání s rekordem | údaj | B | Dinoš, jinak |  |  |  |
| `res.share` | Sdílet výsledek | tlačítko | C | nové |  |  |  |
| `res.seed` | Seed běhu | údaj | C | nové |  |  | Aby šel běh zopakovat. |

## Systémová okna

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `sys.confirm` | Potvrzení ničivé akce | údaj | A | nové |  |  | Výchozí fokus na „Zpět“. |
| `sys.rotate` | Výzva k otočení zařízení | údaj | B | nové |  | ano | jen když: hra vyžaduje jednu orientaci |
| `sys.focusLost` | Pauza při ztrátě okna | údaj | A | Dinoš |  | ano |  |

## Vývojář

Celá obrazovka jen s ?dev.

| Id | Položka | Prvek | Úroveň | Původ | Platí | Arkáda v0.2 | Poznámka |
|---|---|---|---|---|---|---|---|
| `dev.status` | Stavový řádek | údaj | B | Dinoš |  | ano | jen ?dev; Vykreslování, snímky, počty objektů. |
| `dev.seek` | Skok na úsek nebo vzdálenost | tlačítko | B | Dinoš |  |  | jen ?dev |
| `dev.invulnerable` | Nezranitelnost | zap / vyp | B | Dinoš | hned |  | jen ?dev; neukládá se |
| `dev.colliders` | Zobrazit kolize | zap / vyp | B | Dinoš | hned |  | jen ?dev; neukládá se |
| `dev.timeScale` | Měřítko času | výběr | B | Dinoš, jinak | hned |  | jen ?dev; neukládá se |
| `dev.probe` | Přehled voleb: nastaveno × skutečnost | údaj | B | nové |  |  | jen ?dev |
| `dev.unwired` | Nezapojené položky katalogu | údaj | B | nové |  |  | jen ?dev |
| `dev.reset` | Obnovit výchozí | tlačítko | B | Dinoš |  |  | jen ?dev |
| `dev.spawn` | Vložit prvek před hráče | tlačítko | C | Dinoš |  |  | jen ?dev |
| `dev.clear` | Odstranit překážky | tlačítko | C | Dinoš |  |  | jen ?dev |
| `dev.generator` | Generovat překážky | zap / vyp | C | Dinoš | hned |  | jen ?dev; neukládá se |
| `dev.world` | Přepínače světa | údaj | C | Dinoš |  |  | jen ?dev; Dinoš: počasí, čas, vrstvy oblohy, hustota vegetace. |
| `dev.audio` | Hudební režie | údaj | C | Dinoš |  |  | jen ?dev |
| `dev.assets` | Katalog modelů | údaj | C | Dinoš |  |  | jen ?dev |
