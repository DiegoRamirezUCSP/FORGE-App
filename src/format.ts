import type { Unit } from './types';

/** 2180 -> "2,180". Manual para no depender de Intl en el motor JS. */
export function formatNumber(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const LB_PER_KG = 2.20462;

export function toDisplayWeight(kg: number, unit: Unit): number {
  const v = unit === 'kg' ? kg : kg * LB_PER_KG;
  return Math.round(v * 10) / 10;
}

export function fromDisplayWeight(value: number, unit: Unit): number {
  return unit === 'kg' ? value : value / LB_PER_KG;
}

export function formatWeight(kg: number, unit: Unit): string {
  return `${toDisplayWeight(kg, unit)} ${unit}`;
}

export function formatVolume(kg: number, unit: Unit): string {
  return `${formatNumber(toDisplayWeight(kg, unit))} ${unit}`;
}

/** "82,5" o "82.5" -> 82.5. Texto inválido -> 0. */
export function parseDecimal(s: string): number {
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}
