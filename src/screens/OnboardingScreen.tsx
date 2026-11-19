import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { BASE_LIFTS, getExercise } from '../data/exercises';
import { fromDisplayWeight, parseDecimal } from '../format';
import { useForge } from '../state/ProgressProvider';
import { colors, font, radius, spacing } from '../theme';
import type { Unit } from '../types';

const ERROR_COLOR = '#FF6A5C';

export function OnboardingScreen() {
  const { state, completeOnboarding } = useForge();
  const [name, setName] = useState(state.name === 'Atleta' ? '' : state.name);
  const [unit, setUnit] = useState<Unit>(state.unit);
  const [values, setValues] = useState<Record<string, { w: string; r: string }>>({});
  const [error, setError] = useState<string | null>(null);

  const patch = (id: string, p: Partial<{ w: string; r: string }>) =>
    setValues((prev) => ({ ...prev, [id]: { w: '', r: '', ...prev[id], ...p } }));

  const submit = () => {
    if (!name.trim()) {
      setError('Escribe tu nombre.');
      return;
    }
    const prs: { exerciseId: string; weightKg: number; reps: number }[] = [];
    for (const id of BASE_LIFTS) {
      const w = parseDecimal(values[id]?.w ?? '');
      const r = Math.round(parseDecimal(values[id]?.r ?? ''));
      if (w <= 0 && r <= 0) continue; // vacío: se puede omitir
      if (w <= 0 || r <= 0) {
        setError(`Completa peso y repeticiones de ${getExercise(id)?.name ?? id}, o déjalo vacío.`);
        return;
      }
      prs.push({ exerciseId: id, weightKg: fromDisplayWeight(w, unit), reps: r });
    }
    setError(null);
    completeOnboarding({ name, unit, prs });
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Entra con contexto</Text>
          <Text style={styles.text}>
            Registra tus PRs actuales como referencia. Tus primeras 5 sesiones sirven de colocación y, desde ahí,
            tu progreso se mide en XP, niveles y rangos.
          </Text>
          <Text style={styles.sub}>
            Las personas administradoras del servicio pueden ver tus datos de entrenamiento. Nunca ven tu contraseña.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tu perfil</Text>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="¿Cómo te llamas?"
              placeholderTextColor={colors.textDim}
              style={styles.input}
            />
            <Text style={styles.label}>Unidades</Text>
            <View style={styles.segment}>
              {(['kg', 'lb'] as Unit[]).map((u) => (
                <Pressable
                  key={u}
                  accessibilityRole="button"
                  accessibilityState={{ selected: unit === u }}
                  onPress={() => setUnit(u)}
                  style={[styles.segBtn, unit === u && styles.segOn]}
                >
                  <Text style={[styles.segText, unit === u && { color: colors.bg }]}>{u}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tus PRs iniciales</Text>
            <Text style={styles.sub}>Si no conoces alguno, déjalo vacío. Podrás editarlo en tu perfil.</Text>
            {BASE_LIFTS.map((id) => (
              <View key={id} style={styles.liftRow}>
                <Text style={styles.liftName}>{getExercise(id)?.name ?? id}</Text>
                <View style={styles.liftInputs}>
                  <TextInput
                    value={values[id]?.w ?? ''}
                    onChangeText={(t) => patch(id, { w: t })}
                    keyboardType="decimal-pad"
                    placeholder={unit}
                    placeholderTextColor={colors.textDim}
                    accessibilityLabel={`Peso de ${getExercise(id)?.name ?? id} en ${unit}`}
                    style={[styles.input, styles.small]}
                  />
                  <Text style={styles.times}>×</Text>
                  <TextInput
                    value={values[id]?.r ?? ''}
                    onChangeText={(t) => patch(id, { r: t })}
                    keyboardType="number-pad"
                    placeholder="reps"
                    placeholderTextColor={colors.textDim}
                    accessibilityLabel={`Repeticiones de ${getExercise(id)?.name ?? id}`}
                    style={[styles.input, styles.small]}
                  />
                </View>
              </View>
            ))}
          </View>

          {error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
          <Button label="Empezar" onPress={submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  title: { ...font.title, color: colors.text },
  text: { ...font.body, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 6,
    borderTopColor: colors.orange,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: { ...font.heading, color: colors.text },
  sub: { ...font.small, color: colors.textMuted },
  label: { ...font.small, color: colors.textMuted },
  input: {
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: 17,
  },
  small: { width: 84, textAlign: 'center', paddingHorizontal: spacing.sm },
  segment: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  segBtn: { flex: 1, paddingVertical: spacing.sm + 2, alignItems: 'center', backgroundColor: colors.surfaceDeep },
  segOn: { backgroundColor: colors.orange },
  segText: { fontSize: 16, fontWeight: '800', color: colors.text },
  liftRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  liftName: { ...font.body, color: colors.text, flex: 1 },
  liftInputs: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  times: { ...font.body, color: colors.textMuted },
  error: { ...font.small, color: ERROR_COLOR },
});
