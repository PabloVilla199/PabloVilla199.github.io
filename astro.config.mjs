// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Publicación en GitHub Pages.
 * - Repositorio «PabloVilla199.github.io» (por defecto): se sirve desde la raíz → base '/'.
 * - Repositorio de proyecto (p. ej. «portfolio»): BASE_PATH=/portfolio (en el workflow o al compilar).
 * Todas las rutas internas (ES/EN, fichas, favicon) usan import.meta.env.BASE_URL vía src/i18n/ui.ts;
 * imágenes, fuentes y scripts los resuelve Astro con el mismo prefijo.
 */
const site = process.env.SITE_URL ?? 'https://pablovilla199.github.io';
const base = process.env.BASE_PATH ?? '/';
const prefix = base.replace(/\/$/, '');

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  // El español es el idioma de entrada: la raíz redirige a /es/.
  redirects: {
    '/': `${prefix}/es/`,
  },
});
