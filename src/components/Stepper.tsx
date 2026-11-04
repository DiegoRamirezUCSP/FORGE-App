import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export function Stepper({ label, value, onChange, min = 1, max = 20 }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.ctrl}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Menos ${label}`}
          onPress={() => onChange(Math.max(min, value - 1))}
          style={styles.btn}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Más ${label}`}
          onPress={() => onChange(Math.min(max, value + 1))}
          style={styles.btn}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: spacing.xs },
  label: { ...font.small, color: colors.textMuted },
  ctrl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  btn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 24, fontWeight: '700', color: colors.orange },
  value: { fontSize: 20, fontWeight: '800', color: colors.text },
});
