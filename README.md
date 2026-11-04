# Forge

App móvil de progreso para entrenamiento. Convierte cada sesión en una progresión visible con **XP, PRs, rachas y rangos**, de Hierro a Maestro.

Estado: **v0.2**, frontend con datos locales y sin backend. Los pendientes están en [ROADMAP.md](./ROADMAP.md).

## Qué incluye

- **Inicio:** rango actual, barra de XP, racha y PRs del mes.
- **Tu Progreso:** anillo de rango, XP restante para el siguiente nivel y XP reciente.
- **Entrenamiento:** repetir el último, entrenamiento libre o rutinas guardadas.
- **Configuración:** ejercicios de una biblioteca, series y repeticiones, y guardado como rutina.
- **Sesión activa:** registro de peso y repeticiones por serie.
- **Resumen post-sesión:** XP desglosado, PRs nuevos, racha, subida de nivel o rango.
- **Rangos:** los 7 rangos y la ventana de colocación de 5 sesiones.
- **Perfil:** nombre, unidades kg/lb, estadísticas y PRs editables.
- **Historial:** lista de sesiones registradas.

Los datos se guardan en el dispositivo con AsyncStorage. La primera vez la app arranca con datos de ejemplo; desde Perfil se pueden borrar o volver a cargar.

## Stack

- Expo (SDK 58), React Native y TypeScript
- React Navigation (pestañas y pila)
- AsyncStorage para persistencia local
- Backend previsto: Supabase (Auth + Postgres)

## Empezar

Requisitos: Node.js LTS y la app **Expo Go** en el teléfono.

```bash
npm install
npx expo install --fix
npx expo install @react-native-async-storage/async-storage
npx expo start -c
```

Escanea el QR con Expo Go. El teléfono y la PC deben estar en la misma red.

Si no conecta:

| Situación | Comando |
|---|---|
| Misma Wi-Fi | `npx expo start --lan -c` |
| Redes distintas o aisladas | `npx expo start --tunnel -c` |
| Internet inestable | definir `EXPO_OFFLINE=1` y usar `--lan` |
| Probar en el navegador | `npx expo install react-dom react-native-web @expo/metro-runtime` y `npx expo start --web` |

La versión web sirve para pruebas. Hoy `Alert.alert` no funciona en web, así que algunas confirmaciones no responden ahí (ver ROADMAP).

Revisar tipos:

```bash
npm run typecheck
```

## Reglas de progreso

Las reglas viven en `src/domain/` y `src/data/ranks.ts`, y son ajustables.

| Regla | Valor actual |
|---|---|
| XP base de sesión | 50 al igualar tu volumen promedio de las últimas 5 sesiones; entre 25 y 100 según el volumen relativo |
| Bono de PR | +150 XP por ejercicio, comparando 1RM estimado (Epley). El primer registro de un ejercicio solo queda como referencia |
| Racha | Se sostiene con hasta 2 días de descanso entre sesiones |
| Bono de racha | +80 XP cada 7 días de racha |
| Nivel | XP total para el nivel L = 25 · L · (L − 1) |
| Colocación | Las primeras 5 sesiones muestran Hierro; después el rango sale del nivel |

Rangos por nivel mínimo:

| Rango | Nivel |
|---|---|
| Hierro / Metal Crudo | 1 |
| Bronce / Al Rojo Vivo | 3 |
| Plata / Primer Pliegue | 6 |
| Oro / Mil Capas | 9 |
| Platino / Templado | 14 |
| Diamante / Afilado | 20 |
| Maestro / Hoja de Damasco | 28 |

## Estructura

```
App.tsx
src/
  theme.ts              colores, espaciado y tipografía
  types.ts              tipos del dominio
  format.ts             números y conversión kg/lb
  domain/               reglas puras: xp, levels, session, dates
  data/                 ranks, exercises, demo
  state/                ProgressProvider (contexto + AsyncStorage) y selectors
  components/           RankBadge, XpBar, StatChip, XpEventRow, Button, Stepper, ExercisePicker
  screens/              Home, Progress, RankDetails, TrainingMenu, WorkoutSetup,
                        ActiveSession, SessionSummary, History, Profile
  navigation/           pestañas y pila de Inicio
```

## Notas para desarrollar

- La lógica de XP, nivel, racha y rango está aislada en `src/domain/` y no depende de la UI. Así puede pasar a una Edge Function sin tocar las pantallas.
- Los pesos se guardan siempre en kg; la unidad elegida solo cambia lo que se muestra.
- Los ids de ejercicio en `src/data/exercises.ts` deben mantenerse estables: el XP relativo y los PRs dependen de ellos.

## Licencia

Por definir.
