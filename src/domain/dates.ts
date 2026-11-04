/** Día local como 'YYYY-MM-DD'. */
export function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Días entre dos claves 'YYYY-MM-DD' (b - a). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

export function relativeDay(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const diff = daysBetween(dayKey(d), dayKey(now));
  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
