// Co z katalogu nabídek (src/shell/catalog/arcade.js) má arkáda ve verzi 0.2.
// Slouží náhledu šablony a testu t5; až Shell bude číst katalog přímo (S2), nahradí to vazby.

/** Položky, které v0.2 má a jdou vyzkoušet. Vpravo id deklarace ve hře, pokud jde o volbu. */
export const ARKADA_WIRED = {
  'title.play': null,
  'title.settings': null,
  'title.version': null,
  'bar.pause': null,
  'set.gameSpeed': 'speed',
  'set.vol.master': 'volume',
  'set.testSound': 'testSound',
  'set.renderScale': 'renderScale',
  'set.fullscreen': 'fullscreen',
  'set.reset': null,
  'set.storage': null,
  'hud.score': null,
  'pause.resume': null,
  'pause.restart': null, // zatím bez potvrzení
  'pause.settings': null,
  'pause.toMenu': null, // zatím bez potvrzení
  'sys.rotate': null,
  'sys.focusLost': null,
  'dev.status': null,
};

/** Položky, které arkáda vědomě nemá, s důvodem. */
export const ARKADA_NA = {
  'title.quit': 'běží v prohlížeči',
  'boot.fallback': 'jedno vykreslování',
  'set.vol.music': 'hra zatím nemá hudbu',
  'set.vol.ambience': 'hra nemá zvuky prostředí',
  'set.nextTrack': 'hra zatím nemá hudbu',
  'set.jukebox': 'hra zatím nemá hudbu',
  'bar.nextTrack': 'hra zatím nemá hudbu',
  'bar.nowPlaying': 'hra zatím nemá hudbu',
  'set.shadows': 'plátno 2D bez stínů',
  'set.renderer': 'jedno vykreslování',
  'set.world.weather': 'hra nemá počasí',
  'set.world.daylight': 'hra nemá denní dobu',
  'set.world.timeScale': 'hra nemá čas světa',
};
