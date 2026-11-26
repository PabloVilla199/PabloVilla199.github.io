/** Acceso a los datos validados (src/content/*.json), ya ordenados. */
import { getCollection, getEntry } from 'astro:content';

const byOrder = (a: { data: { order: number } }, b: { data: { order: number } }) => a.data.order - b.data.order;

export async function getProfile() {
  const entry = await getEntry('profile', 'profile');
  if (!entry) throw new Error('Falta src/content/profile.json');
  return entry.data;
}

export async function getExperience() {
  return (await getCollection('experience')).sort(byOrder);
}

/** Los `id` forman la URL de cada ficha (/es/proyectos/<id>/, /en/projects/<id>/). */
export async function getProjects() {
  const projects = (await getCollection('projects')).sort(byOrder);
  for (const p of projects) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) {
      throw new Error('El id de proyecto "' + p.id + '" debe usar minúsculas, números y guiones (src/content/projects.json)');
    }
  }
  return projects;
}

/** Proyectos destacados en la portada (o el primero si ninguno lo está). */
export const pickFeatured = <T extends { data: { featured: boolean } }>(items: T[]) => {
  const featured = items.filter((p) => p.data.featured);
  return featured.length > 0 ? featured : items.slice(0, 1);
};
