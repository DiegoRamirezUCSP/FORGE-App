import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ProgressProvider } from './src/state/ProgressProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ProgressProvider>
        <RootNavigator />
      </ProgressProvider>
    </SafeAreaProvider>
  );
}
