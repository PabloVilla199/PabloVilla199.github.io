/**
 * Idiomas, rutas y textos de interfaz. Los datos personales y de proyectos viven en src/content/;
 * aquí solo están las cadenas de la plantilla (navegación, etiquetas, nombres accesibles…).
 */
export const languages = ['es', 'en'] as const;
export type Lang = (typeof languages)[number];
export const defaultLang: Lang = 'es';

/** Texto traducido ya normalizado por el esquema. */
export type Localized = { es: string; en: string };
export const t = (value: Localized, lang: Lang) => value[lang];

/** Anclas de sección por idioma (la clave es estable; el valor es el id en la página). */
export const sectionIds = {
  es: { about: 'sobre-mi', experience: 'experiencia', projects: 'proyectos', contact: 'contacto' },
  en: { about: 'about', experience: 'experience', projects: 'projects', contact: 'contact' },
} as const;
export type SectionKey = keyof (typeof sectionIds)['es'];

const projectSegment = { es: 'proyectos', en: 'projects' } as const;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const homeUrl = (lang: Lang, section?: SectionKey) =>
  `${base}/${lang}/${section ? `#${sectionIds[lang][section]}` : ''}`;
export const projectUrl = (lang: Lang, id: string) => `${base}/${lang}/${projectSegment[lang]}/${id}/`;
export const assetUrl = (path: string) => `${base}${path}`;
export const otherLang = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es');

export const ui = {
  es: {
    locale: 'es-ES',
    langName: 'Español',
    skip: 'Saltar al contenido',
    homeLabel: 'Ir al inicio',
    navLabel: 'Secciones',
    nav: { about: 'Sobre mí', experience: 'Experiencia', projects: 'Proyectos', contact: 'Contacto' },
    switchLabel: 'Ver esta página en español',
    present: 'Actualidad',
    until: 'hasta',
    openProject: 'Ver ficha del proyecto',
    explorerLabel: 'Índice de proyectos',
    explorerRoot: 'proyectos',
    context: 'Contexto',
    work: 'Aportaciones',
    techLabel: 'Tecnologías',
    education: 'Estudios',
    gradeLabel: 'Nota',
    linkLabels: { publicWebsite: 'Ver web', source: 'Ver código' },
    externalHint: '(sitio externo)',
    openSheet: 'Abrir ficha',
    featuredNote: 'Proyectos destacados',
    contactTitle: 'Dónde encontrarme',
    contactLabels: { github: 'GitHub', linkedin: 'LinkedIn', email: 'Gmail' },
    noLinks: 'Todavía no hay enlaces de contacto configurados.',
    close: 'Cerrar',
    scene: {
      title: 'Zaragoza',
      label: 'Maqueta 3D de Zaragoza. Pulsa Intro o Espacio para dibujarla; flechas izquierda y derecha para girarla.',
      action: 'Dibujar Zaragoza',
      inviteClick: 'Haz clic para dibujar',
      inviteTap: 'Toca para dibujar',
      drawing: 'Dibujando: {part}',
      done: 'Zaragoza dibujada. Pulsa de nuevo para volver a dibujarla.',
      ariaStart: 'Maqueta de Zaragoza sin dibujar: solo un punto en la orilla norte del Ebro.',
      ariaDone: 'Maqueta de Zaragoza dibujada: el Ebro entre sus dos orillas, el Puente de Piedra cruzándolo de una orilla a la otra, y la basílica del Pilar en la orilla sur, firmada «Pablo Villa».',
    },
    titleSep: ' | ',
  },
  en: {
    locale: 'en-GB',
    langName: 'English',
    skip: 'Skip to content',
    homeLabel: 'Go to home page',
    navLabel: 'Sections',
    nav: { about: 'About', experience: 'Experience', projects: 'Projects', contact: 'Contact' },
    switchLabel: 'View this page in English',
    present: 'Present',
    until: 'to',
    openProject: 'View project',
    explorerLabel: 'Project index',
    explorerRoot: 'projects',
    context: 'Context',
    work: 'What I did',
    techLabel: 'Technologies',
    education: 'Education',
    gradeLabel: 'Grade',
    linkLabels: { publicWebsite: 'Visit website', source: 'View source' },
    externalHint: '(external site)',
    openSheet: 'Open project',
    featuredNote: 'Featured projects',
    contactTitle: 'Where to find me',
    contactLabels: { github: 'GitHub', linkedin: 'LinkedIn', email: 'Gmail' },
    noLinks: 'No contact links have been configured yet.',
    close: 'Close',
    scene: {
      title: 'Zaragoza',
      label: '3D model of Zaragoza. Press Enter or Space to draw it; left and right arrows to rotate it.',
      action: 'Draw Zaragoza',
      inviteClick: 'Click to draw',
      inviteTap: 'Tap to draw',
      drawing: 'Drawing: {part}',
      done: 'Zaragoza drawn. Press again to redraw it.',
      ariaStart: 'Model of Zaragoza, not drawn yet: just a point on the north bank of the Ebro.',
      ariaDone: 'Finished model of Zaragoza: the Ebro between its two banks, the Stone Bridge crossing it from one bank to the other, and the Pilar basilica on the south bank, signed “Pablo Villa”.',
    },
    titleSep: ' | ',
  },
} as const;

export type UI = (typeof ui)[Lang];
