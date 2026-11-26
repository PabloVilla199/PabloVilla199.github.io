# Guía de edición y publicación

## Comandos

```
npm install        # instalar dependencias (o `npm ci` para una instalación limpia desde el lockfile)
npm run dev        # arrancar en http://localhost:4321 (redirige a /es/)
npm run check      # validar tipos y contenido (astro check)
npm run build      # validar (astro check) y compilar el sitio estático en dist/
npm run preview    # servir la versión compilada en local
```

Requiere Node 22.12 o superior.

## Rutas

| Página | Español | Inglés |
| --- | --- | --- |
| Portada | `/es/` | `/en/` |
| Ficha de proyecto | `/es/proyectos/<id>/` | `/en/projects/<id>/` |

`/` redirige a `/es/`. El `id` de cada proyecto (en `projects.json`) es el mismo en los dos idiomas.

## Dónde editar

| Qué | Archivo |
| --- | --- |
| Nombre, titular, bio, formación, ubicación, enlaces (GitHub, LinkedIn, email opcional) | `src/content/profile.json` |
| Experiencia (un objeto por puesto, en orden de aparición; `logo` opcional) | `src/content/experience.json` |
| Logotipos de empresas y centros | `src/assets/logos/` |
| Proyectos (`"featured": true` para destacarlos en la portada) | `src/content/projects.json` |
| Imágenes (foto y capturas) | `src/assets/` (en el JSON: `"../assets/carpeta/archivo.jpg"`) |
| Textos de la interfaz en ambos idiomas (menú, etiquetas, contacto…) | `src/i18n/ui.ts` |
| Iconos de tecnologías (qué icono corresponde a cada tecnología) | `src/data/tech.ts` |
| Maqueta 3D «Zaragoza, trazo a trazo»: líneas, tiempos y encuadre | `src/data/zaragoza3d.ts` |
| Maqueta 3D: componente, versión estática y visor (Three.js + Anime.js) | `src/components/ZaragozaScene.astro`, `src/scripts/zaragoza-scene.ts` |
| Colores, tipografías y espaciados | `src/styles/tokens.css` |
| Marca (monograma PV) y favicon | `src/components/Monogram.astro`, `public/favicon.svg` |
| Animaciones (construcción del monograma, ficha) | `MOTION` en `src/scripts/motion.ts` |
| Panel de contacto y control de idioma | `src/scripts/ui.ts` |
| URL pública del sitio | `site` en `astro.config.mjs` |

Los textos pueden ser una cadena (igual en los dos idiomas) o un objeto `{ "es": "…", "en": "…" }`.
Los campos opcionales pueden omitirse o dejarse como `null`. Las fechas usan el formato `AAAA-MM`; con `"end": null`
aparece «Actualidad» / «Present». Si un dato no cumple el esquema (`src/content.config.ts`), `npm run dev` y
`npm run build` indican el archivo y el campo.

Enlaces de proyecto: `{ "kind": "publicWebsite" | "source", "url": "…" }`. `publicWebsite` se muestra como
«Ver web» / «Visit website» y `source` como «Ver código» / «View source».

Ejemplo de proyecto:

```json
{
  "id": "nombre-del-proyecto",
  "title": { "es": "Nombre del proyecto", "en": "Project name" },
  "summary": { "es": "Qué es, en una frase.", "en": "What it is, in one sentence." },
  "context": { "es": "Por qué existe.", "en": "Why it exists." },
  "work": [{ "es": "Qué hiciste.", "en": "What you did." }],
  "highlight": {
    "title": { "es": "Apartado propio", "en": "Own section" },
    "body": { "es": "Un detalle técnico que merezca la pena.", "en": "A technical detail worth sharing." }
  },
  "stack": ["TypeScript"],
  "links": [{ "kind": "source", "url": "https://github.com/…" }],
  "featured": false,
  "image": {
    "src": "../assets/projects/captura.png",
    "alt": { "es": "Qué muestra la imagen", "en": "What the image shows" }
  }
}
```

## Publicación en GitHub Pages

URL prevista: **https://pablovilla199.github.io/** (repositorio `PabloVilla199.github.io`, servido desde la raíz).

El workflow `.github/workflows/deploy.yml` sigue la guía oficial de Astro:

- **push a `main`** o **lanzamiento manual** (pestaña Actions → «Deploy to GitHub Pages» → Run workflow):
  instala desde el lockfile, ejecuta `npm run build` (incluye `astro check`) y publica `dist/`.
- **pull requests**: solo validan (`npm ci` + `npm run build`); no despliegan.

Pasos para el primer despliegue:

1. Crear el repositorio `PabloVilla199.github.io` en GitHub y subir la rama `main`.
2. En GitHub: **Settings → Pages → Source → GitHub Actions**.
3. Hacer push a `main` (o lanzar el workflow a mano) y esperar a que termine el job «deploy».

Validación local antes de publicar (lo mismo que hace el workflow):

```
npm ci
npm run build
npm run preview
```

### Si el repositorio se llama distinto (p. ej. `portfolio`)

El sitio se serviría en `https://pablovilla199.github.io/portfolio/`. Basta con definir `BASE_PATH=/portfolio`
(descomenta el bloque `env` del workflow); `astro.config.mjs` lo aplica a todas las rutas, imágenes, fuentes y
scripts. Para probarlo en local: `BASE_PATH=/portfolio npm run build` (en Git Bash de Windows, antepón
`MSYS_NO_PATHCONV=1`). Con un dominio propio: `SITE_URL=https://tudominio` y un archivo `public/CNAME`.

Más detalles: `CLAUDE.md`. Lista de revisión: `.claude/skills/portfolio-review/SKILL.md`.
