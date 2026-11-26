# Portfolio: instrucciones del repositorio

Portfolio personal estático de Pablo Villa Camañes (ingeniería de software y datos) en **Astro 7 + TypeScript + CSS**,
en **español e inglés**. Cuatro apartados: Sobre mí (portada), Experiencia, Proyectos y Contacto (pie + panel lateral).
Navegación inspirada en los editores de código (interpretación propia, no una copia de ningún editor).

## Comandos

- `npm install`: instala dependencias (gestor: **npm**; no mezclar con otros).
- `npm run dev`: servidor local en http://localhost:4321
- `npm run check`: `astro check` (tipos + validación de contenido).
- `npm run build`: `astro check && astro build`, genera HTML estático en `dist/`.
- `npm run preview`: sirve `dist/` para revisar la versión compilada.
- Si el navegador da 504 «Outdated Optimize Dep» tras cambiar dependencias, reinicia `npm run dev`.

## Rutas e idiomas

- `/` redirige a `/es/` (español = idioma de entrada; `redirects` en `astro.config.mjs`).
- `/es/` y `/en/`: portada (Sobre mí, Experiencia, Proyectos destacados, pie con Contacto).
- `/es/proyectos/<id>/` y `/en/projects/<id>/`: una ficha por proyecto; el `id` es el mismo en ambos idiomas.
- Cada página fija `<html lang>`, `canonical` y `hreflang` (es, en, x-default).
- Un único control de idioma en la cabecera muestra el idioma de destino («English» / «Español») y enlaza a la
  misma página en el otro idioma con un `<a>` normal; `ui.ts` conserva el ancla (`#experiencia` ↔ `#experience`).
- Textos de plantilla, anclas por idioma y constructores de URL: `src/i18n/ui.ts` (nunca cadenas sueltas en componentes).

## Estructura

```
src/content/              ← DATOS EDITABLES (JSON, contenido real)
  profile.json            nombre, iniciales, titular, bio, formación, ubicación, enlaces (github, linkedin, email opcional)
  experience.json         puestos con id, organización, rol, fechas AAAA-MM, aportaciones y `projectId` opcional
  projects.json           proyectos con id, título, resumen, contexto, aportaciones (`work`), decisión técnica,
                          stack, enlaces { kind: publicWebsite | source, url }, featured, image
src/assets/               imágenes (rutas relativas desde el JSON: "../assets/…")
src/content.config.ts     esquemas Zod; textos "cadena" o { es, en } → siempre { es, en }; null = sin configurar
src/lib/content.ts        lectura ordenada de las colecciones, destacados y validación de ids
src/lib/format.ts         fechas y listas según idioma, URLs legibles
src/i18n/ui.ts            idiomas, anclas por idioma, URLs (homeUrl, projectUrl) y textos de interfaz
src/views/                HomePage y ProjectPage (comunes a ambos idiomas)
src/pages/es, src/pages/en  rutas finas que pasan `lang` a las vistas
src/layouts/Base.astro    <head>, barra, pie, panel de contacto y scripts (todas las páginas)
src/components/
  Header.astro            barra compacta: marca, pestañas «Sobre mí / Experiencia / Proyectos», «Contacto» a la derecha
  ContactPanel.astro      panel lateral (<dialog>) con los enlaces configurados
  ContactLinks.astro      lista de enlaces (panel y pie)
  Footer.astro            apartado Contacto (#contacto), siempre accesible
  Hero.astro              portada: monograma + nombre + perfil, bio y dibujo «Zaragoza, trazo a trazo»
  ZaragozaScene.astro     maqueta 3D «Zaragoza, trazo a trazo» (visor + versión estática SVG + controles)
  Experience.astro
  ProjectWorkspace.astro  explorador + fichas (portada: destacados compactos; página: ficha completa)
  ProjectExplorer.astro   índice tipo explorador de archivos (id + resumen)
  ProjectSheet.astro      ficha con pestaña activa: resumen, apartado propio (highlight), contexto, aportaciones,
                          tecnologías con icono (TechList) y enlaces
  TechList.astro          lista de tecnologías con icono (mapa centralizado en src/data/tech.ts)
  Monogram.astro          MARCA: monograma «PV» (cabecera, portada; favicon en public/)
  Icon.astro              iconos de enlace (github, linkedin, email, website, source)
src/scripts/ui.ts         panel de contacto (abrir/cerrar/foco) + pestaña activa según la sección visible
src/scripts/motion.ts     animación del monograma y de la ficha (Anime.js)
src/scripts/zaragoza-scene.ts  visor Three.js: trazos progresivos, cámara orbital, firma (Anime.js coordina)
src/data/tech.ts          tecnología → icono (simple-icons, CC0; Twilio dibujado); sin icono → solo el nombre
src/data/zaragoza3d.ts    maqueta 3D: polilíneas por parte, duraciones, encuadre (VIEW) y proyección estática
src/styles/tokens.css     colores, tipografías, escala y espaciado (variables CSS)
src/styles/global.css     base, sistema de columnas y utilidades
public/favicon.svg        favicon (mismo monograma, colores en hex)
```

Separación de responsabilidades: contenido (JSON) → validación (`content.config.ts`) → acceso (`lib/content.ts`)
→ presentación (componentes). Añadir una experiencia o un proyecto = editar JSON, nunca la plantilla.
Un campo opcional puede omitirse o dejarse como `""`/`null`; la sección debe seguir viéndose bien.

## Convenciones visuales

Paleta oscura de verde petróleo con acento verde azulado (inspirado en VS Code). Decidida por el propietario.

- **Tipografía:** editorial (Literata Variable) en el nombre, los títulos y el texto de lectura, incluidos los pies
  de imagen (cursiva). Monoespaciada (IBM Plex Mono, `--font-mono`, clases `.mono`/`.meta`) en la navegación,
  las pestañas, el explorador, las fechas, los metadatos y las etiquetas de interfaz. No mezclar los papeles.
  Texto a peso 380 y titulares a 400: claro sobre oscuro se percibe más grueso.
- **Color** (variables en `tokens.css`): fondo `--color-bg #102522`, superficies `--color-surface #18332f`
  (barra, explorador, pie, paneles), texto `--color-text #eaf4f1`, acento `--color-accent #4ec9b0`
  (puntos y trazos de acento del monograma, enlaces, foco, pestaña activa). Derivados: `--color-text-soft #a7c3bc`, `--color-rule #2e4f4a`,
  `--color-accent-strong #7fdcc8` (hover), `--color-on-accent #102522`.
- **Lenguaje de editor:** pestaña activa = fondo de página + filete de acento arriba; entrada abierta del
  explorador = fondo de página + filete de acento a la izquierda. Iconos de archivo/carpeta: trazo fino, sin rellenos.
  Es una interpretación: nada de números de línea, resaltado de sintaxis falso ni barras de estado decorativas.
- Las capturas de proyectos conservan sus colores originales: nunca aplicar `filter`, `mix-blend-mode`,
  opacidad ni superposiciones de color a las imágenes.
- Sistema de dos columnas: columna estrecha (`--margin-col`) para títulos de sección y el explorador; otra para
  el contenido. Fechas y etiquetas de contacto usan una subcolumna de 11rem.
- Un solo acento. Sin degradados, sombras de tarjeta, etiquetas en mayúsculas, separadores «·», flechas «→»,
  barras de nivel técnico ni etiquetas de relleno. Las listas de tecnologías se escriben como frase.
- Todos los valores salen de `tokens.css`; no escribir colores ni tamaños sueltos en componentes.
- **Marca:** monograma «PV» en `Monogram.astro` (único punto de cambio; `public/favicon.svg` repite la geometría
  en hex): P en color texto y V en verde azulado, en una tesela tipo icono de archivo. Revisar en grande y a
  tamaño de icono (16–30 px) antes de cambiarlo.
- **Portada:** fila superior a todo el ancho con el monograma pequeño y el nombre en UNA línea (tan grande como
  quepa, `white-space: nowrap`) + perfil; debajo, a la izquierda presentación y Estudios; a la derecha
  «Zaragoza» (mismo estilo editorial que el nombre, en verde azulado, centrado) sobre la maqueta 3D.
- Historial: v0.1 Newsreader + marfil/cobalto; v0.2 Literata + verde petróleo; v0.3 navegación de editor + mono;
  v0.4 monograma como marca; v0.5 contenido real, bilingüe es/en, monograma PVC; v0.6 maqueta 3D, PV.

## Navegación y contacto

- Escritorio: barra fija con marca, tres pestañas y «Contacto» a la derecha. Móvil: marca + «Contacto» arriba,
  pestañas debajo.
- «Contacto» abre `#contact-panel` (`<dialog>` modal): botón «Cerrar», Escape y clic fuera lo cierran; el foco
  vuelve al control que lo abrió. Sin JS el control es un enlace a `#contacto` (pie).
- En la portada la pestaña activa sigue la sección visible (IntersectionObserver); en las fichas, «Proyectos» fija.

## Movimiento (Anime.js 4.5)

1. Monograma (`MOTION` en `src/scripts/motion.ts`): `createTimeline()` lo construye una vez (~1 s):
   `svg.createDrawable` dibuja la P, la V y la C; los puntos se desplazan distancias cortas hasta completar la C.
2. Ficha de proyecto: escala leve de la imagen + línea bajo el título (puntero con `hover: hover` o foco de teclado).
3. **«Zaragoza, trazo a trazo»** (maqueta 3D, `src/scripts/zaragoza-scene.ts`, `SCENE_MOTION`):
   Three.js renderiza una maqueta lineal (Line2) con profundidad real: el Ebro como franja entre dos orillas de
   doble línea, el Puente de Piedra cruzándolo de orilla a orilla (tablero con grosor, cuatro arcos por cara,
   estribos) y el Pilar en la orilla sur (cuerpo, cuatro torres, tres cúpulas). Datos en
   `src/data/zaragoza3d.ts` (ejes: X a lo largo del río, Z de orilla a orilla, Y arriba).
   - La escena es el control (role="button", enfocable, sin botones visibles). Antes de empezar muestra una
     invitación discreta con pulso verde azulado: «Haz clic para dibujar» / «Toca para dibujar» (táctil, por CSS).
     Clic/toque o Intro/Espacio dibujan toda la escena en una secuencia continua (orillas y río → puente → Pilar,
     600/750/1100 ms; sin reflejos, retirados por el propietario); Anime.js (`createTimeline`) encadena las líneas; al terminar entra la firma
     «Pablo Villa» y después aparece «Zaragoza» (título de la figura, oculto hasta el final). La escena queda
     visible; el siguiente clic (también durante la entrada de la firma) vuelve a dibujar desde el principio y
     oculta firma y título. Clics durante el trazado se ignoran.
   - Decisión del propietario: el trazo progresivo se reproduce SIEMPRE al pulsar, también con
     `prefers-reduced-motion` (lo inicia el visitante). Con movimiento reducido solo se quitan el desplazamiento
     de la firma y del título (fundido), el suavizado de cámara y el pulso de la invitación.
   - Pulsar ≠ arrastrar (umbral 6 px): arrastrar orbita la cámara y nunca cuenta como clic; el ángulo se conserva
     al redibujar. Con el foco: flechas izquierda/derecha giran ±30°, Inicio vuelve al encuadre. En táctil,
     `touch-action: pan-y`: el gesto horizontal orbita y el vertical desplaza la página.
   - El visor no tiene borde ni fondo propio (se funde con la portada) y ocupa toda la columna derecha (4:3).
   - Torres del Pilar: prismas que arrancan del suelo, encajados en cada esquina y enrasados con el zócalo;
     las cajas se trazan base → verticales (de abajo arriba) → tapa → remate, para que crezcan desde la base.
   - La firma es HTML proyectado desde un ancla en el borde de la maqueta más cercano a la cámara: se mueve un poco
     al orbitar y siempre mira a la cámara.
   - Sin WebGL o sin JS: SVG estático con la misma maqueta proyectada desde el encuadre inicial, con la firma.
   - Three.js se carga con import() dinámico solo en la portada (~180 KB gzip).
   - Pruebas en dev: `window.__zaragoza` (view, goal, setGoal, draw, drawn, parts, busy) y `?motion=1`.

Reglas: el marcado SVG es la forma final; con `prefers-reduced-motion: reduce` o sin JS se ve tal cual.
Clases puestas en `<head>` (`Base.astro`): `js`; `motion-intro` (oculta el monograma mientras se prepara) y
`sketch-pending` (oculta la versión estática de Zaragoza mientras carga el visor 3D); ambas se retiran solas a
los 2,5 s si el script no llega. Scroll nativo, sin efectos ligados al scroll.
En desarrollo, `?motion=1` fuerza las animaciones aunque el sistema pida movimiento reducido.
El panel de contacto usa una transición CSS breve, desactivada con movimiento reducido.

## Contenido real: reglas

- Fichas generadas desde `projects.json`: el explorador muestra el resumen; la ficha, el apartado propio opcional
  `highlight` { title, body } justo después del resumen (sustituye a la antigua «Decisión técnica»), contexto,
  aportaciones (`work`), tecnologías con icono y enlaces disponibles.
- Estudios: `education` { degree, specialization, institution, grade } en profile.json, bloque propio bajo la
  presentación con la nota visible. La presentación (`bio`) no repite el trabajo en Power BI (va en Experiencia).
- Cabecera: monograma + nombre; pestañas con icono de línea decorativo (archivo, historial, carpeta,
  `aria-hidden`), tipografía mono e indicador de pestaña activa en verde azulado.
- Contacto («Dónde encontrarme» / «Where to find me»): fila centrada GitHub · LinkedIn · Gmail con el nombre
  debajo; el icono y el nombre son el enlace; sin URLs ni correo visibles; verde azulado en hover/foco.
- Logos de experiencia en la columna de fechas, debajo del periodo; proporción original, placa clara mínima
  (2 px de radio, sin borde ni sombra) porque ambos logos son oscuros.
- Tecnologías: solo el icono (26 px), centrados; el nombre aparece en un rótulo al pasar el puntero y queda
  para lectores de pantalla. Sin icono disponible (JSP, DDD…), se muestra el nombre.
- Vistas previas de las webs (MIH y Luis Villa): capturas en `src/assets/projects/*-web.png`, enlazadas a la web,
  con contorno verde azulado interior y rótulo «Ver web», sin pie. Para regenerarlas (Edge en modo headless):
  `msedge --headless=new --hide-scrollbars --window-size=1280,800 --screenshot=salida.png <url>`
  (la de Luis Villa a 880 × 620). Destacados en portada: los de `featured: true` (MIH y Cita previa).
- Etiquetas de enlace por `kind`: `publicWebsite` → «Ver web» / «Visit website» (webs externas reales, p. ej. el
  servicio de citas de la peluquería); `source` → «Ver código» / «View source». Un `label` en el JSON las sustituye.
- Se omiten imágenes ausentes (`image: null`) y enlaces no configurados; sin email no se muestra «correo».
- Experiencia: «Actualidad» / «Present» cuando `end` es null; `projectId` enlaza a la ficha (TFG del MIH).
- Omterra: mantener solo la descripción general pública (Power BI y ETL) que ya está en el JSON.
- Estudios: «Nota 7,5» / «Grade 7.5» (sin «/10»).
- No inventar datos. Confirmado por el propietario (2026-11-26): grado finalizado, la etapa del MIH fue de
  prácticas y el enlace de LinkedIn lleva a su perfil.
- Logotipos de experiencia (`logo` en `experience.json`, archivos en `src/assets/logos/`): Siemens Energy
  (Wikimedia Commons, PD-textlogo; marca registrada) y EINA · Universidad de Zaragoza (web oficial eina.unizar.es).
  Se muestran decorativos (`alt=""`) sobre una placa clara para conservar sus colores originales.
- Iconos de enlace en `src/components/Icon.astro` (16 px, decorativos, `aria-hidden`): GitHub (marca de Octicons),
  LinkedIn, correo, web (`publicWebsite`) y código (`source`). En contacto van en acento junto a la etiqueta.

## Publicación (GitHub Pages)

- `astro.config.mjs`: `site` = `SITE_URL` (por defecto https://pablovilla199.github.io) y `base` = `BASE_PATH`
  (por defecto `/`). Todas las rutas internas pasan por `src/i18n/ui.ts` (`homeUrl`, `projectUrl`, `assetUrl`),
  que usan `import.meta.env.BASE_URL`: nunca escribir rutas absolutas «a mano».
- Workflow `.github/workflows/deploy.yml`: push a main / manual → build (withastro/action) + deploy;
  pull requests → solo `npm ci` + `npm run build`.
- No publicar ni hacer push sin autorización expresa del propietario.

## Antes de terminar un cambio

1. `npm run build` sin errores ni avisos.
2. Seguir `.claude/skills/portfolio-review/SKILL.md`.
3. No inventar empresas, resultados, capturas ni datos personales: usar textos «de muestra» identificables.
4. No desplegar públicamente sin autorización expresa.

## Fuera de alcance (por ahora)

Demo interactiva de los proyectos, CMS, backend y cuentas de usuario.

## Herramientas de diseño (qué se usó realmente)

- **frontend-design (Anthropic):** disponible como plugin; usado para componer la portada (texto + ilustración)
  y la ficha de proyecto antes de extender el estilo.
- **UI/UX Pro Max** (github.com/nextlevelbuilder/ui-ux-pro-max-skill): no instalado (requiere
  `/plugin marketplace add …` interactivo o `npx skills add`, que ejecuta scripts de terceros). Su revisión de
  contraste y jerarquía se hizo a mano: contrastes medidos abajo; jerarquía nombre > título de sección > título de
  ficha > texto, con la mono reservada a interfaz.
- **Impeccable** (github.com/pbakaus/impeccable): no instalado; se leyeron `SKILL.md` y `reference/polish.md`,
  `audit.md`, `craft-floor.md` y se aplicó su checklist a mano (espaciado, áreas táctiles ≥ 44 px, un solo momento
  de movimiento con ease-out, estados vacíos, valores por defecto del navegador tematizados).
- Contrastes medidos sobre fondo / superficie: texto 14.3 / 12.0, texto suave 8.5 / 7.2, acento 7.9 / 6.6.
