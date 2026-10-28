import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  /** Progreso entre 0 y 1. */
  value: number;
  height?: number;
}

export function XpBar({ value, height = 10 }: Props) {
  const clamped = Math.min(1, Math.max(0, value));
  const progress = useRef(new Animated.Value(0)).current;

  // Momento único de animación: la barra se "calienta" al entrar.
  useEffect(() => {
    Animated.timing(progress, {
      toValue: clamped,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped, progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View style={[styles.fill, { width, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.orange,
  },
});
