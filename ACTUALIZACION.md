# Forge v0.2: cómo integrar

1. Descomprime este zip en la raíz del proyecto (D:\FORGE\forge) y acepta reemplazar archivos.
2. Elimina estos archivos que ya no se usan:
   - src\data\mock.ts
   - src\screens\PlaceholderScreen.tsx
3. Instala la única dependencia nueva:

   npx expo install @react-native-async-storage/async-storage

4. Arranca limpiando caché:

   npx expo start -c

## Reglas de negocio (src/domain/xp.ts, ajustables)
- XP base: 50 al igualar tu volumen promedio (últimas 5 sesiones), entre 25 y 100 según el volumen relativo.
- PR: +150 XP por ejercicio. Se compara por 1RM estimado (Epley). El primer registro de un ejercicio solo queda como referencia.
- Racha: se sostiene con hasta 2 días de descanso entre sesiones. Bono de +80 XP cada 7 días de racha.
- Nivel: XP total para el nivel L = 25 · L · (L-1) (src/domain/levels.ts).
- Rangos por nivel: Hierro 1, Bronce 3, Plata 6, Oro 9, Platino 14, Diamante 20, Maestro 28 (src/data/ranks.ts).
- Colocación: las primeras 5 sesiones muestran Hierro; luego el rango sale del nivel.
