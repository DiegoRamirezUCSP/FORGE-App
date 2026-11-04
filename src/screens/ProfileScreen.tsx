import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { StatChip } from '../components/StatChip';
import { BASE_LIFTS, getExercise } from '../data/exercises';
import { formatNumber, formatWeight, fromDisplayWeight, parseDecimal, toDisplayWeight } from '../format';
import { useForge } from '../state/ProgressProvider';
import { colors, font, radius, spacing } from '../theme';
import type { Unit } from '../types';

export function ProfileScreen() {
  const { state, setName, setUnit, setPR, resetData, loadDemo } = useForge();
  const [nameInput, setNameInput] = useState(state.name);
  const [editing, setEditing] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  useEffect(() => setNameInput(state.name), [state.name]);

  const ids = [...BASE_LIFTS, ...Object.keys(state.prs).filter((id) => !BASE_LIFTS.includes(id))];

  const openEdit = (id: string) => {
    const pr = state.prs[id];
    setWeight(pr ? String(toDisplayWeight(pr.weightKg, state.unit)) : '');
    setReps(pr ? String(pr.reps) : '');
    setEditing(id);
  };

  const savePR = () => {
    const w = parseDecimal(weight);
    const r = Math.round(parseDecimal(reps));
    if (!editing || w <= 0 || r <= 0) {
      Alert.alert('Datos incompletos', 'Ingresa un peso y repeticiones mayores a cero.');
      return;
    }
    setPR(editing, fromDisplayWeight(w, state.unit), r);
    setEditing(null);
  };

  const confirmReset = () =>
    Alert.alert('Borrar todos los datos', 'Se eliminarán sesiones, PRs, XP y rutinas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: resetData },
    ]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{state.name.charAt(0).toUpperCase()}</Text>
          </View>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            onEndEditing={() => setName(nameInput)}
            placeholder="Tu nombre"
            placeholderTextColor={colors.textDim}
            accessibilityLabel="Nombre"
            style={styles.nameInput}
          />
        </View>

        <View style={styles.stats}>
          <StatChip label="Sesiones" value={String(state.sessions.length)} />
          <StatChip label="XP total" value={formatNumber(state.totalXp)} />
          <StatChip label="Mejor racha" value={`${state.bestStreak}`} />
        </View>

        <Text style={styles.section}>Unidades</Text>
        <View style={styles.segment}>
          {(['kg', 'lb'] as Unit[]).map((u) => (
            <Pressable
              key={u}
              accessibilityRole="button"
              accessibilityState={{ selected: state.unit === u }}
              onPress={() => setUnit(u)}
              style={[styles.segBtn, state.unit === u && styles.segOn]}
            >
              <Text style={[styles.segText, state.unit === u && { color: colors.bg }]}>{u}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Mis PRs</Text>
        <View style={styles.list}>
          {ids.map((id) => {
            const pr = state.prs[id];
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={`Editar PR de ${getExercise(id)?.name ?? id}`}
                onPress={() => openEdit(id)}
                style={({ pressed }) => [styles.prRow, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.prName}>{getExercise(id)?.name ?? id}</Text>
                <Text style={[styles.prValue, !pr && { color: colors.amber }]}>
                  {pr ? `${formatWeight(pr.weightKg, state.unit)} × ${pr.reps}` : 'Agregar'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>Datos de prueba</Text>
        <Button label="Cargar datos de ejemplo" variant="ghost" onPress={loadDemo} />
        <Button label="Borrar todos los datos" variant="danger" onPress={confirmReset} />
      </ScrollView>

      <Modal visible={editing !== null} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>PR · {editing ? getExercise(editing)?.name ?? editing : ''}</Text>
            <View style={styles.dialogRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.label}>Peso ({state.unit})</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textDim}
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.label}>Repeticiones</Text>
                <TextInput
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textDim}
                  style={styles.input}
                />
              </View>
            </View>
            <View style={styles.dialogRow}>
              <Button label="Cancelar" variant="ghost" flex onPress={() => setEditing(null)} />
              <Button label="Guardar" flex onPress={savePR} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  title: { ...font.title, color: colors.text, marginBottom: spacing.sm },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: colors.text },
  nameInput: {
    flex: 1,
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  stats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  section: { ...font.heading, color: colors.text, marginTop: spacing.lg },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  segBtn: { flex: 1, paddingVertical: spacing.sm + 4, alignItems: 'center', backgroundColor: colors.surface },
  segOn: { backgroundColor: colors.orange },
  segText: { fontSize: 16, fontWeight: '800', color: colors.text },
  list: { gap: spacing.sm },
  prRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  prName: { ...font.body, color: colors.text },
  prValue: { ...font.body, color: colors.textMuted, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing.lg },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  dialogTitle: { ...font.heading, color: colors.text },
  dialogRow: { flexDirection: 'row', gap: spacing.md },
  label: { ...font.small, color: colors.textMuted },
  input: {
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm + 2,
    color: colors.text,
    fontSize: 17,
    textAlign: 'center',
  },
});
