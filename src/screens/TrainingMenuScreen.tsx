import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { relativeDay } from '../domain/dates';
import type { HomeStackParams } from '../navigation/types';
import { useForge } from '../state/ProgressProvider';
import { colors, font, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<HomeStackParams, 'TrainingMenu'>;

export function TrainingMenuScreen({ navigation }: Props) {
  const { state, deleteRoutine } = useForge();
  const last = state.sessions[0];

  const repeatLast = () => {
    if (!last) return;
    navigation.navigate('ActiveSession', {
      draft: {
        name: last.name,
        items: last.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets.length,
          reps: e.sets[0]?.reps ?? 8,
        })),
      },
    });
  };

  const confirmDelete = (id: string, name: string) =>
    Alert.alert('Eliminar rutina', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteRoutine(id) },
    ]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <OptionCard
        accent={colors.red}
        title="Repetir el último"
        subtitle={
          last
            ? `${last.name} · ${last.exercises.length} ejercicios · ${relativeDay(last.date)}`
            : 'Aún no tienes entrenamientos'
        }
        disabled={!last}
        onPress={repeatLast}
      />
      <OptionCard
        accent={colors.orange}
        title="Entrenamiento libre"
        subtitle="Elige tus propios ejercicios"
        onPress={() => navigation.navigate('WorkoutSetup')}
      />

      <Text style={styles.section}>Mis rutinas</Text>
      {state.routines.length === 0 && (
        <Text style={styles.empty}>Guarda una rutina desde la configuración del entrenamiento.</Text>
      )}
      {state.routines.map((r) => (
        <View key={r.id} style={styles.routine}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('WorkoutSetup', { draft: { name: r.name, items: r.items } })}
            style={({ pressed }) => [styles.routineMain, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.routineName}>{r.name}</Text>
            <Text style={styles.sub}>{r.items.length} ejercicios</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar rutina ${r.name}`}
            onPress={() => confirmDelete(r.id, r.name)}
            hitSlop={8}
            style={styles.delete}
          >
            <Text style={styles.deleteText}>Eliminar</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

function OptionCard({
  accent,
  title,
  subtitle,
  onPress,
  disabled = false,
}: {
  accent: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        { borderTopColor: accent },
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  option: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 6,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  optionTitle: { ...font.heading, color: colors.text },
  sub: { ...font.small, color: colors.textMuted },
  section: { ...font.heading, color: colors.text, marginTop: spacing.lg },
  empty: { ...font.body, color: colors.textMuted },
  routine: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  routineMain: { flex: 1, padding: spacing.md, gap: 2 },
  routineName: { ...font.body, color: colors.text, fontWeight: '700' },
  delete: { padding: spacing.md },
  deleteText: { ...font.small, color: '#FF6A5C', fontWeight: '700' },
});
