/** 2180 -> "2,180". Manual para no depender de Intl en el motor JS. */
export function formatNumber(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
