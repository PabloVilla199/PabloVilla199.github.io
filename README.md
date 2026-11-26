# Pablo Villa Camañes · Portfolio

Portfolio personal de ingeniería de software y datos, en español e inglés.

**Web:** https://pablovilla199.github.io/

## Tecnología

| Ámbito | Lo utilizado |
| --- | --- |
| Framework | [Astro](https://astro.build/) 7 con salida estática (HTML generado en la compilación) |
| Lenguaje | TypeScript en modo estricto |
| Estilos | CSS propio con variables (tokens de color, tipografía y espaciado), sin frameworks |
| Contenido | Archivos JSON en `src/content/` gestionados con Astro Content Collections y validados con Zod |
| Idiomas | Rutas estáticas `/es/` y `/en/` con textos de interfaz centralizados |
| Escena 3D | [Three.js](https://threejs.org/) (líneas `Line2`) para la maqueta de Zaragoza, con versión SVG estática sin WebGL |
| Animación | [Anime.js](https://animejs.com/) 4: trazado progresivo, construcción del monograma y transiciones |
| Iconos | [Simple Icons](https://simpleicons.org/) (CC0) para tecnologías y marcas |
| Tipografía | Literata (editorial) e IBM Plex Mono (interfaz), autoalojadas con Fontsource |
| Imágenes | Optimización con `astro:assets` (WebP y tamaños adaptados) |
| Calidad | `astro check` (tipos y contenido) antes de cada compilación |
| Despliegue | GitHub Pages con GitHub Actions (`withastro/action`) |

## Puesta en marcha

```
npm ci
npm run dev
```

Más detalles sobre cómo editar el contenido y publicar: [docs/GUIA.md](docs/GUIA.md).
