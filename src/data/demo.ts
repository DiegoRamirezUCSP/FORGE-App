import { dayKey } from '../domain/dates';
import { epley, sessionVolume } from '../domain/xp';
import type { AppState, PersonalRecord, Session, XpEvent } from '../types';

export function emptyState(): AppState {
  return {
    name: 'Atleta',
    unit: 'kg',
    totalXp: 0,
    streak: 0,
    bestStreak: 0,
    lastTrainingDay: null,
    prs: {},
    sessions: [],
    xpEvents: [],
    routines: [],
  };
}

/**
 * Datos de ejemplo. La racha arranca en 13 para que la primera sesión de hoy
 * llegue a 14 y active el bono semanal.
 */
export function createDemoState(now: Date = new Date()): AppState {
  const at = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  };

  const mk = (
    id: string,
    daysAgo: number,
    name: string,
    exs: [string, [number, number][]][],
  ): Session => {
    const exercises = exs.map(([exerciseId, sets]) => ({
      exerciseId,
      sets: sets.map(([weightKg, reps]) => ({ weightKg, reps })),
    }));
    return { id, date: at(daysAgo), name, exercises, volumeKg: sessionVolume(exercises), xp: 50 };
  };

  const sessions: Session[] = [
    mk('d1', 1, 'Piernas', [['sentadilla', [[140, 5], [135, 5], [130, 6]]], ['prensa', [[220, 10], [220, 10]]]]),
    mk('d2', 3, 'Empuje', [['press_banca', [[100, 5], [95, 6], [90, 8]]], ['press_militar', [[50, 8], [50, 7]]]]),
    mk('d3', 5, 'Tirón', [['peso_muerto', [[180, 3], [170, 5]]], ['remo_barra', [[80, 8], [80, 8]]]]),
    mk('d4', 7, 'Piernas', [['sentadilla', [[135, 5], [130, 6], [125, 8]]], ['prensa', [[210, 10], [210, 10]]]]),
    mk('d5', 9, 'Empuje', [['press_banca', [[97.5, 5], [92.5, 6], [87.5, 8]]], ['press_militar', [[47.5, 8], [47.5, 8]]]]),
    mk('d6', 11, 'Tirón', [['peso_muerto', [[175, 3], [165, 5]]], ['remo_barra', [[77.5, 8], [77.5, 8]]]]),
  ];

  const pr = (w: number, r: number, daysAgo: number): PersonalRecord => ({
    weightKg: w,
    reps: r,
    e1rm: epley(w, r),
    date: at(daysAgo),
  });

  const ev = (id: string, kind: XpEvent['kind'], title: string, daysAgo: number, xp: number): XpEvent => ({
    id,
    kind,
    title,
    date: at(daysAgo),
    xp,
  });

  return {
    name: 'Diego',
    unit: 'kg',
    totalXp: 2900,
    streak: 13,
    bestStreak: 13,
    lastTrainingDay: dayKey(new Date(at(1))),
    prs: {
      press_banca: pr(100, 5, 3),
      sentadilla: pr(140, 5, 1),
      peso_muerto: pr(180, 3, 5),
    },
    sessions,
    xpEvents: [
      ev('x1', 'session', 'Sesión completa', 1, 50),
      ev('x2', 'pr', 'Nuevo PR - Sentadilla', 1, 150),
      ev('x3', 'streak', 'Bonus - Racha semanal', 2, 80),
      ev('x4', 'session', 'Sesión completa', 3, 50),
      ev('x5', 'pr', 'Nuevo PR - Press banca', 8, 150),
      ev('x6', 'pr', 'Nuevo PR - Peso muerto', 12, 150),
    ],
    routines: [
      {
        id: 'r_empuje',
        name: 'Empuje',
        items: [
          { exerciseId: 'press_banca', sets: 4, reps: 5 },
          { exerciseId: 'press_militar', sets: 3, reps: 8 },
          { exerciseId: 'triceps_polea', sets: 3, reps: 12 },
        ],
      },
      {
        id: 'r_piernas',
        name: 'Piernas',
        items: [
          { exerciseId: 'sentadilla', sets: 4, reps: 5 },
          { exerciseId: 'prensa', sets: 3, reps: 10 },
          { exerciseId: 'peso_muerto_rumano', sets: 3, reps: 8 },
        ],
      },
    ],
  };
}
