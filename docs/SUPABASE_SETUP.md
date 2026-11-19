# Configurar Supabase para Forge

Hace falta una sola vez por proyecto. Los nombres de los menús de Supabase y Google pueden variar un poco; si algo no coincide, busca la opción equivalente.

## 1. Crear el proyecto

1. Entra a https://supabase.com y crea una cuenta.
2. **New project**: ponle un nombre (por ejemplo `forge`), elige una contraseña de base de datos (guárdala) y la región más cercana a tus usuarios.
3. Espera a que termine de crearse.

## 2. Crear las tablas

1. En el panel, abre **SQL Editor → New query**.
2. Pega el contenido de `supabase/schema.sql` y pulsa **Run**.
3. En **Table Editor** deben aparecer `profiles`, `personal_records`, `sessions`, `xp_events` y `routines`, todas con RLS activado.

## 3. Conectar la app

1. En el panel, abre el diálogo **Connect** o **Settings → API Keys** y copia:
   - **Project URL**
   - **Publishable key** (empieza con `sb_publishable_`). Si no existe, crea una con **Create new API Keys**.
2. En la raíz del proyecto, copia `.env.example` como `.env` y pega los dos valores.
3. Asegúrate de que `.env` está en `.gitignore`. Nunca uses la clave **secret** dentro de la app.
4. Reinicia Expo limpiando la caché: `npx expo start -c`.

## 4. Correo y contraseña

En **Authentication → Providers → Email**:

- Para desarrollar, desactiva **Confirm email**: así las cuentas nuevas entran al instante.
- Si lo dejas activo, la persona recibe un correo, lo confirma y luego inicia sesión en la app. Antes de publicar, configura el enlace de confirmación para que vuelva a la app.

## 5. Direcciones de redirección

En **Authentication → URL Configuration → Redirect URLs**, agrega:

| Entrada | Para qué |
|---|---|
| `exp://**` | Expo Go (la IP cambia según la red) |
| `http://localhost:8081` | Versión web en desarrollo |
| `forge://**` | App instalada (cuando exista el build) |

`**` es cómodo en desarrollo. Antes de publicar, reemplázalo por las direcciones exactas.

## 6. Google

1. En Google Cloud Console, crea un proyecto y configura la **pantalla de consentimiento de OAuth**.
2. En **Credentials → Create credentials → OAuth client ID**, elige **Web application**.
3. En **Authorized redirect URIs**, agrega `https://TU-REF.supabase.co/auth/v1/callback`. `TU-REF` es el identificador de tu proyecto, visible en la Project URL.
4. Copia el **Client ID** y el **Client secret**.
5. En Supabase, abre **Authentication → Providers → Google**, actívalo y pega ambos valores.

## 7. Probar

1. `npx expo start -c` y abre la app.
2. Crea una cuenta con correo, completa el onboarding y registra una sesión.
3. En **Table Editor** comprueba que aparecen tus filas.
4. Cierra sesión y entra con Google.

## 8. Administrador y usuarios de prueba (opcional)

Ver [docs/ADMIN.md](./ADMIN.md).

## Seguridad: qué protege y qué no

- RLS impide que una persona lea o escriba los datos de otra.
- Como el XP se calcula en la app, una persona podría alterar sus propios números llamando a la API. Si eso importa (rankings públicos, competencias), el cálculo debe pasar a una Edge Function.
- La clave publishable es pública por diseño; la clave secret no debe aparecer en la app ni en Git.

## Problemas comunes

| Síntoma | Causa probable |
|---|---|
| "Falta configurar Supabase" | `.env` ausente o Expo no se reinició con `-c` |
| Google vuelve a la app sin sesión | La dirección de redirección no está en la lista (paso 5) |
| Google: `redirect_uri_mismatch` | El URI del paso 6.3 no coincide exactamente |
| "Confirma tu correo" | Confirm email está activo (paso 4) |
| Datos que no aparecen en Supabase | Sin conexión: quedan en cola y se envían al reconectar |
