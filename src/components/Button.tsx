import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  flex?: boolean;
}

const DANGER = '#FF6A5C';

export function Button({ label, onPress, variant = 'primary', disabled = false, flex = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        flex && { flex: 1 },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, variant === 'danger' && { color: DANGER }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: { backgroundColor: colors.orange },
  ghost: { borderWidth: 1, borderColor: colors.textDim },
  danger: { borderWidth: 1, borderColor: DANGER },
  text: { fontSize: 17, fontWeight: '800', color: colors.text },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
});
