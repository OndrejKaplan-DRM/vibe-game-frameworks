// Řízení ≠ tělo (01_CORE 4.3): controller vyrábí záměr, svět ho provádí.
// Hráč, skript v testu a později robot jsou jen různé controllery.

const JUMP_CODES = new Set(['Space', 'ArrowUp', 'KeyW']);

/** Klávesnice (podle event.code) + dotyk nebo myš kdekoli na herní ploše (plátno i okraje kolem něj). */
export function createPlayerController(surface, { isPlaying }) {
  let held = false;
  let tapped = false; // stisk kratší než jeden krok se nesmí ztratit
  const down = () => {
    held = true;
    tapped = true;
  };
  const up = () => {
    held = false;
  };

  const onKeyDown = (e) => {
    if (!JUMP_CODES.has(e.code)) return;
    if (isPlaying()) {
      e.preventDefault(); // mezerník a šipky nesmí posouvat stránku
      if (!e.repeat) down();
    }
  };
  const onKeyUp = (e) => {
    if (JUMP_CODES.has(e.code)) up();
  };
  const onPointerDown = (e) => {
    // prvky Shellu (tlačítko pauzy) leží nad plochou a skok spouštět nesmí
    if (e.target !== surface && e.target.parentElement !== surface) return;
    if (e.target.id === 'shell') return;
    if (isPlaying()) {
      e.preventDefault();
      down();
    }
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  surface.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  window.addEventListener('blur', up);
  surface.addEventListener('contextmenu', (e) => e.preventDefault());

  return {
    think() {
      const jump = held || tapped;
      tapped = false;
      return { jump };
    },
    release: up,
  };
}

/** Skript pro testy: seznam změn { at: pořadí kroku od nuly, jump: boolean }. */
export function createScriptController(script = []) {
  let i = 0;
  let jump = false;
  const sorted = [...script].sort((a, b) => a.at - b.at);
  let k = 0;
  return {
    think() {
      while (k < sorted.length && sorted[k].at <= i) jump = !!sorted[k++].jump;
      i++;
      return { jump };
    },
  };
}
