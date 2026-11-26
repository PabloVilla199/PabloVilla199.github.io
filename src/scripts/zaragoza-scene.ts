/**
 * Visor 3D «Zaragoza, trazo a trazo» (Three.js + Anime.js).
 *
 * - La escena es el control (role="button", enfocable). Un clic/toque, o Intro/Espacio con el foco, dibuja la
 *   escena completa en una sola secuencia:
 *   Ebro → Puente de Piedra → Pilar; cada línea avanza de su primer punto al último con un punto
 *   luminoso en el extremo. Anime.js (createTimeline) encadena las líneas y, al final, la entrada de la firma.
 * - Al terminar la escena queda visible. El siguiente clic limpia, oculta la firma y vuelve a dibujar.
 *   Durante el dibujo se ignoran las pulsaciones.
 * - Pulsar ≠ arrastrar: arrastrar orbita la cámara (límites de inclinación) sin tocar el dibujo, y el ángulo
 *   se conserva al volver a dibujar. En táctil, el gesto horizontal orbita y el vertical desplaza la página.
 * - Sin botones visibles: antes de empezar hay una invitación («Haz clic / Toca para dibujar») que se oculta
 *   al dibujar. Con el foco, las flechas izquierda/derecha giran la cámara (también a mitad del dibujo).
 * - El trazo progresivo se ve siempre (lo inicia el visitante con su clic). Con movimiento reducido, la firma y
 *   «Zaragoza» aparecen con un fundido sin desplazamiento y la cámara gira sin suavizado.
 * - Orden: orillas y río → puente → Pilar → firma «Pablo Villa» → «Zaragoza».
 * - Sin WebGL (o si falla la carga) se queda la versión estática SVG del componente.
 */
import { createTimeline, utils } from 'animejs';
import { PARTS, START, VIEW, signatureAnchor, type Polyline, type Vec3 } from '../data/zaragoza3d';

export const SCENE_MOTION = {
  /** Suavizado de la cámara (0–1 por fotograma). */
  damping: 0.12,
  rotateStep: 30,
  dragAzimuth: 0.45,
  dragPolar: 0.3,
  /** Píxeles de movimiento a partir de los que una pulsación se considera arrastre. */
  tapThreshold: 6,
  signature: { from: -36, duration: 750, ease: 'out(3)' },
} as const;

interface Labels {
  drawing: string;
  done: string;
  ariaStart: string;
  ariaDone: string;
  parts: string[];
}

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

const rad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Subdivide una polilínea para que el trazo avance de forma continua. */
function densify(line: Polyline, step = 0.05): Vec3[] {
  const out: Vec3[] = [line[0]];
  for (let i = 1; i < line.length; i++) {
    const [ax, ay, az] = line[i - 1];
    const [bx, by, bz] = line[i];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay, bz - az) / step));
    for (let k = 1; k <= n; k++) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n, az + ((bz - az) * k) / n]);
  }
  return out;
}

const lengthOf = (pts: Vec3[]) =>
  pts.reduce((sum, p, i) => (i ? sum + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1], p[2] - pts[i - 1][2]) : 0), 0);

async function setup(root: HTMLElement): Promise<void> {
  const labels = JSON.parse(root.dataset.labels ?? '{}') as Labels;
  const stage = root.querySelector<HTMLElement>('[data-scene-stage]');
  const mount = root.querySelector<HTMLElement>('[data-scene-canvas]');
  const progress = root.querySelector<HTMLElement>('[data-scene-progress]');
  const sigOuter = root.querySelector<HTMLElement>('[data-scene-signature]');
  const sigInner = root.querySelector<HTMLElement>('[data-scene-signature-inner]');
  const title = root.querySelector<HTMLElement>('[data-scene-title]');
  const unpend = () => document.documentElement.classList.remove('sketch-pending');
  const fallback = () => {
    root.setAttribute('data-fallback', '');
    unpend();
  };
  if (!stage || !mount || !progress || !sigOuter || !sigInner) return fallback();
  if (!hasWebGL()) return fallback();

  let THREE: typeof import('three');
  let Line2: typeof import('three/examples/jsm/lines/Line2.js').Line2;
  let LineGeometry: typeof import('three/examples/jsm/lines/LineGeometry.js').LineGeometry;
  let LineMaterial: typeof import('three/examples/jsm/lines/LineMaterial.js').LineMaterial;
  try {
    const mods = await Promise.all([
      import('three'),
      import('three/examples/jsm/lines/Line2.js'),
      import('three/examples/jsm/lines/LineGeometry.js'),
      import('three/examples/jsm/lines/LineMaterial.js'),
    ]);
    THREE = mods[0];
    Line2 = mods[1].Line2;
    LineGeometry = mods[2].LineGeometry;
    LineMaterial = mods[3].LineMaterial;
  } catch {
    return fallback();
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  /** Solo en desarrollo: `?motion=1` fuerza la animación aunque el sistema pida movimiento reducido. */
  const forceMotion = import.meta.env.DEV && new URLSearchParams(location.search).has('motion');
  const animated = () => !reducedMotion.matches || forceMotion;

  // --- Renderizador, escena y cámara -----------------------------------------------------------
  let renderer: import('three').WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return fallback();
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 11, 0.1, 100);
  const target = new THREE.Vector3(...VIEW.target);
  const view = { az: VIEW.azimuth, polar: VIEW.polar };
  const goal = { az: VIEW.azimuth, polar: VIEW.polar };

  const css = getComputedStyle(document.documentElement);
  const accent = new THREE.Color(css.getPropertyValue('--color-accent').trim() || '#4ec9b0');
  const soft = new THREE.Color(css.getPropertyValue('--color-text-soft').trim() || '#a7c3bc');
  const materials = {
    main: new LineMaterial({ color: accent, linewidth: 2 }),
    soft: new LineMaterial({ color: soft, linewidth: 1.6 }),
    faint: new LineMaterial({ color: accent, linewidth: 1.4, transparent: true, opacity: 0.4 }),
  };

  // --- Trazos: una Line2 por polilínea (independientes, sin uniones entre ellas) ------------------
  interface Stroke {
    part: number;
    line: import('three/examples/jsm/lines/Line2.js').Line2;
    pts: Vec3[];
    segs: number;
    length: number;
    state: { p: number };
  }
  const strokes: Stroke[] = [];
  PARTS.forEach((part, pi) => {
    const items = [
      ...part.lines.map((l) => ({ l, tone: part.tone })),
      ...(part.faintLines ?? []).map((l) => ({ l, tone: 'faint' as const })),
    ];
    items.forEach(({ l, tone }) => {
      const pts = densify(l);
      const geometry = new LineGeometry();
      geometry.setPositions(pts.flat());
      const line = new Line2(geometry, materials[tone]);
      line.computeLineDistances();
      geometry.instanceCount = 0;
      scene.add(line);
      strokes.push({ part: pi, line, pts, segs: pts.length - 1, length: lengthOf(pts), state: { p: 0 } });
    });
  });

  // Punto luminoso (extremo del trazo) y punto inicial.
  const glow = document.createElement('canvas');
  glow.width = glow.height = 64;
  const g = glow.getContext('2d');
  if (g) {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.9)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  }
  const glowTexture = new THREE.CanvasTexture(glow);
  const makeSprite = (size: number) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: accent, depthWrite: false, transparent: true }));
    sprite.scale.set(size, size, 1);
    scene.add(sprite);
    return sprite;
  };
  const tip = makeSprite(0.42);
  tip.visible = false;
  const startDot = makeSprite(0.28);
  startDot.position.set(...START);

  const applyStroke = (s: Stroke) => {
    const k = Math.round(clamp(s.state.p, 0, 1) * s.segs);
    s.line.geometry.instanceCount = k;
    if (s.state.p > 0 && s.state.p < 1) {
      tip.visible = true;
      tip.position.set(...s.pts[k]);
    }
  };

  // --- Cámara orbital con suavizado -------------------------------------------------------------
  const placeCamera = () => {
    const az = rad(view.az);
    const po = rad(view.polar);
    const d = VIEW.distance;
    camera.position.set(target.x + d * Math.sin(po) * Math.sin(az), target.y + d * Math.cos(po), target.z + d * Math.sin(po) * Math.cos(az));
    camera.lookAt(target);
  };

  const setGoal = (az: number, polar: number) => {
    goal.az = az;
    goal.polar = clamp(polar, VIEW.minPolar, VIEW.maxPolar);
    if (!animated()) {
      view.az = goal.az;
      view.polar = goal.polar;
    }
  };

  // --- Tamaño ----------------------------------------------------------------------------------
  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    Object.values(materials).forEach((m) => m.resolution.set(w, h));
  };
  new ResizeObserver(resize).observe(stage);

  // --- Firma anclada a la escena, siempre de cara a la cámara (HTML proyectado) -------------------
  const projected = new THREE.Vector3();
  const placeSignature = () => {
    projected.set(...signatureAnchor(view.az)).project(camera);
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const half = sigOuter.offsetWidth / 2;
    const x = clamp(((projected.x + 1) / 2) * w, half + 8, w - half - 8);
    const y = clamp(((1 - projected.y) / 2) * h, 24, h - 24);
    sigOuter.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
    sigOuter.style.visibility = projected.z < 1 ? 'visible' : 'hidden';
  };

  // --- Bucle de render (solo mientras el panel es visible) ----------------------------------------
  let onScreen = true;
  new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting)).observe(stage);
  const frame = () => {
    requestAnimationFrame(frame);
    if (!onScreen) return;
    const k = animated() ? SCENE_MOTION.damping : 1;
    view.az += (goal.az - view.az) * k;
    view.polar += (goal.polar - view.polar) * k;
    placeCamera();
    renderer.render(scene, camera);
    placeSignature();
  };

  // --- Dibujo -----------------------------------------------------------------------------------
  let busy = false;
  let signatureAnim: ReturnType<typeof createTimeline> | null = null;
  const fill = (template: string, part: string) => template.replace('{part}', part);

  /**
   * Final de la secuencia: entra la firma (desde un lateral) y después aparece «Zaragoza».
   * Con movimiento reducido ambos aparecen con un fundido, sin desplazamiento.
   */
  const showSignature = () => {
    const m = SCENE_MOTION.signature;
    const slide = animated();
    signatureAnim = createTimeline()
      .add(sigInner, { opacity: [0, 1], translateX: slide ? [m.from, 0] : 0, duration: m.duration, ease: m.ease }, 0)
      .add(title ?? [], { opacity: [0, 1], translateY: slide ? [10, 0] : 0, duration: 600, ease: 'out(3)' }, m.duration * 0.6);
  };

  const clear = () => {
    signatureAnim?.pause();
    signatureAnim = null;
    if (title) utils.set(title, { opacity: 0, translateY: 0 });
    strokes.forEach((s) => {
      s.state.p = 0;
      s.line.geometry.instanceCount = 0;
    });
    tip.visible = false;
    utils.set(sigInner, { opacity: 0, translateX: 0 });
  };

  // Termina en cuanto se completa el último trazo: la firma entra aparte y un clic durante su entrada
  // ya vuelve a dibujar.
  const finish = () => {
    busy = false;
    tip.visible = false;
    stage.removeAttribute('aria-busy');
    progress.textContent = `${labels.ariaDone} ${labels.done}`;
    showSignature();
  };

  const draw = () => {
    if (busy) return; // durante el dibujo se ignoran las pulsaciones
    clear();
    busy = true;
    root.setAttribute('data-started', ''); // oculta la invitación
    stage.setAttribute('aria-busy', 'true');

    const tl = createTimeline({ onComplete: finish });
    let at = 0;
    PARTS.forEach((part, pi) => {
      const list = strokes.filter((s) => s.part === pi);
      const total = list.reduce((sum, s) => sum + s.length, 0) || 1;
      tl.call(() => {
        progress.textContent = fill(labels.drawing, labels.parts[pi]);
      }, at);
      list.forEach((s) => {
        const duration = Math.max(24, Math.round((part.duration * s.length) / total));
        tl.add(s.state, { p: [0, 1], duration, ease: 'linear', onUpdate: () => applyStroke(s), onComplete: () => applyStroke(s) }, at);
        at += duration;
      });
    });
  };

  // --- Interacción: pulsar dibuja, arrastrar orbita ----------------------------------------------
  let pointer: { id: number; x: number; y: number; az: number; polar: number; drag: boolean; touch: boolean } | null = null;
  mount.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, az: goal.az, polar: goal.polar, drag: false, touch: e.pointerType === 'touch' };
  });
  mount.addEventListener('pointermove', (e) => {
    if (!pointer || e.pointerId !== pointer.id) return;
    const dx = e.clientX - pointer.x;
    const dy = e.clientY - pointer.y;
    if (!pointer.drag && Math.hypot(dx, dy) > SCENE_MOTION.tapThreshold) {
      // En táctil, un gesto vertical es scroll de la página: no es ni toque ni órbita.
      if (pointer.touch && Math.abs(dy) > Math.abs(dx)) {
        pointer = null;
        return;
      }
      pointer.drag = true;
      try {
        mount.setPointerCapture(e.pointerId);
      } catch {
        /* el puntero ya no está activo: se sigue sin captura */
      }
    }
    if (pointer.drag) {
      setGoal(pointer.az - dx * SCENE_MOTION.dragAzimuth, pointer.touch ? goal.polar : pointer.polar - dy * SCENE_MOTION.dragPolar);
    }
  });
  mount.addEventListener('pointerup', (e) => {
    if (!pointer || e.pointerId !== pointer.id) return;
    const wasDrag = pointer.drag;
    pointer = null;
    if (!wasDrag) draw(); // toque/clic: dibuja (o limpia y vuelve a dibujar)
  });
  mount.addEventListener('pointercancel', () => (pointer = null));

  // Teclado: Intro/Espacio dibujan; flechas izquierda/derecha giran; Inicio vuelve al encuadre inicial.
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!e.repeat) draw();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setGoal(goal.az + (e.key === 'ArrowRight' ? 1 : -1) * SCENE_MOTION.rotateStep, goal.polar);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setGoal(VIEW.azimuth, VIEW.polar);
    }
  });

  // --- Arranque ----------------------------------------------------------------------------------
  resize();
  clear();
  progress.textContent = labels.ariaStart;
  stage.setAttribute('role', 'button');
  stage.setAttribute('tabindex', '0');
  stage.setAttribute('aria-label', stage.dataset.action ?? '');
  stage.setAttribute('aria-describedby', 'scene-desc scene-help');
  root.setAttribute('data-ready', '');
  unpend();
  requestAnimationFrame(frame);

  if (import.meta.env.DEV) {
    // Ganchos de prueba en desarrollo: estado de cámara y dibujo.
    (window as unknown as Record<string, unknown>).__zaragoza = {
      view,
      goal,
      setGoal,
      draw,
      drawn: () => strokes.map((s) => s.line.geometry.instanceCount / s.segs),
      parts: () => PARTS.map((_, pi) => strokes.filter((s) => s.part === pi).every((s) => s.line.geometry.instanceCount === s.segs)),
      busy: () => busy,
    };
  }
}

document.querySelectorAll<HTMLElement>('[data-scene]').forEach((root) => {
  void setup(root);
});
