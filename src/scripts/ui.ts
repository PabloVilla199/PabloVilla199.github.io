/**
 * Interfaz (sin animaciones):
 *  - Panel lateral de contacto: abre con «Contacto», cierra con «Cerrar», Escape o clic fuera,
 *    y devuelve el foco al control que lo abrió.
 *  - Pestañas: marca la sección visible en la portada.
 *  - Idioma: el enlace al otro idioma conserva la sección del ancla (#experiencia → #experience).
 * Sin JS, «Contacto» es un enlace al pie y las pestañas son enlaces normales.
 */
const panel = document.getElementById('contact-panel') as HTMLDialogElement | null;

if (panel && typeof panel.showModal === 'function') {
  let opener: HTMLElement | null = null;
  const openers = document.querySelectorAll<HTMLButtonElement>('[data-contact-open]');

  document.querySelectorAll<HTMLElement>('[data-contact-fallback]').forEach((el) => (el.hidden = true));
  openers.forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      opener = button;
      panel.showModal();
      button.setAttribute('aria-expanded', 'true');
    });
  });

  panel.querySelector('[data-contact-close]')?.addEventListener('click', () => panel.close());
  // Clic en el fondo (fuera de .panel__inner) cierra el panel.
  panel.addEventListener('click', (event) => {
    if (event.target === panel) panel.close();
  });
  // Escape dispara `cancel` y después `close` de forma nativa.
  panel.addEventListener('close', () => {
    openers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    opener?.focus();
    opener = null;
  });
}

const tabs = new Map<string, HTMLElement>();
document.querySelectorAll<HTMLElement>('[data-tab]').forEach((tab) => {
  if (tab.dataset.tab) tabs.set(tab.dataset.tab, tab);
});
const sections = [...tabs.keys()]
  .map((id) => document.getElementById(id))
  .filter((el): el is HTMLElement => el !== null && el.tagName === 'SECTION');

// Solo en la portada (donde existen las tres secciones); en las fichas la pestaña activa es fija.
if (sections.length === tabs.size && 'IntersectionObserver' in window) {
  const setActive = (id: string) =>
    tabs.forEach((tab, key) => (key === id ? tab.setAttribute('data-active', '') : tab.removeAttribute('data-active')));

  const visible = new Map<string, number>();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      const best = [...visible.entries()].sort((a, b) => b[1] - a[1])[0];
      if (best && best[1] > 0) setActive(best[0]);
    },
    { rootMargin: '-20% 0px -45% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
  );
  sections.forEach((s) => observer.observe(s));
}

// Control de idioma: mantiene el ancla equivalente en el otro idioma.
document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]').forEach((link) => {
  const map = JSON.parse(link.dataset.hashMap ?? '{}') as Record<string, string>;
  const target = (link.getAttribute('href') ?? '').split('#')[0];
  const update = () => {
    const current = decodeURIComponent(location.hash.slice(1));
    link.setAttribute('href', map[current] ? target + '#' + map[current] : target);
  };
  update();
  window.addEventListener('hashchange', update);
});
