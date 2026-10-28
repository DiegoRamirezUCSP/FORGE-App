import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../theme';

interface Props {
  title: string;
  message: string;
}

export function PlaceholderScreen({ title, message }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: { ...font.heading, color: colors.text },
  message: { ...font.body, color: colors.textMuted, textAlign: 'center' },
});
