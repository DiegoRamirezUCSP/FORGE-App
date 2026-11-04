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
import { createDemoState, emptyState } from '../data/demo';
import { applySession } from '../domain/session';
import { epley } from '../domain/xp';
import type { AppState, DraftItem, ExerciseLog, SessionResult, Unit } from '../types';

const STORAGE_KEY = 'forge:v1';

interface ForgeContext {
  state: AppState;
  completeSession: (name: string, logs: ExerciseLog[]) => SessionResult;
  saveRoutine: (name: string, items: DraftItem[]) => void;
  deleteRoutine: (id: string) => void;
  setName: (name: string) => void;
  setUnit: (unit: Unit) => void;
  setPR: (exerciseId: string, weightKg: number, reps: number) => void;
  resetData: () => void;
  loadDemo: () => void;
}

const Ctx = createContext<ForgeContext | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => emptyState());
  const [ready, setReady] = useState(false);
  const ref = useRef(state);

  const commit = useCallback((next: AppState) => {
    ref.current = next;
    setState(next);
  }, []);

  // Carga inicial: si no hay datos guardados, arranca con datos de ejemplo.
  useEffect(() => {
    let alive = true;
    (async () => {
      let next: AppState;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        next = raw ? { ...emptyState(), ...JSON.parse(raw) } : createDemoState();
      } catch {
        next = createDemoState();
      }
      if (alive) {
        commit(next);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [commit]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const api = useMemo(
    () => ({
      completeSession: (name: string, logs: ExerciseLog[]) => {
        const { state: next, result } = applySession(ref.current, name, logs);
        commit(next);
        return result;
      },
      saveRoutine: (name: string, items: DraftItem[]) => {
        const routine = { id: `r_${Date.now()}`, name: name.trim() || 'Mi rutina', items };
        commit({ ...ref.current, routines: [routine, ...ref.current.routines] });
      },
      deleteRoutine: (id: string) =>
        commit({ ...ref.current, routines: ref.current.routines.filter((r) => r.id !== id) }),
      setName: (name: string) => commit({ ...ref.current, name: name.trim() || 'Atleta' }),
      setUnit: (unit: Unit) => commit({ ...ref.current, unit }),
      setPR: (exerciseId: string, weightKg: number, reps: number) =>
        commit({
          ...ref.current,
          prs: {
            ...ref.current.prs,
            [exerciseId]: {
              weightKg,
              reps,
              e1rm: epley(weightKg, reps),
              date: new Date().toISOString(),
            },
          },
        }),
      resetData: () => commit(emptyState()),
      loadDemo: () => commit(createDemoState()),
    }),
    [commit],
  );

  const value = useMemo(() => ({ state, ...api }), [state, api]);

  if (!ready) return null;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useForge(): ForgeContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useForge debe usarse dentro de ProgressProvider');
  return ctx;
}
