import { StyleSheet, Text, View } from 'react-native';
import { formatNumber } from '../format';
import { colors, font, radius, spacing } from '../theme';
import { XpEvent, XpEventKind } from '../types';

const accent: Record<XpEventKind, string> = {
  session: colors.orange,
  pr: colors.amber,
  streak: colors.red,
};

export function XpEventRow({ event }: { event: XpEvent }) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${event.title}, ${event.when}, más ${event.xp} XP`}
    >
      <View style={[styles.marker, { backgroundColor: accent[event.kind] }]} />
      <View style={styles.text}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.when}>{event.when}</Text>
      </View>
      <Text style={styles.xp}>+{formatNumber(event.xp)} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    overflow: 'hidden',
  },
  marker: { width: 4, alignSelf: 'stretch', marginRight: spacing.md, marginVertical: -spacing.md },
  text: { flex: 1 },
  title: { ...font.body, color: colors.text },
  when: { ...font.small, color: colors.textMuted, marginTop: 2 },
  xp: { fontSize: 18, fontWeight: '800', color: colors.text },
});
