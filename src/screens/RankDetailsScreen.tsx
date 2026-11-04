import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RANKS, nextRank } from '../data/ranks';
import { PLACEMENT_SESSIONS } from '../domain/xp';
import { useForge } from '../state/ProgressProvider';
import { selectProgress } from '../state/selectors';
import { colors, font, radius, spacing } from '../theme';

export function RankDetailsScreen() {
  const { state } = useForge();
  const p = useMemo(() => selectProgress(state), [state]);
  const next = nextRank(p.rank.id);
  const levelsLeft = next ? Math.max(0, next.minLevel - p.level) : 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {!p.placementDone && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Colocación: sesión {p.placementCount} de {PLACEMENT_SESSIONS}
          </Text>
          <View style={styles.dots}>
            {Array.from({ length: PLACEMENT_SESSIONS }, (_, i) => (
              <View key={i} style={[styles.dot, i < p.placementCount && styles.dotOn]} />
            ))}
          </View>
          <Text style={styles.sub}>Tu rango se confirma al completar {PLACEMENT_SESSIONS} sesiones.</Text>
        </View>
      )}

      <Text style={styles.status}>
        {next
          ? `Te ${levelsLeft === 1 ? 'falta 1 nivel' : `faltan ${levelsLeft} niveles`} para ${next.name}.`
          : 'Alcanzaste el rango máximo.'}
      </Text>

      <View style={styles.list}>
        {RANKS.map((r) => {
          const current = r.id === p.rank.id;
          const reached = r.tier < p.rank.tier;
          return (
            <View
              key={r.id}
              accessible
              accessibilityLabel={`${r.name}, ${r.subtitle}, desde el nivel ${r.minLevel}${
                current ? ', rango actual' : reached ? ', superado' : ''
              }`}
              style={[styles.row, current && { borderColor: r.color }, !current && !reached && { opacity: 0.55 }]}
            >
              <View style={[styles.swatch, { backgroundColor: r.color }]}>
                <Text style={[styles.tier, { color: r.onColor }]}>{r.tier}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {r.name} - {r.subtitle}
                </Text>
                <Text style={styles.sub}>Desde el nivel {r.minLevel}</Text>
              </View>
              {current && <Text style={[styles.tag, { color: r.color }]}>Actual</Text>}
              {reached && <Text style={styles.done}>✓</Text>}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 6,
    borderTopColor: colors.amber,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: { ...font.heading, color: colors.text },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.surfaceDeep, borderWidth: 1, borderColor: colors.border },
  dotOn: { backgroundColor: colors.orange, borderColor: colors.orange },
  sub: { ...font.small, color: colors.textMuted },
  status: { ...font.body, color: colors.text },
  list: { gap: spacing.sm + 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  swatch: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tier: { fontSize: 18, fontWeight: '800' },
  name: { ...font.body, color: colors.text, fontWeight: '700' },
  tag: { ...font.small, fontWeight: '800' },
  done: { fontSize: 20, fontWeight: '800', color: colors.amber },
});
