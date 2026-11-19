// Nastavení, která arkáda deklaruje Shellu. Každá položka má apply (provede změnu)
// a probe (vrátí, co engine skutečně má). Co hra neumí, tu není, a v menu se to neobjeví.

export function createSettingsDefs({ E, audio, renderer, view, time }) {
  const canFullscreen = () => !!document.documentElement.requestFullscreen && document.fullscreenEnabled !== false;

  return [
    {
      id: 'speed',
      page: 'hra',
      label: 'Rychlost hry',
      type: 'select',
      def: 1,
      options: [
        { value: 0.5, label: '50 %' },
        { value: 0.75, label: '75 %' },
        { value: 1, label: '100 %' },
        { value: 1.25, label: '125 %' },
        { value: 1.5, label: '150 %' },
      ],
      // rychlost hry a vývojářské měřítko času jsou jedna hodnota: timeScale = hra × vývojář
      apply: (v) => {
        time.game = v;
        E.timeScale = time.game * time.dev;
      },
      probe: () => E.timeScale / time.dev,
    },
    {
      id: 'renderScale',
      page: 'obraz',
      label: 'Měřítko vykreslení',
      type: 'range',
      min: 50,
      max: 150,
      step: 25,
      def: 100,
      format: (v) => `${v} %`,
      tolerance: 3, // plátno má celé body, poměr vychází přibližně
      apply: (v) => {
        renderer.setPixelScale(v / 100);
        view.dirty = true;
      },
      probe: () => Math.round(renderer.measuredPixelScale() * 100),
    },
    {
      id: 'fullscreen',
      page: 'obraz',
      label: 'Celá obrazovka',
      type: 'toggle',
      def: false,
      persist: false, // prohlížeč ji bez gesta uživatele nezapne, nemá smysl ji ukládat
      when: canFullscreen,
      apply: (v) => {
        if (v === !!document.fullscreenElement) return undefined;
        if (!v) return document.exitFullscreen();
        return document.documentElement.requestFullscreen().then(() => {
          // zamknout šířku jde jen v celé obrazovce a jen někde; neúspěch nevadí
          screen.orientation?.lock?.('landscape')?.catch?.(() => {});
        });
      },
      probe: () => !!document.fullscreenElement,
      watch: (cb) => document.addEventListener('fullscreenchange', () => cb(!!document.fullscreenElement)),
    },
    {
      id: 'volume',
      page: 'zvuk',
      label: 'Hlasitost',
      type: 'range',
      min: 0,
      max: 100,
      step: 5,
      def: 60,
      format: (v) => `${v} %`,
      tolerance: 0.5,
      apply: (v) => audio.setVolume(v / 100),
      probe: () => audio.getVolume() * 100,
    },
    {
      id: 'testSound',
      page: 'zvuk',
      label: 'Test zvuku',
      actionLabel: 'Přehrát',
      type: 'action',
      run: () => {
        audio.unlock();
        audio.pickup(1);
      },
    },
  ];
}
