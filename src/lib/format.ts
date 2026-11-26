/** Utilidades de presentación. Sin lógica de negocio: solo formato. */
import { ui, type Lang } from '../i18n/ui';

/** "2024-03" → "mar 2024" / "Mar 2024" según el idioma. */
export function formatMonth(yearMonth: string, lang: Lang): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const formatter = new Intl.DateTimeFormat(ui[lang].locale, { month: 'short', year: 'numeric', timeZone: 'UTC' });
  return formatter.format(new Date(Date.UTC(year, month - 1, 1))).replace('.', '');
}

/** Inicio y fin de un periodo. Sin fin = «Actualidad» / «Present». */
export function formatRange(start: string, end: string | undefined, lang: Lang) {
  return { start: formatMonth(start, lang), end: end ? formatMonth(end, lang) : ui[lang].present };
}

/** Une una lista: "A, B y C" / "A, B and C". */
export function joinList(items: readonly string[], lang: Lang): string {
  return new Intl.ListFormat(ui[lang].locale, { style: 'long', type: 'conjunction' }).format(items);
}

/** "https://github.com/usuario" → "github.com/usuario" (decodifica %C3%B1 → ñ). */
export function displayUrl(url: string): string {
  let shown = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  try {
    shown = decodeURI(shown);
  } catch {
    /* se deja tal cual */
  }
  return shown;
}
