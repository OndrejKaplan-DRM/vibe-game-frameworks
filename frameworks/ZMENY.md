# Změny frameworků

## 2026-11-19 — opravy z prvního použití (M0 + Shell S0 + arkáda M1)

Postaveno podle `01_CORE`, `02_SHELL` a `40_CASE`. Kde specifikace nestačila nebo vedla ke špatnému výsledku:

| # | Kde | Co drhlo | Oprava |
|---|---|---|---|
| 1 | `02_SHELL` oddíl 1 | Adaptér neměl jak Shellu říct, v jakém je hra režimu. Shell bez toho neví, kterou obrazovku ukázat. | Doplněna povinná část `state: { mode(), onMode(fn) }`. |
| 2 | `40_CASE` A1 | Proměnná výška skoku podle specifikace dala při ťuknutí skok ~0,4 m; bedna 0,6 m nešla na dotyku přeskočit vůbec. | Minimální výška skoku jako návrhová veličina a vzorec `cutAfterHeight`. Test průchodnosti ťuknutím. |
| 3 | `40_CASE` A1 | Obvyklá integrace dá při 60 Hz skok o ~5 % nižší než návrh. | Předepsán přesný krok pro stálé zrychlení. |
| 4 | `40_CASE` A1 | „6 kroků“ kojotího času a paměti stisku nebylo jednoznačné; závisí na pořadí operací v kroku. | Pořadí v kroku zapsáno. |
| 5 | `40_CASE` A8 | „Dotyk kdekoli“ na plátně nestačí: okraje kolem plátna nereagovaly, tlačítko pauzy by naopak skákalo. Krátké ťuknutí mezi dvěma kroky se ztrácelo. | Dotyk z celé herní plochy, prvky Shellu vyloučeny, stisk se pamatuje do příštího kroku. |
| 6 | `02_SHELL` oddíl 3, S0 | Na telefonu není Esc, hra nešla zapauzovat. | Tlačítko pauzy je součást S0. |
| 7 | `01_CORE` 4.2 | Akumulátor času bez rezervy dá kvůli zaokrouhlení 59 nebo 61 kroků za sekundu. | Rezerva `1e-9` v podmínce smyčky. |
| 8 | `40_CASE` A12 | Pevný poměr 16:9 je na telefonu na výšku jen úzký pruh. | Zapsáno jako rozhodnutí, které je potřeba udělat předem (zde zatím otevřené, viz `docs/REQUIREMENTS.md` R-018). |
| 9 | `01_CORE` oddíl 7 | Mezi voláními testu běží skutečná smyčka a mění stav (snímek po `sim()` zachytil jiný okamžik). | Doplněno pravidlo o pauze kolem `sim()` a o logice bez DOM. |

Neopraveno, jen zaznamenáno: vývojářský přehled kreslený hrou se může krýt s prvky Shellu (tlačítko pauzy). Správné řešení je přehled jako součást Shellu (krok S4) s vyhrazenými oblastmi.
