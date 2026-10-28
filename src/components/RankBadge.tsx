import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { Rank } from '../types';

interface Props {
  rank: Rank;
  level: number;
  size?: number;
  /** `filled`: relleno del color del rango. `ring`: anillo sobre fondo oscuro. */
  variant?: 'filled' | 'ring';
}

export function RankBadge({ rank, level, size = 72, variant = 'filled' }: Props) {
  const ringWidth = Math.max(3, Math.round(size * 0.05));
  const filled = variant === 'filled';

  return (
    <View
      accessible
      accessibilityLabel={`Rango ${rank.name}, nivel ${level}`}
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ringWidth,
          borderColor: filled ? colors.textDim : rank.color,
          backgroundColor: filled ? rank.color : colors.bg,
        },
      ]}
    >
      <Text
        style={{
          color: filled ? rank.onColor : colors.text,
          fontSize: size * 0.24,
          fontWeight: '800',
        }}
      >
        {rank.name}
      </Text>
      <Text
        style={{
          color: filled ? rank.onColor : colors.textMuted,
          fontSize: size * 0.18,
          fontWeight: '600',
        }}
      >
        Lvl {level}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
