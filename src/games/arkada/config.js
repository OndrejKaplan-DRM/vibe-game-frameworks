// Návrhové veličiny arkády. Jediné místo s čísly (case 40, invarianty A1 a A6).
// Jednotky: metry, sekundy, kroky simulace.

export const VERSION = 'v0.1 · M0 + Shell S0 + arkáda M1 · 2026-11-19';

const jumpHeight = 1.2; // m, plný skok (tlačítko držené)
const timeToApex = 0.35; // s
const minJumpHeight = 1.0; // m, nejnižší skok (pouhé ťuknutí); musí s rezervou přeskočit bednu
const cutFactor = 0.5; // zkrácení rychlosti nahoru při puštění tlačítka

export const CFG = {
  stepHz: 60,

  jump: {
    height: jumpHeight,
    timeToApex,
    gravity: (2 * jumpHeight) / (timeToApex * timeToApex), // 19,59 m/s²
    v0: (2 * jumpHeight) / timeToApex, // 6,86 m/s
    minHeight: minJumpHeight,
    cutFactor,
    // zkrátit skok lze až po nastoupání této výšky; pak vrchol vyjde přesně na minHeight
    cutAfterHeight: (minJumpHeight - jumpHeight * cutFactor * cutFactor) / (1 - cutFactor * cutFactor),
    coyoteSteps: 6, // skok ještě tolik kroků po opuštění hrany
    bufferSteps: 6, // stisk platí tolik kroků (včetně kroku stisku)
  },

  speed: 5, // m/s, v M1 stálá

  player: {
    drawW: 0.7,
    drawH: 1.0,
    w: 0.5, // zranitelná oblast je menší než obrázek
    h: 0.9,
    pickupMargin: 0.25, // oblast sbírání je naopak větší
  },

  crate: { w: 1.0, h: 0.6, aheadMin: 12, aheadMax: 18 },
  fruit: { r: 0.25, heights: [0.5, 1.5, 1.9], afterCrateMin: 3, afterCrateMax: 6 },

  behind: 6, // jak daleko za hráčem se objekt recykluje

  view: { w: 16, h: 9, playerX: 4, groundY: 1.5 }, // logické rozlišení v metrech
};
