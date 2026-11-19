import { supabase } from '../lib/supabase';
import type {
  AppState,
  DraftItem,
  ExerciseLog,
  PersonalRecord,
  Routine,
  Session,
  Unit,
  XpEvent,
  XpEventKind,
} from '../types';

/** Campos de `profiles` que la app modifica. */
export interface ProfilePatch {
  display_name?: string;
  unit?: Unit;
  onboarded?: boolean;
  total_xp?: number;
  streak?: number;
  best_streak?: number;
  last_training_day?: string | null;
}

/** Operaciones de escritura. Son idempotentes: se pueden reintentar sin duplicar datos. */
export type Op =
  | { t: 'profile'; patch: ProfilePatch }
  | {
      t: 'session';
      session: Session;
      events: XpEvent[];
      prs: { exerciseId: string; pr: PersonalRecord }[];
      progress: ProfilePatch;
    }
  | { t: 'pr'; exerciseId: string; pr: PersonalRecord }
  | { t: 'routine_save'; routine: Routine }
  | { t: 'routine_delete'; id: string }
  | { t: 'reset' };

export function progressPatch(s: AppState): ProfilePatch {
  return {
    total_xp: s.totalXp,
    streak: s.streak,
    best_streak: s.bestStreak,
    last_training_day: s.lastTrainingDay,
  };
}

function check(error: { message: string } | null): void {
  if (error) throw error;
}

/** Errores definitivos del servidor (p. ej. RLS o datos inválidos): reintentar no sirve. */
export function isPermanentError(e: unknown): boolean {
  const code = (e as { code?: unknown } | null)?.code;
  if (typeof code !== 'string' || code === '') return false; // red caída: se reintenta
  return !code.startsWith('PGRST3'); // PGRST3xx = autenticación: se reintenta
}

const prRow = (userId: string, exerciseId: string, pr: PersonalRecord) => ({
  user_id: userId,
  exercise_id: exerciseId,
  weight_kg: pr.weightKg,
  reps: pr.reps,
  e1rm: pr.e1rm,
  achieved_at: pr.date,
});

export async function runOp(userId: string, op: Op): Promise<void> {
  switch (op.t) {
    case 'profile':
      check((await supabase.from('profiles').upsert({ id: userId, ...op.patch })).error);
      return;

    case 'session': {
      const s = op.session;
      check(
        (
          await supabase.from('sessions').upsert({
            id: s.id,
            user_id: userId,
            name: s.name,
            performed_at: s.date,
            exercises: s.exercises,
            volume_kg: s.volumeKg,
            xp: s.xp,
          })
        ).error,
      );
      if (op.events.length > 0) {
        check(
          (
            await supabase.from('xp_events').upsert(
              op.events.map((e) => ({
                id: e.id,
                user_id: userId,
                kind: e.kind,
                title: e.title,
                xp: e.xp,
                occurred_at: e.date,
              })),
            )
          ).error,
        );
      }
      if (op.prs.length > 0) {
        check(
          (await supabase.from('personal_records').upsert(op.prs.map((p) => prRow(userId, p.exerciseId, p.pr)))).error,
        );
      }
      check((await supabase.from('profiles').upsert({ id: userId, ...op.progress })).error);
      return;
    }

    case 'pr':
      check((await supabase.from('personal_records').upsert(prRow(userId, op.exerciseId, op.pr))).error);
      return;

    case 'routine_save':
      check(
        (
          await supabase.from('routines').upsert({
            id: op.routine.id,
            user_id: userId,
            name: op.routine.name,
            items: op.routine.items,
          })
        ).error,
      );
      return;

    case 'routine_delete':
      check((await supabase.from('routines').delete().eq('user_id', userId).eq('id', op.id)).error);
      return;

    case 'reset':
      check((await supabase.from('sessions').delete().eq('user_id', userId)).error);
      check((await supabase.from('xp_events').delete().eq('user_id', userId)).error);
      check((await supabase.from('personal_records').delete().eq('user_id', userId)).error);
      check((await supabase.from('routines').delete().eq('user_id', userId)).error);
      check(
        (
          await supabase
            .from('profiles')
            .upsert({ id: userId, total_xp: 0, streak: 0, best_streak: 0, last_training_day: null })
        ).error,
      );
      return;
  }
}

interface ProfileRow {
  display_name: string | null;
  unit: string | null;
  total_xp: number | null;
  streak: number | null;
  best_streak: number | null;
  last_training_day: string | null;
  onboarded: boolean | null;
}
interface PrRowDb {
  exercise_id: string;
  weight_kg: number | string;
  reps: number;
  e1rm: number | string;
  achieved_at: string;
}
interface SessionRowDb {
  id: string;
  name: string;
  performed_at: string;
  exercises: ExerciseLog[] | null;
  volume_kg: number | string;
  xp: number;
}
interface EventRowDb {
  id: string;
  kind: XpEventKind;
  title: string;
  xp: number;
  occurred_at: string;
}
interface RoutineRowDb {
  id: string;
  name: string;
  items: DraftItem[] | null;
}

export async function fetchRemoteState(userId: string): Promise<AppState> {
  const [profileRes, prRes, sessionRes, eventRes, routineRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('personal_records').select('*').eq('user_id', userId),
    supabase.from('sessions').select('*').eq('user_id', userId).order('performed_at', { ascending: false }).limit(200),
    supabase.from('xp_events').select('*').eq('user_id', userId).order('occurred_at', { ascending: false }).limit(50),
    supabase.from('routines').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);
  for (const r of [profileRes, prRes, sessionRes, eventRes, routineRes]) check(r.error);

  // Si el trigger de alta no creó el perfil, se crea aquí con los valores por defecto.
  if (!profileRes.data) check((await supabase.from('profiles').upsert({ id: userId })).error);

  const p = profileRes.data as ProfileRow | null;

  const prs: Record<string, PersonalRecord> = {};
  for (const r of (prRes.data ?? []) as PrRowDb[]) {
    prs[r.exercise_id] = {
      weightKg: Number(r.weight_kg),
      reps: r.reps,
      e1rm: Number(r.e1rm),
      date: r.achieved_at,
    };
  }

  return {
    name: p?.display_name?.trim() || 'Atleta',
    unit: p?.unit === 'lb' ? 'lb' : 'kg',
    totalXp: p?.total_xp ?? 0,
    streak: p?.streak ?? 0,
    bestStreak: p?.best_streak ?? 0,
    lastTrainingDay: p?.last_training_day ?? null,
    onboarded: p?.onboarded ?? false,
    prs,
    sessions: ((sessionRes.data ?? []) as SessionRowDb[]).map((r) => ({
      id: r.id,
      date: r.performed_at,
      name: r.name,
      exercises: r.exercises ?? [],
      volumeKg: Number(r.volume_kg),
      xp: r.xp,
    })),
    xpEvents: ((eventRes.data ?? []) as EventRowDb[]).map((r) => ({
      id: r.id,
      kind: r.kind,
      title: r.title,
      date: r.occurred_at,
      xp: r.xp,
    })),
    routines: ((routineRes.data ?? []) as RoutineRowDb[]).map((r) => ({
      id: r.id,
      name: r.name,
      items: r.items ?? [],
    })),
  };
}
