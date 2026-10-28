import { UserProgress } from '../types';

// Datos simulados en memoria. Reemplazar por Supabase cuando exista backend.
export const mockProgress: UserProgress = {
  name: 'Diego',
  rankId: 'oro',
  level: 11,
  xp: 2180,
  xpForNextLevel: 2700,
  streakDays: 12,
  prsThisMonth: 3,
  recentXp: [
    { id: 'e1', kind: 'session', title: 'Sesión completa', when: 'Hoy', xp: 50 },
    { id: 'e2', kind: 'pr', title: 'Nuevo PR - Sentadilla', when: 'Ayer', xp: 150 },
    { id: 'e3', kind: 'streak', title: 'Bonus - Racha semanal', when: 'Hace 2 días', xp: 80 },
  ],
};
