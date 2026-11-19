# Forge

App móvil de progreso para entrenamiento. Convierte cada sesión en una progresión visible con **XP, PRs, rachas y rangos**, de Hierro a Maestro.

Estado: **v0.3**, con backend en Supabase: cuentas, registro inicial y sincronización. Los pendientes están en [ROADMAP.md](./ROADMAP.md).

## Qué incluye

- **Acceso:** crear cuenta e iniciar sesión con correo y contraseña, o con Google.
- **Registro inicial:** nombre, unidades y PRs iniciales de press banca, sentadilla y peso muerto.
- **Inicio:** rango actual, barra de XP, racha y PRs del mes.
- **Tu Progreso:** anillo de rango, XP restante para el siguiente nivel y XP reciente.
- **Entrenamiento:** repetir el último, entrenamiento libre o rutinas guardadas.
- **Configuración:** ejercicios de una biblioteca, series y repeticiones, y guardado como rutina.
- **Sesión activa:** registro de peso y repeticiones por serie.
- **Resumen post-sesión:** XP desglosado, PRs nuevos, racha, subida de nivel o rango.
- **Rangos:** los 7 rangos y la ventana de colocación de 5 sesiones.
- **Perfil:** nombre, unidades kg/lb, estadísticas y PRs editables.
- **Administración:** las cuentas administradoras ven una lista de usuarios con sus datos de entrenamiento, en solo lectura y sin correos ni contraseñas. Ver [docs/ADMIN.md](./docs/ADMIN.md).
- **Historial:** lista de sesiones registradas.

Los datos de cada persona se guardan en Supabase, protegidos con Row Level Security. Los cambios se aplican primero en el teléfono y se sincronizan después; si no hay conexión quedan en cola y se envían al reconectar.

## Stack

- Expo (SDK 58), React Native y TypeScript
- React Navigation (pestañas y pila)
- AsyncStorage como caché local y cola de sincronización
- Supabase: Auth (correo y Google) y Postgres con Row Level Security

## Empezar

Requisitos: Node.js LTS y la app **Expo Go** en el teléfono.

```bash
npm install
npx expo install --fix
npx expo install @react-native-async-storage/async-storage @supabase/supabase-js react-native-url-polyfill expo-web-browser expo-linking
# crea .env a partir de .env.example (ver docs/SUPABASE_SETUP.md)
npx expo start -c
```

Escanea el QR con Expo Go. El teléfono y la PC deben estar en la misma red.

En Windows puedes hacer doble clic en `iniciar-forge.bat`: comprueba Node.js, crea el `.env`, instala las dependencias y ofrece un menú para abrir la app en el teléfono, en túnel o en la web.

Si no conecta:

| Situación | Comando |
|---|---|
| Misma Wi-Fi | `npx expo start --lan -c` |
| Redes distintas o aisladas | `npx expo start --tunnel -c` |
| Internet inestable | definir `EXPO_OFFLINE=1` y usar `--lan` |
| Probar en el navegador | `npx expo install react-dom react-native-web @expo/metro-runtime` y `npx expo start --web` |

La versión web sirve para pruebas: se limita a ancho de teléfono y usa los diálogos del navegador para alertas y confirmaciones.

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

## Backend

El esquema está en `supabase/schema.sql` y la guía paso a paso en [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md). Sin un archivo `.env` con las claves de Supabase, la app muestra una pantalla de configuración pendiente.

## Estructura

```
App.tsx
src/
  theme.ts              colores, espaciado y tipografía
  types.ts              tipos del dominio
  format.ts             números y conversión kg/lb
  auth/                 AuthProvider: correo, Google y sesión
  lib/                  cliente de Supabase
  domain/               reglas puras: xp, levels, session, dates
  data/                 ranks, exercises, demo, remote (consultas y escrituras a Supabase)
  state/                ProgressProvider (estado, caché local y cola de sincronización) y selectors
  components/           RankBadge, XpBar, StatChip, XpEventRow, Button, Stepper, ExercisePicker
  screens/              Home, Progress, RankDetails, TrainingMenu, WorkoutSetup,
                        ActiveSession, SessionSummary, History, Profile
  navigation/           pestañas y pila de Inicio
  ui/                   dialog: alertas y confirmaciones multiplataforma
```

## Notas para desarrollar

- La lógica de XP, nivel, racha y rango está aislada en `src/domain/` y no depende de la UI. Así puede pasar a una Edge Function sin tocar las pantallas.
- Nunca subas `.env` a Git. La clave publishable es pública por diseño, pero la clave secret no debe aparecer en la app.
- Los pesos se guardan siempre en kg; la unidad elegida solo cambia lo que se muestra.
- Los ids de ejercicio en `src/data/exercises.ts` deben mantenerse estables: el XP relativo y los PRs dependen de ellos.

## Licencia

Por definir.
