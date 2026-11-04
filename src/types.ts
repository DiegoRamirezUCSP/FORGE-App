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
  /** Nivel mínimo para alcanzar el rango. */
  minLevel: number;
}

export type XpEventKind = 'session' | 'pr' | 'streak';

export interface XpEvent {
  id: string;
  kind: XpEventKind;
  title: string;
  /** Fecha ISO. */
  date: string;
  xp: number;
}

export type Unit = 'kg' | 'lb';

export type MuscleGroup = 'Pecho' | 'Espalda' | 'Piernas' | 'Hombros' | 'Brazos' | 'Core';

export interface Exercise {
  /** Id estable: el XP relativo compara sesiones por este id. */
  id: string;
  name: string;
  group: MuscleGroup;
}

/** Los pesos se guardan siempre en kg. */
export interface SetLog {
  weightKg: number;
  reps: number;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface Session {
  id: string;
  date: string;
  name: string;
  exercises: ExerciseLog[];
  volumeKg: number;
  xp: number;
}

export interface PersonalRecord {
  weightKg: number;
  reps: number;
  /** 1RM estimado (Epley), usado para comparar PRs. */
  e1rm: number;
  date: string;
}

export interface DraftItem {
  exerciseId: string;
  sets: number;
  reps: number;
}

export interface DraftWorkout {
  name: string;
  items: DraftItem[];
}

export interface Routine {
  id: string;
  name: string;
  items: DraftItem[];
}

export interface AppState {
  name: string;
  unit: Unit;
  totalXp: number;
  streak: number;
  bestStreak: number;
  /** Último día entrenado, 'YYYY-MM-DD'. */
  lastTrainingDay: string | null;
  prs: Record<string, PersonalRecord>;
  /** Más reciente primero. */
  sessions: Session[];
  /** Más reciente primero. */
  xpEvents: XpEvent[];
  routines: Routine[];
}

export interface SessionResult {
  sessionName: string;
  volumeKg: number;
  /** Volumen de la sesión / promedio propio (1 si no hay referencia). */
  ratio: number;
  xpBase: number;
  xpPr: number;
  xpStreak: number;
  xpTotal: number;
  newPRs: { exerciseId: string; weightKg: number; reps: number }[];
  /** Ejercicios cuyo primer registro quedó como referencia (sin bono). */
  references: string[];
  streak: number;
  streakBonus: boolean;
  levelBefore: number;
  levelAfter: number;
  rankBefore: RankId;
  rankAfter: RankId;
  totalXpAfter: number;
  sessionNumber: number;
}
