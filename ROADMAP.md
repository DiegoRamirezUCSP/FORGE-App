# Forge · Roadmap y pendientes

App móvil de progreso para entrenamiento basada en XP, PRs, rachas y rangos.
Stack: Expo (SDK 58) + React Native + TypeScript. Sin backend todavía.

Última actualización: v0.2

## Estado actual (v0.2)

Hecho:

- [x] Inicio: tarjeta de rango, barra de XP, racha y PRs del mes.
- [x] Tu Progreso: anillo de rango, XP restante y XP reciente.
- [x] Menú de entrenamiento: repetir último, entrenamiento libre y rutinas guardadas.
- [x] Configuración del entrenamiento: biblioteca de 16 ejercicios, series y repeticiones, guardar como rutina.
- [x] Sesión activa: registro de peso y repeticiones por serie.
- [x] Resumen post-sesión: XP desglosado, PRs, racha, subida de nivel o rango.
- [x] Detalles de rango: los 7 rangos y la ventana de colocación.
- [x] Perfil: nombre, unidades kg/lb, estadísticas y PRs editables.
- [x] Historial de sesiones.
- [x] Persistencia local con AsyncStorage.
- [x] Lógica de XP, nivel, racha y rango aislada en `src/domain/`.

Sin verificar:

- [ ] Typecheck (`npm run typecheck`) sin errores.
- [ ] Flujo completo probado en un dispositivo real (Android e iOS).

## Cómo ejecutar

```bash
npm install
npx expo install --fix
npx expo install @react-native-async-storage/async-storage
npx expo start -c
```

Si el teléfono no conecta:

- Mismo Wi-Fi para PC y teléfono: `npx expo start --lan -c`.
- Redes distintas o aisladas: `npx expo start --tunnel -c` (requiere `@expo/ngrok`).
- Sin internet estable: definir `EXPO_OFFLINE=1` y usar `--lan`.
- Probar en navegador: `npx expo install react-dom react-native-web @expo/metro-runtime` y `npx expo start --web`.

## Pendientes

### P0 · Correcciones antes de seguir

- [ ] Reemplazar `Alert.alert` por un helper multiplataforma. En web `Alert.alert` no hace nada, así que no funcionan las validaciones ni las confirmaciones (descartar sesión, eliminar rutina, borrar datos).
- [ ] Ejecutar `npm run typecheck` y corregir lo que aparezca.
- [ ] Probar el flujo completo: rutina → sesión → resumen → historial → perfil.
- [ ] Confirmar que se eliminaron `src/data/mock.ts` y `src/screens/PlaceholderScreen.tsx`.

### P1 · Producto

- [ ] Onboarding en la primera apertura: registrar PRs iniciales de press banca, sentadilla y peso muerto (hoy solo se editan desde Perfil).
- [ ] Animación breve al subir de rango.
- [ ] Detalle de una sesión pasada desde el Historial.
- [ ] Editar o eliminar una sesión registrada (recalcular XP, nivel y racha).
- [ ] Temporizador de descanso entre series.
- [ ] Sugerencia de peso a partir del último registro.
- [ ] Ejercicios personalizados además de la biblioteca base.
- [ ] Mostrar el progreso por ejercicio (evolución del PR).

### P1 · Backend (Supabase)

- [ ] Crear proyecto Supabase y definir esquema: usuarios, ejercicios, sesiones, series, PRs, eventos de XP, rutinas.
- [ ] Autenticación (Auth) y pantalla de acceso.
- [ ] Row Level Security: cada usuario solo ve sus datos.
- [ ] Migrar la persistencia local a Postgres, manteniendo AsyncStorage como caché sin conexión.
- [ ] Decidir dónde vive el cálculo de progreso (ver decisiones abiertas).

### P2 · Calidad

- [ ] Pruebas unitarias de `src/domain/` (XP, niveles, racha, detección de PRs).
- [ ] ESLint y Prettier.
- [ ] CI que ejecute typecheck y pruebas.
- [ ] Revisión de accesibilidad (lector de pantalla, tamaños de texto).
- [ ] Manejo de errores y estados de carga cuando exista backend.

### P2 · Diseño y entrega

- [ ] Ícono de la app y pantalla de inicio (splash).
- [ ] Definir tipografía propia.
- [ ] Capturas reales de la app para la presentación.
- [ ] Layout adaptado para pantallas anchas si se mantiene la versión web.

## Decisiones abiertas

| Tema | Estado actual | Qué falta decidir |
|---|---|---|
| Dónde se calcula el XP | En el cliente (Opción A del deck) | Pasar a Edge Function (Opción B) para reducir la manipulación del progreso |
| Fórmula de XP base | 50 al igualar el promedio propio, entre 25 y 100 | Validar con datos reales si el rango es el adecuado |
| Bono de PR | +150 XP por ejercicio, sin bono en el primer registro | Si los PRs por repeticiones distintas cuentan por separado |
| Racha | Hasta 2 días de descanso, bono de +80 XP cada 7 días | Regla definitiva y qué pasa con pausas largas o lesiones |
| Niveles | XP total para el nivel L = 25 · L · (L − 1) | Curva final de progresión |
| Umbrales de rango | Hierro 1, Bronce 3, Plata 6, Oro 9, Platino 14, Diamante 20, Maestro 28 | Si cada rango debe exigir también un criterio de fuerza |
| Colocación | Primeras 5 sesiones muestran Hierro | Si la colocación debe asignar un rango inicial más alto según el rendimiento |
| Plataformas | Android e iOS; web solo para pruebas | Si la web será un objetivo real |

## Mapa del código

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
  navigation/           tabs y pila de Inicio
```

Las reglas de negocio están en `src/domain/xp.ts`, `src/domain/levels.ts` y `src/data/ranks.ts`.

## Notas

- Los pesos se guardan siempre en kg; la unidad elegida solo afecta lo que se muestra.
- Los ids de ejercicio (`src/data/exercises.ts`) deben mantenerse estables: el XP relativo y los PRs dependen de ellos.
- La app arranca con datos de ejemplo la primera vez. En Perfil se pueden borrar o volver a cargar.
