/**
 * Esquemas de los datos editables (src/content/*.json), validados con Zod.
 * Los textos pueden ser una cadena (igual en ambos idiomas) o un objeto { es, en };
 * el esquema los normaliza siempre a { es, en }. Un valor null o "" equivale a «sin configurar».
 */
import { defineCollection, reference } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

/** Cadena vacía o null = campo sin configurar. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

/** Texto traducible: "texto" o { "es": "…", "en": "…" } → siempre { es, en }. */
const localized = z
  .union([z.string().min(1), z.object({ es: z.string().min(1), en: z.string().min(1) })])
  .transform((v) => (typeof v === 'string' ? { es: v, en: v } : v));

/** Fecha en formato AAAA-MM (p. ej. "2024-03"). */
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Usa el formato AAAA-MM, p. ej. "2024-03"');

/** Listas: se respeta el `id` del JSON y el orden del archivo es el orden en la página. */
const listParser = (text: string) =>
  (JSON.parse(text) as Record<string, unknown>[]).map((entry, index) => ({
    ...entry,
    id: typeof entry.id === 'string' && entry.id ? entry.id : String(index),
    order: index,
  }));

const profile = defineCollection({
  loader: file('src/content/profile.json', {
    parser: (text) => [{ ...JSON.parse(text), id: 'profile' }],
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      /** Iniciales del monograma (referencia; el dibujo vive en src/components/Monogram.astro). */
      initials: optional(z.string().max(4)),
      headline: localized,
      bio: localized,
      location: optional(localized),
      /** Estudios: bloque propio bajo la presentación. */
      education: optional(
        z.object({
          degree: localized,
          specialization: optional(localized),
          institution: localized,
          /** Nota media tal como se mostrará (p. ej. { es: "7,5/10", en: "7.5/10" }). */
          grade: optional(localized),
        }),
      ),
      photo: optional(
        z.object({
          src: image(),
          alt: localized,
          caption: optional(localized),
        }),
      ),
      links: z
        .object({
          github: optional(z.url()),
          linkedin: optional(z.url()),
          email: optional(z.email()),
        })
        .default({}),
    }),
});

const experience = defineCollection({
  loader: file('src/content/experience.json', { parser: listParser }),
  schema: ({ image }) => z
    .object({
      order: z.number(),
      organization: localized,
      /** Nombre a mostrar si difiere de `organization`. */
      organizationDisplay: optional(localized),
      role: localized,
      start: yearMonth,
      /** null = puesto actual («Actualidad» / «Present»). */
      end: optional(yearMonth),
      location: optional(localized),
      summary: optional(localized),
      contributions: z.array(localized).default([]),
      /** id de un proyecto de projects.json: enlaza a su ficha. */
      projectId: optional(reference('projects')),
      /** Logotipo (decorativo: el nombre ya aparece en texto). `label` solo documenta qué marca es. */
      logo: optional(z.object({ src: image(), label: optional(z.string()) })),
    })
    .refine((e) => !e.end || e.end >= e.start, {
      message: '`end` no puede ser anterior a `start`',
      path: ['end'],
    }),
});

const projects = defineCollection({
  loader: file('src/content/projects.json', { parser: listParser }),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      title: localized,
      /** Resumen breve: aparece en el explorador y al inicio de la ficha. */
      summary: localized,
      context: optional(localized),
      work: z.array(localized).default([]),
      /** Apartado opcional con título y texto propios (se muestra justo después del resumen). */
      highlight: optional(z.object({ title: localized, body: localized })),
      stack: z.array(z.string().min(1)).default([]),
      /** publicWebsite = web externa en funcionamiento; source = código público. */
      links: z
        .array(z.object({ kind: z.enum(['publicWebsite', 'source']), url: z.url(), label: optional(localized) }))
        .default([]),
      /** Destacados en la portada. */
      featured: z.boolean().default(false),
      image: optional(
        z.object({
          src: image(),
          alt: localized,
          caption: optional(localized),
        }),
      ),
    }),
});

export const collections = { profile, experience, projects };
