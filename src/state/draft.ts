import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DraftWorkout } from '../types';

const KEY = 'forge:active-draft:v1';
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // un borrador de más de 12 h se descarta

export interface SetRow {
  weight: string;
  reps: string;
  done: boolean;
}
export interface ExState {
  exerciseId: string;
  sets: SetRow[];
}
export interface ActiveDraft {
  workout: DraftWorkout;
  exs: ExState[];
  savedAt: string;
}

export async function loadActiveDraft(): Promise<ActiveDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as ActiveDraft;
    if (Date.now() - new Date(d.savedAt).getTime() > MAX_AGE_MS) {
      await AsyncStorage.removeItem(KEY);
      return null;
    }
    return d;
  } catch {
    return null;
  }
}

export function saveActiveDraft(d: ActiveDraft) {
  return AsyncStorage.setItem(KEY, JSON.stringify(d)).catch(() => {});
}

export function clearActiveDraft() {
  return AsyncStorage.removeItem(KEY).catch(() => {});
}