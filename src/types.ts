export type RankId =
  | 'hierro'
  | 'bronce'
  | 'plata'
  | 'oro'
  | 'platino'
  | 'diamante'
  | 'maestro';

export interface Rank {
  id: RankId;
  tier: number;
  name: string;
  subtitle: string;
  color: string;
  /** Color de texto legible sobre `color`. */
  onColor: string;
}

export type XpEventKind = 'session' | 'pr' | 'streak';

export interface XpEvent {
  id: string;
  kind: XpEventKind;
  title: string;
  when: string;
  xp: number;
}

export interface UserProgress {
  name: string;
  rankId: RankId;
  level: number;
  xp: number;
  xpForNextLevel: number;
  streakDays: number;
  prsThisMonth: number;
  recentXp: XpEvent[];
}
