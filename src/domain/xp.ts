import type { ExerciseLog, PersonalRecord, Session } from '../types';
import { daysBetween } from './dates';

// Reglas ajustables en un solo lugar.
export const BASE_SESSION_XP = 50;
export const PR_BONUS_XP = 150;
export const STREAK_BONUS_XP = 80;
export const STREAK_BONUS_EVERY = 7;
/** Días máximos entre sesiones para sostener la racha (3 = hasta 2 de descanso). */
export const MAX_GAP_DAYS = 3;
/** Sesiones recientes usadas como promedio propio. */
export const BASELINE_WINDOW = 5;
export const PLACEMENT_SESSIONS = 5;

/** 1RM estimado (Epley). */
export function epley(weightKg: number, reps: number): number {
  return reps <= 1 ? weightKg : weightKg * (1 + reps / 30);
}

export function sessionVolume(logs: ExerciseLog[]): number {
  return logs.reduce(
    (total, e) => total + e.sets.reduce((s, x) => s + x.weightKg * x.reps, 0),
    0,
  );
}

/** Promedio de volumen de las últimas sesiones (más recientes primero). */
export function baselineVolume(sessions: Session[]): number | null {
  const recent = sessions.filter((s) => s.volumeKg > 0).slice(0, BASELINE_WINDOW);
  if (recent.length === 0) return null;
  return recent.reduce((t, s) => t + s.volumeKg, 0) / recent.length;
}

/** XP base: 50 al igualar tu promedio, entre 25 y 100 según el volumen relativo. */
export function sessionBaseXp(volume: number, baseline: number | null) {
  const ratio = baseline && volume > 0 ? volume / baseline : 1;
  const clamped = Math.min(2, Math.max(0.5, ratio));
  return { ratio, xp: Math.round(BASE_SESSION_XP * clamped) };
}

export interface PrUpdate {
  exerciseId: string;
  record: PersonalRecord;
  /** false = primer registro: queda como referencia y no da bono. */
  isBonus: boolean;
}

export function detectPRs(
  logs: ExerciseLog[],
  prs: Record<string, PersonalRecord>,
  date: string,
): PrUpdate[] {
  const updates: PrUpdate[] = [];
  for (const log of logs) {
    let best: PersonalRecord | null = null;
    for (const s of log.sets) {
      const e1rm = epley(s.weightKg, s.reps);
      if (!best || e1rm > best.e1rm) {
        best = { weightKg: s.weightKg, reps: s.reps, e1rm, date };
      }
    }
    if (!best) continue;
    const prev = prs[log.exerciseId];
    if (!prev) updates.push({ exerciseId: log.exerciseId, record: best, isBonus: false });
    else if (best.e1rm > prev.e1rm + 0.001)
      updates.push({ exerciseId: log.exerciseId, record: best, isBonus: true });
  }
  return updates;
}

export function nextStreak(prev: number, lastDay: string | null, today: string) {
  if (!lastDay) return { streak: 1, incremented: true };
  const diff = daysBetween(lastDay, today);
  if (diff <= 0) return { streak: Math.max(1, prev), incremented: false };
  if (diff <= MAX_GAP_DAYS) return { streak: prev + 1, incremented: true };
  return { streak: 1, incremented: true };
}

export function earnsStreakBonus(streak: number, incremented: boolean): boolean {
  return incremented && streak > 0 && streak % STREAK_BONUS_EVERY === 0;
}
