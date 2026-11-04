import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { ExercisePicker } from '../components/ExercisePicker';
import { Stepper } from '../components/Stepper';
import { getExercise } from '../data/exercises';
import { formatWeight } from '../format';
import type { HomeStackParams } from '../navigation/types';
import { useForge } from '../state/ProgressProvider';
import { colors, font, radius, spacing } from '../theme';
import type { DraftItem } from '../types';

type Props = NativeStackScreenProps<HomeStackParams, 'WorkoutSetup'>;

export function WorkoutSetupScreen({ navigation, route }: Props) {
  const { state, saveRoutine } = useForge();
  const initial = route.params?.draft;
  const [name, setName] = useState(initial?.name ?? '');
  const [items, setItems] = useState<DraftItem[]>(initial?.items ?? []);
  const [picking, setPicking] = useState(false);

  const patch = (i: number, p: Partial<DraftItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)));

  const add = (exerciseId: string) =>
    setItems((prev) => [...prev, { exerciseId, sets: 3, reps: 8 }]);

  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const start = () =>
    navigation.navigate('ActiveSession', {
      draft: { name: name.trim() || 'Entrenamiento libre', items },
    });

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Falta un nombre', 'Escribe un nombre para guardar la rutina.');
      return;
    }
    saveRoutine(name, items);
    Alert.alert('Rutina guardada', `"${name.trim()}" ya está en Mis rutinas.`);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nombre del entrenamiento</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Empuje, Piernas…"
          placeholderTextColor={colors.textDim}
          style={styles.input}
        />

        {items.length === 0 && (
          <Text style={styles.empty}>Agrega al menos un ejercicio para comenzar.</Text>
        )}

        {items.map((it, i) => {
          const ex = getExercise(it.exerciseId);
          const pr = state.prs[it.exerciseId];
          return (
            <View key={it.exerciseId} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exName}>{ex?.name ?? it.exerciseId}</Text>
                  <Text style={styles.sub}>
                    {pr ? `PR ${formatWeight(pr.weightKg, state.unit)} × ${pr.reps}` : 'Sin PR todavía'}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar ${ex?.name ?? 'ejercicio'}`}
                  onPress={() => remove(i)}
                  hitSlop={8}
                >
                  <Text style={styles.remove}>Quitar</Text>
                </Pressable>
              </View>
              <View style={styles.steppers}>
                <Stepper label="Series" value={it.sets} min={1} max={10} onChange={(v) => patch(i, { sets: v })} />
                <Stepper label="Repeticiones" value={it.reps} min={1} max={30} onChange={(v) => patch(i, { reps: v })} />
              </View>
            </View>
          );
        })}

        <Button label="+ Agregar ejercicio" variant="ghost" onPress={() => setPicking(true)} />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Guardar rutina" variant="ghost" flex disabled={items.length === 0} onPress={save} />
        <Button label="Comenzar" flex disabled={items.length === 0} onPress={start} />
      </View>

      <ExercisePicker
        visible={picking}
        onClose={() => setPicking(false)}
        onPick={add}
        excludeIds={items.map((i) => i.exerciseId)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  label: { ...font.small, color: colors.textMuted },
  input: {
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    fontSize: 17,
  },
  empty: { ...font.body, color: colors.textMuted, marginVertical: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  exName: { ...font.body, color: colors.text, fontWeight: '700' },
  sub: { ...font.small, color: colors.textMuted, marginTop: 2 },
  remove: { ...font.small, color: '#FF6A5C', fontWeight: '700' },
  steppers: { flexDirection: 'row', gap: spacing.md },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
