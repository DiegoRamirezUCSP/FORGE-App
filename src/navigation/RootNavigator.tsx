import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActiveSessionScreen } from '../screens/ActiveSessionScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { RankDetailsScreen } from '../screens/RankDetailsScreen';
import { SessionSummaryScreen } from '../screens/SessionSummaryScreen';
import { TrainingMenuScreen } from '../screens/TrainingMenuScreen';
import { WorkoutSetupScreen } from '../screens/WorkoutSetupScreen';
import { colors } from '../theme';
import type { HomeStackParams, TabParams } from './types';

const Tab = createBottomTabNavigator<TabParams>();
const HomeStack = createNativeStackNavigator<HomeStackParams>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    border: colors.border,
    text: colors.text,
    primary: colors.orange,
  },
};

// Todo el flujo de entrenamiento vive dentro de la pestaña Inicio.
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Tu Progreso' }} />
      <HomeStack.Screen name="RankDetails" component={RankDetailsScreen} options={{ title: 'Rangos' }} />
      <HomeStack.Screen name="TrainingMenu" component={TrainingMenuScreen} options={{ title: 'Entrenamiento' }} />
      <HomeStack.Screen name="WorkoutSetup" component={WorkoutSetupScreen} options={{ title: 'Configurar entrenamiento' }} />
      <HomeStack.Screen
        name="ActiveSession"
        component={ActiveSessionScreen}
        options={{ title: 'En sesión', headerBackVisible: false, gestureEnabled: false }}
      />
      <HomeStack.Screen
        name="SessionSummary"
        component={SessionSummaryScreen}
        options={{ title: 'Resumen', headerBackVisible: false, gestureEnabled: false }}
      />
    </HomeStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.orange,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="HistoryTab"
          component={HistoryScreen}
          options={{
            title: 'Historial',
            tabBarIcon: ({ color, size }) => <Ionicons name="time" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
