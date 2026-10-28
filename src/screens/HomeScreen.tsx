import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RankBadge } from '../components/RankBadge';
import { StatChip } from '../components/StatChip';
import { XpBar } from '../components/XpBar';
import { getRank } from '../data/ranks';
import { mockProgress } from '../data/mock';
import { formatNumber } from '../format';
import type { HomeStackParams } from '../navigation/types';
import { colors, font, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<HomeStackParams, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const p = mockProgress;
  const rank = getRank(p.rankId);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>FORGE</Text>
          <View style={styles.avatar} accessible accessibilityLabel={`Perfil de ${p.name}`}>
            <Text style={styles.avatarText}>{p.name.charAt(0)}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Progress')}
          accessibilityRole="button"
          accessibilityLabel="Ver tu progreso"
          style={({ pressed }) => [styles.rankCard, pressed && styles.pressed]}
        >
          <RankBadge rank={rank} level={p.level} size={76} />
          <View style={styles.rankInfo}>
            <Text style={styles.muted}>Rango actual</Text>
            <Text style={styles.rankName}>
              {rank.name} - {rank.subtitle}
            </Text>
            <Text style={styles.muted}>
              {formatNumber(p.xp)} / {formatNumber(p.xpForNextLevel)} XP
            </Text>
          </View>
        </Pressable>

        <View style={styles.barWrap}>
          <XpBar value={p.xp / p.xpForNextLevel} />
        </View>

        <View style={styles.stats}>
          <StatChip label="Racha" value={`${p.streakDays} días`} />
          <StatChip label="PRs del mes" value={String(p.prsThisMonth)} />
        </View>

        <Pressable
          onPress={() =>
            Alert.alert('Próximamente', 'El registro de sesión llega en la siguiente versión.')
          }
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
