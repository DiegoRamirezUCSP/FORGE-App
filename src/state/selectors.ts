import { getRank, displayRankId } from '../data/ranks';
import { dayKey, daysBetween } from '../domain/dates';
import { levelProgress } from '../domain/levels';
import { PLACEMENT_SESSIONS } from '../domain/xp';
import type { AppState } from '../types';

export function selectProgress(state: AppState) {
  const lv = levelProgress(state.totalXp);
  const rank = getRank(displayRankId(lv.level, state.sessions.length));
  const today = dayKey(new Date());
  const prsLast30 = state.xpEvents.filter(
    (e) => e.kind === 'pr' && daysBetween(dayKey(new Date(e.date)), today) < 30,
  ).length;

  return {
    ...lv,
    rank,
    placementCount: Math.min(state.sessions.length, PLACEMENT_SESSIONS),
    placementDone: state.sessions.length >= PLACEMENT_SESSIONS,
    prsLast30,
  };
}
