import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RankBadge } from '../components/RankBadge';
import { XpBar } from '../components/XpBar';
import { XpEventRow } from '../components/XpEventRow';
import { getRank } from '../data/ranks';
import { mockProgress } from '../data/mock';
import { formatNumber } from '../format';
import { colors, font, spacing } from '../theme';

export function ProgressScreen() {
  const p = mockProgress;
  const rank = getRank(p.rankId);
  const missing = Math.max(0, p.xpForNextLevel - p.xp);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <RankBadge rank={rank} level={p.level} size={150} variant="ring" />
        <Text style={styles.xp}>
          {formatNumber(p.xp)} / {formatNumber(p.xpForNextLevel)} XP
        </Text>
      </View>

      <XpBar value={p.xp / p.xpForNextLevel} />
      <Text style={styles.missing}>
        Faltan {formatNumber(missing)} XP para Nivel {p.level + 1}
      </Text>

      <Text style={styles.section}>XP reciente</Text>
      <View style={styles.list}>
        {p.recentXp.map((e) => (
          <XpEventRow key={e.id} event={e} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  hero: { alignItems: 'center', marginVertical: spacing.lg, gap: spacing.md },
  xp: { ...font.body, color: colors.textMuted },
  missing: {
    ...font.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  section: { ...font.heading, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  list: { gap: spacing.sm + 4 },
});
