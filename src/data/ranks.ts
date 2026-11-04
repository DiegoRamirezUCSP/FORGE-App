import { PLACEMENT_SESSIONS } from '../domain/xp';
import { Rank, RankId } from '../types';

export const RANKS: Rank[] = [
  { id: 'hierro', tier: 1, name: 'Hierro', subtitle: 'Metal Crudo', color: '#7A7A7A', onColor: '#FFFFFF', minLevel: 1 },
  { id: 'bronce', tier: 2, name: 'Bronce', subtitle: 'Al Rojo Vivo', color: '#A86B4A', onColor: '#FFFFFF', minLevel: 3 },
  { id: 'plata', tier: 3, name: 'Plata', subtitle: 'Primer Pliegue', color: '#B8C0C8', onColor: '#222222', minLevel: 6 },
  { id: 'oro', tier: 4, name: 'Oro', subtitle: 'Mil Capas', color: '#FFA800', onColor: '#222222', minLevel: 9 },
  { id: 'platino', tier: 5, name: 'Platino', subtitle: 'Templado', color: '#FF6B00', onColor: '#222222', minLevel: 14 },
  { id: 'diamante', tier: 6, name: 'Diamante', subtitle: 'Afilado', color: '#C84800', onColor: '#FFFFFF', minLevel: 20 },
  { id: 'maestro', tier: 7, name: 'Maestro', subtitle: 'Hoja de Damasco', color: '#FFDD66', onColor: '#222222', minLevel: 28 },
];

export function getRank(id: RankId): Rank {
  return RANKS.find((r) => r.id === id) ?? RANKS[0];
}

export function rankForLevel(level: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) if (level >= r.minLevel) current = r;
  return current;
}

export function nextRank(id: RankId): Rank | null {
  const rank = getRank(id);
  return RANKS.find((r) => r.tier === rank.tier + 1) ?? null;
}

/** Durante la ventana de colocación el rango visible es Hierro. */
export function displayRankId(level: number, sessionCount: number): RankId {
  return sessionCount >= PLACEMENT_SESSIONS ? rankForLevel(level).id : 'hierro';
}
