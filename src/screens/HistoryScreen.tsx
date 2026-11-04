import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { relativeDay } from '../domain/dates';
import { formatVolume } from '../format';
import { useForge } from '../state/ProgressProvider';
import { colors, font, radius, spacing } from '../theme';

export function HistoryScreen() {
  const { state } = useForge();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={state.sessions}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={styles.title}>Historial</Text>}
        ListEmptyComponent={
          <Text style={styles.empty}>Aquí verás tus sesiones. Completa tu primer entrenamiento para empezar.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row} accessible>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>
                {relativeDay(item.date)} · {item.exercises.length} ejercicios · {formatVolume(item.volumeKg, state.unit)}
              </Text>
            </View>
            <Text style={styles.xp}>+{item.xp} XP</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.sm + 2 },
  title: { ...font.title, color: colors.text, marginBottom: spacing.md },
  empty: { ...font.body, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  name: { ...font.body, color: colors.text, fontWeight: '700' },
  sub: { ...font.small, color: colors.textMuted },
  xp: { fontSize: 18, fontWeight: '800', color: colors.text },
});
