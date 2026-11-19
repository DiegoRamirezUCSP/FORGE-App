import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { LoadingView } from '../components/LoadingView';
import { getRank, displayRankId } from '../data/ranks';
import { fetchAdminUsers } from '../data/admin';
import { levelFromXp } from '../domain/levels';
import { formatNumber } from '../format';
import type { ProfileStackParams } from '../navigation/types';
import { colors, font, radius, spacing } from '../theme';
import type { AdminUser } from '../types';

type Props = NativeStackScreenProps<ProfileStackParams, 'AdminUsers'>;

export function AdminUsersScreen({ navigation }: Props) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      setUsers(await fetchAdminUsers());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (error && !users) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>No se pudieron cargar los usuarios</Text>
        <Text style={styles.sub}>
          Revisa tu conexión y que hayas ejecutado supabase/admin.sql en Supabase.
        </Text>
        <Button label="Reintentar" onPress={() => void load()} />
      </View>
    );
  }
  if (!users) return <LoadingView message="Cargando usuarios…" />;

  const totalSessions = users.reduce((t, u) => t + u.sessionsCount, 0);

  return (
    <FlatList
      style={styles.root}
      contentContainerStyle={styles.content}
      data={users}
      keyExtractor={(u) => u.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.orange} />}
      ListHeaderComponent={
        <View style={styles.summary}>
          <Text style={styles.sub}>
            {users.length} {users.length === 1 ? 'persona' : 'personas'} · {formatNumber(totalSessions)} sesiones
          </Text>
          <Text style={styles.sub}>Solo datos de entrenamiento. No se muestran correos ni contraseñas.</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.sub}>Todavía no hay usuarios.</Text>}
      renderItem={({ item }) => {
        const level = levelFromXp(item.totalXp);
        const rank = getRank(displayRankId(level, item.sessionsCount));
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${rank.name}, nivel ${level}`}
            onPress={() => navigation.navigate('AdminUserDetail', { user: item })}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.swatch, { backgroundColor: rank.color }]}>
              <Text style={[styles.tier, { color: rank.onColor }]}>{rank.tier}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>
                {rank.name} · Nivel {level} · {formatNumber(item.totalXp)} XP
              </Text>
              <Text style={styles.sub}>
                Racha {item.streak} · {item.sessionsCount} sesiones
                {item.onboarded ? '' : ' · sin registro inicial'}
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.sm + 2, paddingBottom: spacing.xl },
  center: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  title: { ...font.heading, color: colors.text, textAlign: 'center' },
  summary: { gap: 2, marginBottom: spacing.sm },
  sub: { ...font.small, color: colors.textMuted },
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
});
