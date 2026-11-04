import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { RankBadge } from '../components/RankBadge';
import { XpBar } from '../components/XpBar';
import { getExercise } from '../data/exercises';
import { getRank } from '../data/ranks';
import { levelProgress } from '../domain/levels';
import { PLACEMENT_SESSIONS } from '../domain/xp';
import { formatNumber, formatVolume, formatWeight } from '../format';
import type { HomeStackParams } from '../navigation/types';
import { useForge } from '../state/ProgressProvider';
import { colors, font, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<HomeStackParams, 'SessionSummary'>;

const nameOf = (id: string) => getExercise(id)?.name ?? id;

export function SessionSummaryScreen({ navigation, route }: Props) {
  const { result: r } = route.params;
  const { state } = useForge();
  const unit = state.unit;
  const lv = levelProgress(r.totalXpAfter);
  const leveledUp = r.levelAfter > r.levelBefore;
  const rankUp = r.rankAfter !== r.rankBefore;
  const rankAfter = getRank(r.rankAfter);
  const placementJustDone = r.sessionNumber === PLACEMENT_SESSIONS;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Sesión completa · {r.sessionName}</Text>
        <Text style={styles.total}>+{formatNumber(r.xpTotal)} XP</Text>
        <Text style={styles.sub}>
          Volumen {formatVolume(r.volumeKg, unit)} · Racha {r.streak} {r.streak === 1 ? 'día' : 'días'}
        </Text>
      </View>

      {(leveledUp || rankUp || placementJustDone) && (
        <View style={styles.banner}>
          <RankBadge rank={rankAfter} level={r.levelAfter} size={72} />
          <View style={{ flex: 1, gap: 2 }}>
            {placementJustDone && <Text style={styles.bannerTitle}>Colocación completada</Text>}
            {rankUp && (
              <Text style={styles.bannerTitle}>
                Nuevo rango: {rankAfter.name} - {rankAfter.subtitle}
              </Text>
            )}
            {leveledUp && <Text style={styles.bannerText}>Subiste al nivel {r.levelAfter}</Text>}
          </View>
        </View>
      )}

      <View style={styles.list}>
        <Line label="Sesión" hint={`Volumen al ${Math.round(r.ratio * 100)}% de tu promedio`} xp={r.xpBase} />
        {r.xpPr > 0 && <Line label={`Nuevos PRs × ${r.newPRs.length}`} xp={r.xpPr} />}
        {r.xpStreak > 0 && <Line label="Bonus racha semanal" xp={r.xpStreak} />}
      </View>

      {r.newPRs.length > 0 && (
        <View style={styles.block}>
          <Text style={styles.section}>PRs</Text>
          {r.newPRs.map((p) => (
            <Text key={p.exerciseId} style={styles.prLine}>
              {nameOf(p.exerciseId)} · {formatWeight(p.weightKg, unit)} × {p.reps}
            </Text>
          ))}
        </View>
      )}

      {r.references.length > 0 && (
        <Text style={styles.sub}>
          Referencia guardada: {r.references.map(nameOf).join(', ')}. Desde la próxima sesión podrás superarla.
        </Text>
      )}

      {!placementJustDone && r.sessionNumber < PLACEMENT_SESSIONS && (
        <Text style={styles.sub}>
          Colocación: sesión {r.sessionNumber} de {PLACEMENT_SESSIONS}
        </Text>
      )}

      <View style={styles.block}>
        <XpBar value={lv.ratio} />
        <Text style={styles.sub}>
          Faltan {formatNumber(lv.missing)} XP para Nivel {lv.level + 1}
        </Text>
      </View>

      <Button label="Listo" onPress={() => navigation.popToTop()} />
    </ScrollView>
  );
}

function Line({ label, hint, xp }: { label: string; hint?: string; xp: number }) {
  return (
    <View style={styles.line}>
      <View style={{ flex: 1 }}>
        <Text style={styles.lineLabel}>{label}</Text>
        {hint && <Text style={styles.sub}>{hint}</Text>}
      </View>
      <Text style={styles.lineXp}>+{formatNumber(xp)} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  kicker: { ...font.small, color: colors.amber, fontWeight: '700' },
  total: { fontSize: 56, fontWeight: '800', color: colors.text },
  sub: { ...font.small, color: colors.textMuted },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  bannerTitle: { ...font.body, color: colors.text, fontWeight: '800' },
  bannerText: { ...font.body, color: colors.textMuted },
  list: { gap: spacing.sm },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  lineLabel: { ...font.body, color: colors.text },
  lineXp: { fontSize: 18, fontWeight: '800', color: colors.text },
  block: { gap: spacing.sm },
  section: { ...font.heading, color: colors.text },
  prLine: { ...font.body, color: colors.textMuted },
});
