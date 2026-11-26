---
name: portfolio-review
description: Usar al revisar cambios en el diseño, el contenido o la navegación del portfolio (secciones, datos JSON, estilos, animaciones). Procedimiento de comprobación en navegador antes de dar un cambio por terminado.
---

# Revisión del portfolio

Sigue los pasos en orden. Anota lo que encuentres, corrígelo y repite el paso afectado.
La revisión no termina mientras quede un problema abierto.

## 1. Checks y compilación

```
npm run build        # astro check + astro build; debe salir con 0 errores, 0 avisos
npm run preview      # sirve dist/ en http://localhost:4321 (o el puerto indicado)
```

Si falla la validación de contenido, el mensaje indica archivo y campo de `src/content/*.json`.

## 2. Abrir la página

Usa el navegador disponible (panel de navegador integrado; si no hay, Playwright).
Revisa **la versión compilada** (`preview`) y, para avisos de desarrollo, `npm run dev`.

Anchos: **390 px** (móvil) y **1440 px** (escritorio). Revisa en ambos:
- Barra: marca, pestañas «Sobre mí / Experiencia / Proyectos» y «Contacto» a la derecha (en móvil, pestañas debajo).
- Portada: monograma + nombre + perfil uno al lado del otro y visibles desde el primer momento (también a 390 px);
  dibujo «Zaragoza, trazo a trazo» a la derecha (debajo de la presentación en móvil).
- Marca: el monograma se reconoce en la cabecera (30 px) y en el favicon.
- Experiencia: fechas en columna estrecha en escritorio, apiladas en móvil.
- Proyectos: explorador estrecho + ficha con pestaña activa; en móvil el índice va encima de la ficha.
- Abre **un enlace directo** a una ficha (`/es/proyectos/<id>/`, `/en/projects/<id>/`): pestaña con su nombre, entrada del explorador
  con `aria-current="page"`, «Proyectos» activa en la barra, `<title>` del proyecto, un único `h1`.
- Pie: apartado Contacto accesible en todas las páginas.

Desbordamiento horizontal (debe dar `[]` y `scrollWidth === clientWidth`):
```js
const w = document.documentElement.clientWidth;
[...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > w + .5 || r.left < -.5; })
```

## 2b. Idiomas (es / en)

- `/` redirige a `/es/`. En `/es/…` y `/en/…`, `<html lang>` coincide con el idioma y hay `hreflang` es/en/x-default.
- El control de idioma muestra el idioma de destino y lleva a la misma página: desde una ficha
  (`/es/proyectos/<id>/` ↔ `/en/projects/<id>/`) prueba **los dos sentidos**; desde la portada con ancla,
  `/es/#experiencia` → `/en/#experience`.
- Todo traducido: pestañas, títulos de página, descripción, fechas («Actualidad» / «Present»), etiquetas de enlaces
  («Ver web» / «Visit website», «Ver código» / «View source»), contacto, «Cerrar» / «Close», textos alternativos
  y nombres accesibles (índice de proyectos, saltar al contenido, ilustración).

## 3. Navegación, teclado, foco y contraste

- Las pestañas llevan a `/<lang>/#<sección>` (también desde una ficha) y la pestaña activa
  sigue la sección visible en la portada.
- Tab desde el inicio: «Saltar al contenido» → marca → pestañas → Contacto → explorador → imagen de la ficha → enlaces.
- **Panel de contacto:** «Contacto» lo abre (`aria-expanded="true"`, foco en «Cerrar»); «Cerrar», Escape y clic
  fuera lo cierran y el foco vuelve a «Contacto». Muestra solo los enlaces configurados.
  Cada paso tiene anillo de foco visible (verde azulado `--color-focus`, 2 px).
- La imagen del destacado, si es enlace, tiene nombre accesible (el título del proyecto).
- Contraste mínimo AA (objetivo AAA): `--color-text`, `--color-text-soft` y `--color-accent` sobre
  `--color-bg` y `--color-surface` (valores medidos en `tokens.css`). Si cambias un color, compruébalo de nuevo.
- Las capturas se ven con sus colores originales (sin `filter`, opacidad ni mezclas).

## 4. Movimiento

- Con `prefers-reduced-motion: reduce`: el monograma aparece final (sin estilos inline en sus trazos ni puntos) y la
  ficha no se anima.
- Sin reducción (o con `?motion=1` en dev): trazos de las letras → puntos que llegan → travesaño, una vez, ≈ 1 s,
  y la marca queda visible;
  al pasar el puntero o enfocar con Tab la imagen de la ficha, escala leve + línea bajo el título.
- Con JavaScript desactivado: todo el contenido se lee, el monograma está completo y «Contacto» enlaza al pie.
- Consola sin errores (en dev, un 504 «Outdated Optimize Dep» se arregla reiniciando el servidor).

## 4b. «Zaragoza, trazo a trazo» (maqueta 3D)

- Composición: desde arriba (`__zaragoza.setGoal(48, 18)` en dev) y desde tres cuartos, el puente une las dos
  orillas y el Pilar está en la orilla sur. Comprueba también desde el lado opuesto (`setGoal(228, 60)`).
- Invitación «Haz clic para dibujar» (táctil: «Toca para dibujar») con pulso; sin pulso con movimiento reducido.
- Un clic en la escena (o Intro/Espacio con el foco) dibuja todo (`__zaragoza.parts()` → todo `true`) y entra la
  firma. El siguiente clic redibuja desde el principio; clics durante el dibujo se ignoran (`busy()`).
- Arrastrar orbita sin redibujar y el ángulo se conserva. Táctil: horizontal orbita, vertical desplaza la página.
- Torres del Pilar: unidas a su esquina y al zócalo desde el ángulo inicial, ambos lados y arriba.
- Sin borde ni fondo en el visor; las torres y la firma no se cortan al girar.
- La firma se mantiene delante del borde inferior al orbitar y legible; se oculta al redibujar.
- El trazo progresivo se ve también con movimiento reducido (decisión del propietario); solo la firma y «Zaragoza»
  aparecen sin desplazamiento. Al terminar: firma y después «Zaragoza» centrado. Sin WebGL: SVG estático con firma.
- EN: «Click to draw» / «Tap to draw», descripción accesible traducida.
- Prueba la animación con la pestaña visible (Anime.js y requestAnimationFrame se pausan si está oculta).

## 4c. Contenido y detalles

- Estudios se distingue de la presentación (bloque propio con grado, mención, universidad y nota).
- Logos junto al nombre de la organización, legibles y sin marcos gruesos, en móvil y escritorio.
- Fichas: apartado propio tras el resumen (sin «Decisión técnica»), iconos de tecnología legibles.
- Contacto: fila centrada GitHub · LinkedIn · Gmail, sin URLs visibles, también en móvil.
- Cabecera: iconos en las pestañas fuera del nombre accesible; activa en verde azulado.

## 5. Casos de contenido

Prueba editando temporalmente los JSON (y restáuralos después):
- Título de proyecto muy largo y nombre de empresa largo: sin desbordes, saltos de línea limpios.
- Proyecto con imagen + pie, sin imagen, sin enlaces, sin `decision`.
- Ningún proyecto con `featured`: se destaca el primero.
- Perfil sin foto / con foto; sin enlaces (en dev aparece un aviso en el pie; el panel lo indica) / con los tres.
- Proyecto sin enlaces (ReservAda), sin imagen y con título sin traducir (DreamyURL).
- Experiencia sin `end` («actualidad») y sin `contributions`.

## 6. Cierre

Corrige todo lo encontrado, vuelve a ejecutar `npm run build` y repite las comprobaciones afectadas.
Resume qué comprobaste, qué corregiste y qué no pudiste comprobar (y por qué).
