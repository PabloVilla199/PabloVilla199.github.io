/**
 * «Zaragoza, trazo a trazo» en 3D: maqueta lineal original y simplificada.
 * Ejes: X a lo largo del Ebro (oeste → este), Z de orilla a orilla (sur negativo, norte positivo), Y hacia arriba.
 *  - Ebro: franja de agua entre dos orillas (z = ±BANK), con ondas en el agua.
 *  - Puente de Piedra: cruza el río de la orilla norte a la sur (a lo largo de Z); tablero con grosor,
 *    cuatro arcos en cada cara apoyados en el agua y estribos en ambas orillas.
 *  - Pilar: en la orilla sur, cerca del puente: cuerpo, cuatro torres que arrancan del suelo en cada
 *    esquina (enrasadas con el zócalo) y tres cúpulas.
 * Cada parte es una lista de polilíneas independientes (no se unen entre sí). Lo usan el visor Three.js
 * (src/scripts/zaragoza-scene.ts) y la versión estática SVG (proyección en ZaragozaScene.astro).
 */
export type Vec3 = readonly [number, number, number];
export type Polyline = Vec3[];
export interface Part {
  id: 'ebro' | 'puente' | 'pilar';
  name: { es: string; en: string };
  /** Duración del trazo de la parte, en ms (se reparte entre sus líneas según su longitud). */
  duration: number;
  tone: 'main' | 'soft' | 'faint';
  lines: Polyline[];
  /** Líneas tenues que se trazan después de las principales (p. ej. ondas del agua). */
  faintLines?: Polyline[];
}

export const BANK = 1.6;
/** Punto de partida del dibujo: el extremo oeste de la orilla norte. */
export const START: Vec3 = [-5, 0, BANK];
/**
 * Ancla de la firma: delante del borde inferior de la maqueta, en el lado más cercano a la cámara.
 * Se recalcula con el azimut, así que la firma se desplaza un poco al orbitar sin tapar la escena.
 */
export const SIGNATURE_RADIUS = 3.7;
export const signatureAnchor = (azimuthDeg: number): Vec3 => {
  const a = (azimuthDeg * Math.PI) / 180;
  return [0.2 + SIGNATURE_RADIUS * Math.sin(a), 0, -0.5 + SIGNATURE_RADIUS * Math.cos(a)];
};
export const SIGNATURE = 'Pablo Villa';

const r = (n: number) => Math.round(n * 1000) / 1000;
const range = (steps: number) => Array.from({ length: steps + 1 }, (_, i) => i / steps);

/** Línea a lo largo de X con una ondulación suave en Z (orillas y ondas del agua). */
const waveX = (x0: number, x1: number, z: number, amp: number, periods: number, y = 0): Polyline =>
  range(64).map((t): Vec3 => [r(x0 + (x1 - x0) * t), y, r(z + amp * Math.sin(t * periods * Math.PI * 2))]);

/** Trazos discontinuos a lo largo de X (ondas del agua): `pieces` tramos con huecos entre ellos. */
const dashesX = (x0: number, x1: number, z: number, pieces: number, amp: number): Polyline[] =>
  Array.from({ length: pieces }, (_, i) => {
    const step = (x1 - x0) / pieces;
    const a = x0 + step * i;
    return range(8).map((t): Vec3 => [r(a + step * 0.62 * t), 0, r(z + amp * Math.sin(t * Math.PI * 2))]);
  });

/** Semielipse en el plano x = const, de z0 a z1, apoyada en y = base. */
const archZ = (x: number, z0: number, z1: number, base: number, rise: number): Polyline =>
  range(16).map((t): Vec3 => {
    const a = Math.PI * t;
    return [x, r(base + rise * Math.sin(a)), r((z0 + z1) / 2 - ((z1 - z0) / 2) * Math.cos(a))];
  });

/**
 * Aristas de una caja, en orden de construcción: rectángulo de base, cuatro verticales (de abajo arriba)
 * y rectángulo superior. Así el trazo «crece» desde la base.
 */
function boxEdges(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Polyline[] {
  const rect = (y: number): Polyline => [
    [x0, y, z0],
    [x1, y, z0],
    [x1, y, z1],
    [x0, y, z1],
    [x0, y, z0],
  ];
  const corners: [number, number][] = [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1],
  ];
  return [rect(y0), ...corners.map(([x, z]): Polyline => [[x, y0, z], [x, y1, z]]), rect(y1)];
}

/**
 * Torre: prisma de base cuadrada que arranca del suelo (y = 0), encajado en una esquina del edificio
 * (`sx`, `sz` = hacia dónde crece desde la esquina: +1 o −1), con remate piramidal.
 * Sus aristas inferiores coinciden con el zócalo del cuerpo.
 */
function tower(cornerX: number, cornerZ: number, sx: 1 | -1, sz: 1 | -1, w: number, h: number, cap: number): Polyline[] {
  const xa = cornerX;
  const xb = cornerX + sx * w;
  const za = cornerZ;
  const zb = cornerZ + sz * w;
  const cx = (xa + xb) / 2;
  const cz = (za + zb) / 2;
  const corners: [number, number][] = [
    [xa, za],
    [xb, za],
    [xb, zb],
    [xa, zb],
  ];
  return [
    ...boxEdges(Math.min(xa, xb), Math.max(xa, xb), 0, h, Math.min(za, zb), Math.max(za, zb)),
    ...corners.map(([x, z]): Polyline => [[x, h, z], [cx, h + cap, cz]]),
  ];
}

/** Cúpula: anillo de base, tambor, meridianos (semielipses) y linterna opcional. */
function dome(cx: number, cz: number, base: number, radius: number, height: number, drum: number, lantern = 0): Polyline[] {
  const ring = (y: number): Polyline =>
    range(32).map((t): Vec3 => [r(cx + radius * Math.cos(t * Math.PI * 2)), y, r(cz + radius * Math.sin(t * Math.PI * 2))]);
  const top = base + drum;
  const meridian = (angle: number): Polyline =>
    range(16).map((t): Vec3 => {
      const a = Math.PI * t;
      const d = -radius * Math.cos(a);
      return [r(cx + d * Math.cos(angle)), r(top + height * Math.sin(a)), r(cz + d * Math.sin(angle))];
    });
  const lines: Polyline[] = [ring(base), ring(top), meridian(0), meridian(Math.PI / 2), meridian(Math.PI / 4), meridian((3 * Math.PI) / 4)];
  if (lantern) lines.push([[cx, top + height, cz], [cx, top + height + lantern, cz]]);
  return lines;
}

// --- Puente de Piedra ------------------------------------------------------------------------
const BRIDGE_X = -2.1;
const BRIDGE_W = 0.6;
const DECK = { bottom: 0.52, top: 0.64, reach: 2.2 };
const faces = [BRIDGE_X - BRIDGE_W / 2, BRIDGE_X + BRIDGE_W / 2];
const ARCHES = 4;
const archWidth = (2 * BANK) / ARCHES;
const bridgeLines: Polyline[] = [
  // tablero: cuatro aristas que cruzan de orilla a orilla
  ...faces.flatMap((x): Polyline[] => [
    [[x, DECK.top, -DECK.reach], [x, DECK.top, DECK.reach]],
    [[x, DECK.bottom, -DECK.reach], [x, DECK.bottom, DECK.reach]],
  ]),
  // cabezas del tablero sobre cada orilla
  ...[-DECK.reach, DECK.reach].map((z): Polyline => [
    [faces[0], DECK.bottom, z],
    [faces[0], DECK.top, z],
    [faces[1], DECK.top, z],
    [faces[1], DECK.bottom, z],
    [faces[0], DECK.bottom, z],
  ]),
  // estribos: apoyos del tablero en ambas orillas
  ...faces.flatMap((x) => [-BANK, BANK].map((z): Polyline => [[x, 0, z], [x, DECK.bottom, z]])),
  // arcos en ambas caras, bajo el tablero, apoyados en el agua
  ...faces.flatMap((x) =>
    Array.from({ length: ARCHES }, (_, i) => archZ(x, -BANK + archWidth * i, -BANK + archWidth * (i + 1), 0, 0.44)),
  ),
  // claves de los arcos: unen las dos caras
  ...Array.from({ length: ARCHES }, (_, i): Polyline => {
    const z = r(-BANK + archWidth * (i + 0.5));
    return [[faces[0], 0.44, z], [faces[1], 0.44, z]];
  }),
];

// --- Basílica del Pilar (orilla sur, cerca del puente) -------------------------------------------
const PILAR = { x0: -0.7, x1: 3.3, z0: -3.3, z1: -2.2, height: 0.7 };
const pcx = (PILAR.x0 + PILAR.x1) / 2;
const pcz = (PILAR.z0 + PILAR.z1) / 2;
const TOWER = { w: 0.4, h: 1.45, cap: 0.24 };
// Cada torre crece hacia el interior desde su esquina: [x, z, sentido x, sentido z].
const pilarCorners: [number, number, 1 | -1, 1 | -1][] = [
  [PILAR.x0, PILAR.z1, 1, -1],
  [PILAR.x1, PILAR.z1, -1, -1],
  [PILAR.x1, PILAR.z0, -1, 1],
  [PILAR.x0, PILAR.z0, 1, 1],
];
const pilarLines: Polyline[] = [
  ...boxEdges(PILAR.x0, PILAR.x1, 0, PILAR.height, PILAR.z0, PILAR.z1),
  ...pilarCorners.flatMap(([x, z, sx, sz]) => tower(x, z, sx, sz, TOWER.w, TOWER.h, TOWER.cap)),
  ...dome(pcx, pcz, PILAR.height, 0.42, 0.46, 0.12, 0.26),
  ...dome(pcx - 1.1, pcz, PILAR.height, 0.24, 0.26, 0.06),
  ...dome(pcx + 1.1, pcz, PILAR.height, 0.24, 0.26, 0.06),
];

export const PARTS: Part[] = [
  {
    id: 'ebro',
    name: { es: 'Ebro', en: 'Ebro' },
    duration: 600,
    tone: 'main',
    lines: [
      // orillas: muelle de doble línea a cada lado de la franja de agua
      waveX(-5, 5, BANK, 0.02, 1.5),
      waveX(-5, 5, BANK + 0.16, 0.02, 1.5),
      waveX(-5, 5, -BANK, 0.02, 1.8),
      waveX(-5, 5, -BANK - 0.16, 0.02, 1.8),
    ],
    // ondas del agua, discontinuas y tenues
    faintLines: [...dashesX(-4.6, 4.6, 0.85, 7, 0.05), ...dashesX(-4.2, 4.8, 0, 8, 0.05), ...dashesX(-4.8, 4.4, -0.85, 7, 0.05)],
  },
  { id: 'puente', name: { es: 'Puente de Piedra', en: 'Stone Bridge' }, duration: 750, tone: 'main', lines: bridgeLines },
  { id: 'pilar', name: { es: 'Pilar', en: 'Pilar' }, duration: 1100, tone: 'main', lines: pilarLines },
];

/** Encuadre inicial (tres cuartos desde la orilla norte): ángulos en grados, distancia y punto de mira. */
export const VIEW = {
  azimuth: 48,
  polar: 60,
  distance: 12.4,
  target: [0.2, 0.2, -0.4] as Vec3,
  minPolar: 18,
  maxPolar: 76,
};

/** Proyección ortográfica para el SVG estático (mismo encuadre que la vista inicial). Devuelve [x, y] de pantalla. */
export function project([x, y, z]: Vec3, azimuthDeg = VIEW.azimuth, polarDeg = VIEW.polar): [number, number] {
  const az = (azimuthDeg * Math.PI) / 180;
  const el = Math.PI / 2 - (polarDeg * Math.PI) / 180;
  const tx = x - VIEW.target[0];
  const ty = y - VIEW.target[1];
  const tz = z - VIEW.target[2];
  const sx = tx * Math.cos(az) - tz * Math.sin(az);
  const depth = tx * Math.sin(az) + tz * Math.cos(az);
  const sy = ty * Math.cos(el) - depth * Math.sin(el);
  return [r(sx), r(-sy)];
}
