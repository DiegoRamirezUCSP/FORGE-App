import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EXERCISES, GROUPS } from '../data/exercises';
import { formatWeight } from '../format';
import { useForge } from '../state/ProgressProvider';
import { colors, font, radius, spacing } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (exerciseId: string) => void;
  excludeIds?: string[];
}

export function ExercisePicker({ visible, onClose, onPick, excludeIds = [] }: Props) {
  const { state } = useForge();
  const groups = useMemo(
    () =>
      GROUPS.map((g) => ({
        group: g,
        items: EXERCISES.filter((e) => e.group === g && !excludeIds.includes(e.id)),
      })).filter((g) => g.items.length > 0),
    [excludeIds],
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Agregar ejercicio</Text>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.close}>Cerrar</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {groups.length === 0 && <Text style={styles.empty}>Ya agregaste todos los ejercicios.</Text>}
          {groups.map(({ group, items }) => (
            <View key={group} style={styles.group}>
              <Text style={styles.groupTitle}>{group}</Text>
              {items.map((e) => {
                const pr = state.prs[e.id];
                return (
                  <Pressable
                    key={e.id}
                    accessibilityRole="button"
                    onPress={() => {
                      onPick(e.id);
                      onClose();
                    }}
                    style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={styles.name}>{e.name}</Text>
                    <Text style={styles.pr}>
                      {pr ? `PR ${formatWeight(pr.weightKg, state.unit)} × ${pr.reps}` : 'Sin PR'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  title: { ...font.heading, color: colors.text },
  close: { ...font.body, color: colors.orange, fontWeight: '700' },
  content: { padding: spacing.lg, gap: spacing.lg },
  group: { gap: spacing.sm },
  groupTitle: { ...font.small, color: colors.amber, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  name: { ...font.body, color: colors.text, flex: 1 },
  pr: { ...font.small, color: colors.textMuted },
  empty: { ...font.body, color: colors.textMuted },
});
