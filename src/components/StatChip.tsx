import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

interface Props {
  label: string;
  value: string;
}

export function StatChip({ label, value }: Props) {
  return (
    <View style={styles.chip} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  label: { ...font.small, color: colors.textMuted },
  value: { ...font.stat, color: colors.text, marginTop: 2 },
});
