/**
 * Movimiento del portfolio (Anime.js 4). Dos detalles:
 *  1. Portada: el monograma PV se traza una vez con createTimeline() (~0,7 s): la P y después la V en verde.
 *  2. Ficha de proyecto: transición breve al pasar el puntero o enfocar la imagen enlazada.
 *
 * El HTML ya contiene el monograma final. Con movimiento reducido, o si este módulo no se ejecuta,
 * no se anima nada. La ilustración de la portada es estática. Ajusta tiempos y curvas en MOTION.
 */
import { animate, createTimeline, stagger, svg, utils } from 'animejs';

export const MOTION = {
  /** Posiciones absolutas (ms) dentro de la secuencia del monograma. Total ≈ 1000 ms. */
  monogram: {
    ease: 'out(3)',
    /** Trazos en orden de dibujo: asta y panza de la P, brazos de la V, curva de la C. */
    letters: { at: 0, duration: 260, stagger: 120 },
    /** Puntos de la C: llegan desde estos desplazamientos (unidades de la rejilla 48 × 48). */
    dots: { at: 600, duration: 300, stagger: 60, from: [[-4, 4], [0, 5], [5, 2]] },
  },
  sheet: { duration: 420, ease: 'outExpo', imageScale: 1.025, lineScale: 2 },
} as const;

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
/** Solo en desarrollo: `?motion=1` fuerza la animación aunque el sistema pida movimiento reducido. */
const forceMotion = import.meta.env.DEV && new URLSearchParams(location.search).has('motion');

function playMonogram(): void {
  const mono = document.querySelector<SVGSVGElement>('[data-mono-anim]');
  if (!mono) {
    root.classList.remove('motion-intro');
    return;
  }

  const strokes = svg.createDrawable([...mono.querySelectorAll<SVGPathElement>('[data-mono-stroke]')]);
  const dots = [...mono.querySelectorAll<SVGCircleElement>('[data-mono-dot]')];
  const m = MOTION.monogram;

  // Estado inicial, fijado de forma síncrona antes de mostrar el SVG (sin parpadeo).
  utils.set(strokes, { draw: '0 0' });
  dots.forEach((dot, i) => {
    const [x, y] = m.dots.from[i % m.dots.from.length];
    utils.set(dot, { opacity: 0, translateX: x, translateY: y });
  });
  root.classList.remove('motion-intro');

  const tl = createTimeline({ defaults: { ease: m.ease } }).add(
    strokes,
    { draw: '0 1', duration: m.letters.duration, delay: stagger(m.letters.stagger) },
    m.letters.at,
  );
  // Puntos opcionales (el monograma PV actual no los usa).
  if (dots.length) {
    tl.add(dots, { opacity: 1, translateX: 0, translateY: 0, duration: m.dots.duration, delay: stagger(m.dots.stagger) }, m.dots.at);
  }
}

function bindSheet(): void {
  const trigger = document.querySelector<HTMLAnchorElement>('[data-sheet-trigger]');
  const image = trigger?.querySelector('img');
  const line = document.querySelector<HTMLElement>('[data-sheet-line]');
  if (!trigger || !image) return;

  const { duration, ease, imageScale, lineScale } = MOTION.sheet;
  const to = (active: boolean) => {
    animate(image, { scale: active ? imageScale : 1, duration, ease });
    if (line) animate(line, { scaleX: active ? lineScale : 1, duration, ease });
  };

  // Puntero solo en dispositivos con hover real; en táctil no hay información oculta.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  trigger.addEventListener('pointerenter', () => finePointer.matches && to(true));
  trigger.addEventListener('pointerleave', () => finePointer.matches && document.activeElement !== trigger && to(false));
  trigger.addEventListener('focus', () => trigger.matches(':focus-visible') && to(true));
  trigger.addEventListener('blur', () => to(false));
}

if (reducedMotion.matches && !forceMotion) {
  root.classList.remove('motion-intro');
} else {
  playMonogram();
  bindSheet();
}
