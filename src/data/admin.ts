import { supabase } from '../lib/supabase';
import type { AdminUser, ExerciseLog, PersonalRecord, Session } from '../types';

interface OverviewRow {
  id: string;
  display_name: string | null;
  unit: string | null;
  total_xp: number | null;
  streak: number | null;
  best_streak: number | null;
  last_training_day: string | null;
  onboarded: boolean | null;
  created_at: string;
  sessions_count: number | string | null;
  prs_count: number | string | null;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_user_overview')
    .select('*')
    .order('total_xp', { ascending: false })
    .limit(200);
  if (error) throw error;

  return ((data ?? []) as OverviewRow[]).map((r) => ({
    id: r.id,
    name: r.display_name?.trim() || 'Atleta',
    unit: r.unit === 'lb' ? 'lb' : 'kg',
    totalXp: r.total_xp ?? 0,
    streak: r.streak ?? 0,
    bestStreak: r.best_streak ?? 0,
    lastTrainingDay: r.last_training_day,
    onboarded: r.onboarded ?? false,
    createdAt: r.created_at,
    sessionsCount: Number(r.sessions_count ?? 0),
    prsCount: Number(r.prs_count ?? 0),
  }));
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

export interface AdminUserDetail {
  prs: { exerciseId: string; pr: PersonalRecord }[];
  sessions: Session[];
}

export async function fetchAdminUserDetail(userId: string): Promise<AdminUserDetail> {
  const [prRes, sessionRes] = await Promise.all([
    supabase.from('personal_records').select('*').eq('user_id', userId).order('exercise_id'),
    supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('performed_at', { ascending: false })
      .limit(15),
  ]);
  if (prRes.error) throw prRes.error;
  if (sessionRes.error) throw sessionRes.error;

  return {
    prs: ((prRes.data ?? []) as PrRowDb[]).map((r) => ({
      exerciseId: r.exercise_id,
      pr: { weightKg: Number(r.weight_kg), reps: r.reps, e1rm: Number(r.e1rm), date: r.achieved_at },
    })),
    sessions: ((sessionRes.data ?? []) as SessionRowDb[]).map((r) => ({
      id: r.id,
      date: r.performed_at,
      name: r.name,
      exercises: r.exercises ?? [],
      volumeKg: Number(r.volume_kg),
      xp: r.xp,
    })),
  };
}
