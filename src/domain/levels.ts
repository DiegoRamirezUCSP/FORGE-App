/** XP total necesario para alcanzar un nivel. Nivel 1 = 0 XP. */
export function xpToReach(level: number): number {
  return 25 * level * (level - 1);
}

export function levelFromXp(xp: number): number {
  let l = Math.max(1, Math.floor((1 + Math.sqrt(1 + (4 * xp) / 25)) / 2));
  while (xpToReach(l + 1) <= xp) l++;
  while (l > 1 && xpToReach(l) > xp) l--;
  return l;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const start = xpToReach(level);
  const nextLevelXp = xpToReach(level + 1);
  return {
    level,
    xp,
    nextLevelXp,
    missing: Math.max(0, nextLevelXp - xp),
    /** Avance dentro del nivel actual, 0 a 1. */
    ratio: (xp - start) / (nextLevelXp - start),
  };
}
