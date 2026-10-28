# Forge (frontend temprano)

Expo + React Native + TypeScript. Dos pantallas con datos simulados:
**Inicio** y **Tu Progreso** (se abre tocando la tarjeta de rango).

## Arrancar

```bash
npm install
npx expo install --fix   # alinea versiones con tu SDK de Expo
npx expo start           # escanea el QR con Expo Go, o pulsa a / i
```

## Estructura

```
App.tsx
src/
  theme.ts            colores, espaciado, tipografía (paleta del deck)
  types.ts            Rank, XpEvent, UserProgress
  data/ranks.ts       los 7 rangos, Hierro -> Maestro
  data/mock.ts        progreso simulado (reemplazar por Supabase)
  components/         RankBadge, XpBar, StatChip, XpEventRow
  screens/            HomeScreen, ProgressScreen, PlaceholderScreen
  navigation/         tabs (Inicio, Historial, Perfil) + stack de Inicio
```

## Siguiente paso natural

- Onboarding de PRs iniciales y registro de sesión.
- Mover el cálculo de XP/nivel/racha a `src/domain/` (Opción A del deck),
  de modo que se pueda cambiar a una Edge Function (Opción B) sin tocar la UI.
