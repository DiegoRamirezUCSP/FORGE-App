import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../theme';

export function LoadingView({ message }: { message?: string }) {
  return (
    <View style={styles.root} accessible accessibilityLabel={message ?? 'Cargando'}>
      <ActivityIndicator size="large" color={colors.orange} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  text: { ...font.body, color: colors.textMuted },
});
