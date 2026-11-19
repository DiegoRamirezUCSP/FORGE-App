import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import { LoadingView } from './src/components/LoadingView';
import { isSupabaseConfigured } from './src/lib/supabase';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { ConfigMissingScreen } from './src/screens/ConfigMissingScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProgressProvider, useForge } from './src/state/ProgressProvider';
import { colors } from './src/theme';

function Main() {
  const { state } = useForge();
  return state.onboarded ? <RootNavigator /> : <OnboardingScreen />;
}

// Sin sesión -> acceso. Con sesión -> datos de la persona; si no terminó el registro, onboarding.
function Gate() {
  const { session, loading } = useAuth();
  if (!isSupabaseConfigured) return <ConfigMissingScreen />;
  if (loading) return <LoadingView />;
  if (!session) return <AuthScreen />;
  return (
    <ProgressProvider key={session.user.id} userId={session.user.id}>
      <Main />
    </ProgressProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <View style={styles.outer}>
          <View style={styles.inner}>
            <Gate />
          </View>
        </View>
      </AuthProvider>
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
