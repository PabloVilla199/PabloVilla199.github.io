/**
 * Relación centralizada tecnología → icono (se reutiliza en todas las fichas de proyecto).
 * Iconos de marca de simple-icons (CC0). Si una tecnología no está aquí, se muestra solo su nombre.
 * Si el color de marca no contrasta lo bastante con el fondo oscuro (< 3:1), el icono usa el color de texto.
 */
import {
  siApachetomcat,
  siExpress,
  siKotlin,
  siMongodb,
  siMysql,
  siNestjs,
  siNodedotjs,
  siOpenjdk,
  siPhp,
  siRabbitmq,
  siReact,
  siRedis,
  siSpringboot,
  siTypescript,
} from 'simple-icons';

export interface TechIcon {
  /** Trazado SVG en una caja de 24 × 24. */
  path: string;
  /** Color de marca (#rrggbb) o null para usar el color de texto. */
  color: string | null;
  /** Relleno con regla evenodd (para iconos dibujados aquí). */
  evenOdd?: boolean;
}

const BACKGROUND = '#102522'; // --color-bg

function luminance(hex: string): number {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

const readable = (hex: string) => {
  const a = luminance(hex);
  const b = luminance(BACKGROUND.slice(1));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 3;
};

const fromSimpleIcon = (icon: { path: string; hex: string }): TechIcon => ({
  path: icon.path,
  color: readable(icon.hex) ? `#${icon.hex}` : null,
});

/** Twilio ya no está en simple-icons: marca simplificada (anillo con cuatro puntos). */
const twilio: TechIcon = {
  path: 'M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm0 20.8a8.8 8.8 0 1 1 0-17.6 8.8 8.8 0 0 1 0 17.6ZM9.5 6.9a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Zm5 0a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Zm-5 5a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Zm5 0a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z',
  color: readable('F22F46') ? '#F22F46' : null,
  evenOdd: true,
};

/** Nombre de tecnología tal como aparece en projects.json → icono. */
export const TECH_ICONS: Record<string, TechIcon> = {
  PHP: fromSimpleIcon(siPhp),
  RabbitMQ: fromSimpleIcon(siRabbitmq),
  Twilio: twilio,
  TypeScript: fromSimpleIcon(siTypescript),
  NestJS: fromSimpleIcon(siNestjs),
  Kotlin: fromSimpleIcon(siKotlin),
  'Spring Boot': fromSimpleIcon(siSpringboot),
  Redis: fromSimpleIcon(siRedis),
  MongoDB: fromSimpleIcon(siMongodb),
  Express: fromSimpleIcon(siExpress),
  React: fromSimpleIcon(siReact),
  'Node.js': fromSimpleIcon(siNodedotjs),
  MySQL: fromSimpleIcon(siMysql),
  Tomcat: fromSimpleIcon(siApachetomcat),
  'Java 8': fromSimpleIcon(siOpenjdk),
};

export const techIcon = (name: string): TechIcon | undefined => TECH_ICONS[name];
