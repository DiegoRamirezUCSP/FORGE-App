import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
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

// Progreso vive dentro de la pestaña Inicio para conservar la barra inferior.
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
    </HomeStack.Navigator>
  );
}

const HistoryScreen = () => (
  <PlaceholderScreen
    title="Historial"
    message="Aquí verás tus sesiones. Completa tu primer entrenamiento para empezar."
  />
);

const ProfileScreen = () => (
  <PlaceholderScreen title="Perfil" message="Tus datos y ajustes estarán aquí." />
);

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
