import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LoadingView } from '../components/LoadingView';
import { RankBadge } from '../components/RankBadge';
import { StatChip } from '../components/StatChip';
import { getRank, displayRankId } from '../data/ranks';
import { AdminUserDetail, fetchAdminUserDetail } from '../data/admin';
import { getExercise } from '../data/exercises';
import { relativeDay } from '../domain/dates';
import { levelFromXp } from '../domain/levels';
import { formatNumber, formatVolume, formatWeight } from '../format';
import type { ProfileStackParams } from '../navigation/types';
import { colors, font, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<ProfileStackParams, 'AdminUserDetail'>;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function AdminUserDetailScreen({ route }: Props) {
  const { user } = route.params;
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchAdminUserDetail(user.id).then(
      (d) => {
        if (alive) setDetail(d);
      },
      () => {
        if (alive) setError(true);
      },
    );
    return () => {
      alive = false;
    };
  }, [user.id]);

  const level = levelFromXp(user.totalXp);
  const rank = getRank(displayRankId(level, user.sessionsCount));

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <RankBadge rank={rank} level={level} size={110} variant="ring" />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.sub}>
          {rank.name} - {rank.subtitle} · Miembro desde {formatDate(user.createdAt)}
        </Text>
      </View>

      <View style={styles.stats}>
        <StatChip label="XP total" value={formatNumber(user.totalXp)} />
        <StatChip label="Racha" value={`${user.streak} (máx. ${user.bestStreak})`} />
        <StatChip label="Sesiones" value={String(user.sessionsCount)} />
      </View>

      {!detail && !error && <LoadingView />}
      {error && <Text style={styles.sub}>No se pudo cargar el detalle.</Text>}

      {detail && (
        <>
          <Text style={styles.section}>PRs</Text>
          {detail.prs.length === 0 && <Text style={styles.sub}>Sin PRs registrados.</Text>}
          <View style={styles.list}>
            {detail.prs.map(({ exerciseId, pr }) => (
              <View key={exerciseId} style={styles.row}>
                <Text style={styles.rowName}>{getExercise(exerciseId)?.name ?? exerciseId}</Text>
                <Text style={styles.rowValue}>
                  {formatWeight(pr.weightKg, 'kg')} × {pr.reps}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>Últimas sesiones</Text>
          {detail.sessions.length === 0 && <Text style={styles.sub}>Sin sesiones registradas.</Text>}
          <View style={styles.list}>
            {detail.sessions.map((s) => (
              <View key={s.id} style={styles.row}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.rowName}>{s.name}</Text>
                  <Text style={styles.sub}>
                    {relativeDay(s.date)} · {s.exercises.length} ejercicios · {formatVolume(s.volumeKg, 'kg')}
                  </Text>
                </View>
                <Text style={styles.rowValue}>+{s.xp} XP</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  name: { ...font.title, color: colors.text },
  sub: { ...font.small, color: colors.textMuted, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: spacing.sm },
  section: { ...font.heading, color: colors.text, marginTop: spacing.md },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowName: { ...font.body, color: colors.text, fontWeight: '700' },
  rowValue: { ...font.body, color: colors.textMuted, fontWeight: '700' },
});
