import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ProgressProvider } from './src/state/ProgressProvider';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ProgressProvider>
        <View style={styles.outer}>
          <View style={styles.inner}>
            <RootNavigator />
          </View>
        </View>
      </ProgressProvider>
    </SafeAreaProvider>
  );
}

// En web la app se limita a ancho de teléfono y queda centrada.
const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: colors.bg },
  inner: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' ? { maxWidth: 480, alignSelf: 'center' as const } : {}),
  },
});
