import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { getExercise } from '../data/exercises';
import {
  formatVolume,
  formatWeight,
  fromDisplayWeight,
  parseDecimal,
  toDisplayWeight,
} from '../format';
import type { HomeStackParams } from '../navigation/types';
import { useForge } from '../state/ProgressProvider';
import { colors, font, radius, spacing } from '../theme';
import type { ExerciseLog, Session } from '../types';

type Props = NativeStackScreenProps<HomeStackParams, 'ActiveSession'>;

interface SetRow {
  weight: string;
  reps: string;
  done: boolean;
}
interface ExState {
  exerciseId: string;
  sets: SetRow[];
}

function lastWeightKg(sessions: Session[], exerciseId: string): number | null {
  for (const s of sessions) {
    const log = s.exercises.find((e) => e.exerciseId === exerciseId);
    if (log && log.sets[0]) return log.sets[0].weightKg;
  }
  return null;
}

export function ActiveSessionScreen({ navigation, route }: Props) {
  const { draft } = route.params;
  const { state, completeSession } = useForge();
  const unit = state.unit;

  const [exs, setExs] = useState<ExState[]>(() =>
    draft.items.map((it) => {
      const kg = lastWeightKg(state.sessions, it.exerciseId);
      const weight = kg ? String(toDisplayWeight(kg, unit)) : '';
      return {
        exerciseId: it.exerciseId,
        sets: Array.from({ length: it.sets }, () => ({ weight, reps: String(it.reps), done: false })),
      };
    }),
  );

  const patchSet = (ei: number, si: number, p: Partial<SetRow>) =>
    setExs((prev) =>
      prev.map((e, i) =>
        i !== ei ? e : { ...e, sets: e.sets.map((s, j) => (j !== si ? s : { ...s, ...p })) },
      ),
    );

  const toggle = (ei: number, si: number) => {
    const s = exs[ei].sets[si];
    if (!s.done && !(parseDecimal(s.weight) > 0 && parseDecimal(s.reps) > 0)) {
      Alert.alert('Faltan datos', 'Ingresa peso y repeticiones para completar la serie.');
      return;
    }
    patchSet(ei, si, { done: !s.done });
  };

  const addSet = (ei: number) =>
    setExs((prev) =>
      prev.map((e, i) => {
        if (i !== ei) return e;
        const last = e.sets[e.sets.length - 1];
        return { ...e, sets: [...e.sets, { weight: last?.weight ?? '', reps: last?.reps ?? '8', done: false }] };
      }),
    );

  const doneCount = exs.reduce((t, e) => t + e.sets.filter((s) => s.done).length, 0);
  const liveVolumeKg = exs.reduce(
    (t, e) =>
      t +
      e.sets
        .filter((s) => s.done)
        .reduce((v, s) => v + fromDisplayWeight(parseDecimal(s.weight), unit) * parseDecimal(s.reps), 0),
    0,
  );

  const finish = () => {
    const logs: ExerciseLog[] = exs
      .map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets
          .filter((s) => s.done)
          .map((s) => ({
            weightKg: fromDisplayWeight(parseDecimal(s.weight), unit),
            reps: Math.round(parseDecimal(s.reps)),
          })),
      }))
      .filter((e) => e.sets.length > 0);

    if (logs.length === 0) {
      Alert.alert('Sin series', 'Completa al menos una serie para terminar.');
      return;
    }
    const result = completeSession(draft.name, logs);
    navigation.replace('SessionSummary', { result });
  };

  const discard = () =>
    Alert.alert('Descartar entrenamiento', 'Se perderá lo que registraste en esta sesión.', [
      { text: 'Seguir entrenando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() },
    ]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.summary}>
        <Text style={styles.sessionName}>{draft.name}</Text>
        <Text style={styles.sub}>
          {doneCount} series · {formatVolume(liveVolumeKg, unit)}
        </Text>
      </View>

      {exs.map((e, ei) => {
        const ex = getExercise(e.exerciseId);
        const pr = state.prs[e.exerciseId];
        return (
          <View key={e.exerciseId} style={styles.card}>
            <Text style={styles.exName}>{ex?.name ?? e.exerciseId}</Text>
            <Text style={styles.sub}>
              {pr ? `PR ${formatWeight(pr.weightKg, unit)} × ${pr.reps}` : 'Sin PR: este registro será tu referencia'}
            </Text>

            {e.sets.map((s, si) => (
              <View key={si} style={styles.setRow}>
                <Text style={styles.setNum}>{si + 1}</Text>
                <TextInput
                  value={s.weight}
                  onChangeText={(t) => patchSet(ei, si, { weight: t })}
                  editable={!s.done}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textDim}
                  accessibilityLabel={`Peso serie ${si + 1}`}
                  style={[styles.input, s.done && styles.inputDone]}
                />
                <Text style={styles.unit}>{unit}</Text>
                <TextInput
                  value={s.reps}
                  onChangeText={(t) => patchSet(ei, si, { reps: t })}
                  editable={!s.done}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textDim}
                  accessibilityLabel={`Repeticiones serie ${si + 1}`}
                  style={[styles.input, styles.inputReps, s.done && styles.inputDone]}
                />
                <Text style={styles.unit}>reps</Text>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: s.done }}
                  accessibilityLabel={`Serie ${si + 1} completada`}
                  onPress={() => toggle(ei, si)}
                  style={[styles.check, s.done && styles.checkDone]}
                >
                  <Text style={[styles.checkMark, s.done && { color: colors.bg }]}>✓</Text>
                </Pressable>
              </View>
            ))}

            <Pressable accessibilityRole="button" onPress={() => addSet(ei)} hitSlop={8}>
              <Text style={styles.addSet}>+ Agregar serie</Text>
            </Pressable>
          </View>
        );
      })}

      <Button label="Terminar entrenamiento" onPress={finish} />
      <Button label="Descartar" variant="danger" onPress={discard} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl * 2 },
  summary: { gap: 2, marginBottom: spacing.xs },
  sessionName: { ...font.heading, color: colors.text },
  sub: { ...font.small, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  exName: { ...font.body, color: colors.text, fontWeight: '700' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  setNum: { width: 20, ...font.small, color: colors.textMuted },
  input: {
    width: 84,
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontSize: 17,
    textAlign: 'center',
  },
  inputReps: { width: 60 },
  inputDone: { opacity: 0.55 },
  unit: { ...font.small, color: colors.textMuted },
  check: {
    marginLeft: 'auto',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.textDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.orange, borderColor: colors.orange },
  checkMark: { fontSize: 20, fontWeight: '800', color: colors.textMuted },
  addSet: { ...font.small, color: colors.orange, fontWeight: '700', paddingTop: spacing.xs },
});
