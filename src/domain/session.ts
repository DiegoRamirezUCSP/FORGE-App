import { getExercise } from '../data/exercises';
import { displayRankId } from '../data/ranks';
import type { AppState, ExerciseLog, Session, SessionResult, XpEvent } from '../types';
import { dayKey } from './dates';
import { levelFromXp } from './levels';
import {
  PR_BONUS_XP,
  STREAK_BONUS_XP,
  baselineVolume,
  detectPRs,
  earnsStreakBonus,
  nextStreak,
  sessionBaseXp,
  sessionVolume,
} from './xp';

/** Función pura: aplica una sesión al estado y devuelve el feedback. */
export function applySession(
  state: AppState,
  name: string,
  exercises: ExerciseLog[],
  now: Date = new Date(),
): { state: AppState; result: SessionResult } {
  const logs = exercises
    .map((e) => ({
      exerciseId: e.exerciseId,
      sets: e.sets.filter((s) => s.weightKg > 0 && s.reps > 0),
    }))
    .filter((e) => e.sets.length > 0);

  const iso = now.toISOString();
  const today = dayKey(now);
  const volume = sessionVolume(logs);
  const { ratio, xp: xpBase } = sessionBaseXp(volume, baselineVolume(state.sessions));

  const prUpdates = detectPRs(logs, state.prs, iso);
  const bonusPRs = prUpdates.filter((u) => u.isBonus);
  const xpPr = bonusPRs.length * PR_BONUS_XP;

  const st = nextStreak(state.streak, state.lastTrainingDay, today);
  const streakBonus = earnsStreakBonus(st.streak, st.incremented);
  const xpStreak = streakBonus ? STREAK_BONUS_XP : 0;

  const xpTotal = xpBase + xpPr + xpStreak;
  const id = `s_${now.getTime()}`;
  const sessionName = name.trim() || 'Entrenamiento';
  const exName = (exerciseId: string) => getExercise(exerciseId)?.name ?? exerciseId;

  const session: Session = {
    id,
    date: iso,
    name: sessionName,
    exercises: logs,
    volumeKg: volume,
    xp: xpTotal,
  };

  const events: XpEvent[] = [
    { id: `${id}-s`, kind: 'session', title: 'Sesión completa', date: iso, xp: xpBase },
    ...bonusPRs.map((u) => ({
      id: `${id}-pr-${u.exerciseId}`,
      kind: 'pr' as const,
      title: `Nuevo PR - ${exName(u.exerciseId)}`,
      date: iso,
      xp: PR_BONUS_XP,
    })),
    ...(streakBonus
      ? [{ id: `${id}-st`, kind: 'streak' as const, title: 'Bonus - Racha semanal', date: iso, xp: xpStreak }]
      : []),
  ];

  const prs = { ...state.prs };
  for (const u of prUpdates) prs[u.exerciseId] = u.record;

  const totalXpAfter = state.totalXp + xpTotal;
  const levelBefore = levelFromXp(state.totalXp);
  const levelAfter = levelFromXp(totalXpAfter);
  const sessionNumber = state.sessions.length + 1;

  const next: AppState = {
    ...state,
    totalXp: totalXpAfter,
    streak: st.streak,
    bestStreak: Math.max(state.bestStreak, st.streak),
    lastTrainingDay: today,
    prs,
    sessions: [session, ...state.sessions],
    xpEvents: [...events, ...state.xpEvents].slice(0, 50),
  };

  const result: SessionResult = {
    sessionName,
    volumeKg: volume,
    ratio,
    xpBase,
    xpPr,
    xpStreak,
    xpTotal,
    newPRs: bonusPRs.map((u) => ({
      exerciseId: u.exerciseId,
      weightKg: u.record.weightKg,
      reps: u.record.reps,
    })),
    references: prUpdates.filter((u) => !u.isBonus).map((u) => u.exerciseId),
    streak: st.streak,
    streakBonus,
    levelBefore,
    levelAfter,
    rankBefore: displayRankId(levelBefore, state.sessions.length),
    rankAfter: displayRankId(levelAfter, sessionNumber),
    totalXpAfter,
    sessionNumber,
  };

  return { state: next, result };
}
