import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState as RNAppState, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../components/Button';
import { LoadingView } from '../components/LoadingView';
import { emptyState } from '../data/demo';
import { Op, fetchRemoteState, isPermanentError, progressPatch, runOp } from '../data/remote';
import { applySession } from '../domain/session';
import { epley } from '../domain/xp';
import { colors, font, spacing } from '../theme';
import type { AppState, DraftItem, ExerciseLog, PersonalRecord, SessionResult, Unit } from '../types';

const stateKey = (userId: string) => `forge:v2:${userId}:state`;
const outboxKey = (userId: string) => `forge:v2:${userId}:outbox`;

export interface OnboardingInput {
  name: string;
  unit: Unit;
  prs: { exerciseId: string; weightKg: number; reps: number }[];
}

interface ForgeContext {
  state: AppState;
  /** true si hay cambios que aún no llegaron a Supabase. */
  pendingSync: boolean;
  completeSession: (name: string, logs: ExerciseLog[]) => SessionResult;
  saveRoutine: (name: string, items: DraftItem[]) => void;
  deleteRoutine: (id: string) => void;
  setName: (name: string) => void;
  setUnit: (unit: Unit) => void;
  setPR: (exerciseId: string, weightKg: number, reps: number) => void;
  completeOnboarding: (input: OnboardingInput) => void;
  resetData: () => void;
}

const Ctx = createContext<ForgeContext | null>(null);

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

const makePR = (weightKg: number, reps: number): PersonalRecord => ({
  weightKg,
  reps,
  e1rm: epley(weightKg, reps),
  date: new Date().toISOString(),
});

/**
 * Estado de la persona autenticada. Los cambios se aplican de inmediato en el
 * teléfono y se envían a Supabase mediante una cola (outbox) que sobrevive a
 * cierres de la app y a caídas de conexión.
 */
export function ProgressProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const { signOut } = useAuth();
  const [state, setState] = useState<AppState>(() => emptyState());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pending, setPending] = useState(0);

  const stateRef = useRef(state);
  const outboxRef = useRef<Op[]>([]);
  const flushing = useRef(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback((next: AppState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const saveOutbox = useCallback(() => {
    setPending(outboxRef.current.length);
    AsyncStorage.setItem(outboxKey(userId), JSON.stringify(outboxRef.current)).catch(() => {});
  }, [userId]);

  /** Envía la cola en orden. Devuelve true si quedó vacía. */
  const flush = useCallback(async (): Promise<boolean> => {
    if (flushing.current) return false;
    flushing.current = true;
    let ok = true;
    try {
      while (outboxRef.current.length > 0) {
        const op = outboxRef.current[0];
        try {
          await runOp(userId, op);
        } catch (e) {
          if (!isPermanentError(e)) throw e;
          console.warn('Forge: el servidor rechazó una operación y se descartó', op.t, e);
        }
        outboxRef.current = outboxRef.current.slice(1);
        saveOutbox();
      }
    } catch {
      ok = false;
      if (!retryTimer.current) {
        retryTimer.current = setTimeout(() => {
          retryTimer.current = null;
          void flush();
        }, 15000);
      }
    } finally {
      flushing.current = false;
    }
    return ok;
  }, [userId, saveOutbox]);

  const enqueue = useCallback(
    (op: Op) => {
      outboxRef.current = [...outboxRef.current, op];
      saveOutbox();
      void flush();
    },
    [flush, saveOutbox],
  );

  const load = useCallback(async () => {
    setStatus('loading');
    let cached: AppState | null = null;
    try {
      const [rawState, rawOutbox] = await Promise.all([
        AsyncStorage.getItem(stateKey(userId)),
        AsyncStorage.getItem(outboxKey(userId)),
      ]);
      if (rawState) cached = { ...emptyState(), ...JSON.parse(rawState) };
      outboxRef.current = rawOutbox ? JSON.parse(rawOutbox) : [];
    } catch {
      outboxRef.current = [];
    }
    setPending(outboxRef.current.length);

    // Primero se envía lo pendiente; solo entonces la copia remota es confiable.
    const flushed = outboxRef.current.length === 0 ? true : await flush();
    let remote: AppState | null = null;
    if (flushed) {
      try {
        remote = await withTimeout(fetchRemoteState(userId), 10000);
      } catch {
        remote = null;
      }
    }

    const next = remote ?? cached;
    if (!next) {
      setStatus('error');
      return;
    }
    commit(next);
    setStatus('ready');
  }, [userId, flush, commit]);

  useEffect(() => {
    void load();
  }, [load]);

  // Caché local de la última copia conocida.
  useEffect(() => {
    if (status !== 'ready') return;
    AsyncStorage.setItem(stateKey(userId), JSON.stringify(state)).catch(() => {});
  }, [state, status, userId]);

  // Al volver a primer plano, reintentar lo pendiente.
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (s) => {
      if (s === 'active') void flush();
    });
    return () => sub.remove();
  }, [flush]);

  useEffect(
    () => () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    },
    [],
  );

  const api = useMemo(
    () => ({
      completeSession: (name: string, logs: ExerciseLog[]): SessionResult => {
        const prev = stateRef.current;
        const { state: next, result } = applySession(prev, name, logs);
        commit(next);
        const session = next.sessions[0];
        enqueue({
          t: 'session',
          session,
          events: next.xpEvents.filter((e) => e.id.startsWith(`${session.id}-`)),
          prs: Object.entries(next.prs)
            .filter(([id, pr]) => prev.prs[id] !== pr)
            .map(([exerciseId, pr]) => ({ exerciseId, pr })),
          progress: progressPatch(next),
        });
        return result;
      },

      saveRoutine: (name: string, items: DraftItem[]) => {
        const routine = { id: `r_${Date.now()}`, name: name.trim() || 'Mi rutina', items };
        commit({ ...stateRef.current, routines: [routine, ...stateRef.current.routines] });
        enqueue({ t: 'routine_save', routine });
      },

      deleteRoutine: (id: string) => {
        commit({ ...stateRef.current, routines: stateRef.current.routines.filter((r) => r.id !== id) });
        enqueue({ t: 'routine_delete', id });
      },

      setName: (name: string) => {
        const clean = name.trim() || 'Atleta';
        commit({ ...stateRef.current, name: clean });
        enqueue({ t: 'profile', patch: { display_name: clean } });
      },

      setUnit: (unit: Unit) => {
        commit({ ...stateRef.current, unit });
        enqueue({ t: 'profile', patch: { unit } });
      },

      setPR: (exerciseId: string, weightKg: number, reps: number) => {
        const pr = makePR(weightKg, reps);
        commit({ ...stateRef.current, prs: { ...stateRef.current.prs, [exerciseId]: pr } });
        enqueue({ t: 'pr', exerciseId, pr });
      },

      completeOnboarding: ({ name, unit, prs }: OnboardingInput) => {
        const clean = name.trim() || 'Atleta';
        const newPrs: Record<string, PersonalRecord> = {};
        for (const p of prs) newPrs[p.exerciseId] = makePR(p.weightKg, p.reps);
        commit({
          ...stateRef.current,
          name: clean,
          unit,
          onboarded: true,
          prs: { ...stateRef.current.prs, ...newPrs },
        });
        enqueue({ t: 'profile', patch: { display_name: clean, unit, onboarded: true } });
        for (const [exerciseId, pr] of Object.entries(newPrs)) enqueue({ t: 'pr', exerciseId, pr });
      },

      resetData: () => {
        const prev = stateRef.current;
        commit({ ...emptyState(), name: prev.name, unit: prev.unit, onboarded: true });
        enqueue({ t: 'reset' });
      },
    }),
    [commit, enqueue],
  );

  const value = useMemo<ForgeContext>(() => ({ state, pendingSync: pending > 0, ...api }), [state, pending, api]);

  if (status === 'loading') return <LoadingView message="Cargando tus datos…" />;

  if (status === 'error') {
    return (
      <View style={styles.error}>
        <Text style={styles.title}>No pudimos cargar tus datos</Text>
        <Text style={styles.text}>Revisa tu conexión a internet e inténtalo de nuevo.</Text>
        <Button label="Reintentar" onPress={() => void load()} />
        <Button label="Cerrar sesión" variant="ghost" onPress={() => void signOut()} />
      </View>
    );
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useForge(): ForgeContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useForge debe usarse dentro de ProgressProvider');
  return ctx;
}

const styles = StyleSheet.create({
  error: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { ...font.heading, color: colors.text, textAlign: 'center' },
  text: { ...font.body, color: colors.textMuted, textAlign: 'center' },
});
