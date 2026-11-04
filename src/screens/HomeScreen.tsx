import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RankBadge } from '../components/RankBadge';
import { StatChip } from '../components/StatChip';
import { XpBar } from '../components/XpBar';
import { PLACEMENT_SESSIONS } from '../domain/xp';
import { formatNumber } from '../format';
import type { HomeStackParams } from '../navigation/types';
import { useForge } from '../state/ProgressProvider';
import { selectProgress } from '../state/selectors';
import { colors, font, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<HomeStackParams, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { state } = useForge();
  const p = useMemo(() => selectProgress(state), [state]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>FORGE</Text>
          <View style={styles.avatar} accessible accessibilityLabel={`Perfil de ${state.name}`}>
            <Text style={styles.avatarText}>{state.name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Progress')}
          accessibilityRole="button"
          accessibilityLabel="Ver tu progreso"
          style={({ pressed }) => [styles.rankCard, pressed && styles.pressed]}
        >
          <RankBadge rank={p.rank} level={p.level} size={76} />
          <View style={styles.rankInfo}>
            <Text style={styles.muted}>Rango actual</Text>
            <Text style={styles.rankName}>
              {p.rank.name} - {p.rank.subtitle}
            </Text>
            <Text style={styles.muted}>
              {formatNumber(p.xp)} / {formatNumber(p.nextLevelXp)} XP
            </Text>
            {!p.placementDone && (
              <Text style={styles.placement}>
                Colocación · sesión {p.placementCount} de {PLACEMENT_SESSIONS}
              </Text>
            )}
          </View>
        </Pressable>

        <View style={styles.barWrap}>
          <XpBar value={p.ratio} />
        </View>

        <View style={styles.stats}>
          <StatChip label="Racha" value={`${state.streak} ${state.streak === 1 ? 'día' : 'días'}`} />
          <StatChip label="PRs del mes" value={String(p.prsLast30)} />
        </View>

        <Pressable
          onPress={() => navigation.navigate('TrainingMenu')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText}>Iniciar Entrenamiento</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  logo: { ...font.title, color: colors.text },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.textDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontWeight: '700' },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rankInfo: { flex: 1, gap: 2 },
  rankName: { ...font.heading, color: colors.text },
  muted: { ...font.small, color: colors.textMuted },
  placement: { ...font.small, color: colors.amber, fontWeight: '700', marginTop: 2 },
  barWrap: { marginTop: spacing.md },
  stats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  cta: {
    marginTop: spacing.lg,
    backgroundColor: colors.orange,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  ctaText: { fontSize: 20, fontWeight: '800', color: colors.text },
  pressed: { opacity: 0.85 },
});
