import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

export function ConfigMissingScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Falta configurar Supabase</Text>
      <Text style={styles.text}>
        Crea un archivo .env en la raíz del proyecto con estas dos variables y reinicia con npx expo start -c.
      </Text>
      <View style={styles.code}>
        <Text style={styles.mono}>EXPO_PUBLIC_SUPABASE_URL=…</Text>
        <Text style={styles.mono}>EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=…</Text>
      </View>
      <Text style={styles.text}>Los pasos completos están en docs/SUPABASE_SETUP.md.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  title: { ...font.heading, color: colors.text },
  text: { ...font.body, color: colors.textMuted },
  code: {
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  mono: { fontFamily: 'monospace', fontSize: 13, color: colors.amber },
});
