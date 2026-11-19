# Cuenta administradora y usuarios de prueba

## Qué puede y qué no puede ver

| Dato | Administradora |
|---|---|
| Nombre, unidades, XP, nivel, racha, PRs, sesiones, rutinas | Lo ve (solo lectura) |
| Contraseñas | No: Supabase las guarda cifradas en el esquema `auth`, fuera del alcance de la app |
| Correos | No aparecen en el panel de la app |
| Modificar datos de otras personas | No: solo tiene permisos de lectura |

Quien es dueño del proyecto de Supabase sí ve los correos en **Authentication → Users**. Eso es independiente de la app.

## 1. Activar la administración

1. En **SQL Editor**, ejecuta `supabase/admin.sql` (después de `schema.sql`).
2. Eso crea la tabla `admins`, los permisos de lectura y la vista que usa el panel.

La app no puede escribir en `admins`: nadie se vuelve administrador desde la app.

## 2. Crear la cuenta administradora

### Opción A: con el script (también crea 4 usuarios de prueba)

1. En Supabase abre **Settings → API Keys** y copia la clave **secret** (`sb_secret_...`).
2. En cmd, desde la raíz del proyecto, con Node 20.6 o superior:

   ```cmd
   set SUPABASE_SECRET_KEY=sb_secret_...
   set ADMIN_EMAIL=admin@ejemplo.com
   set ADMIN_PASSWORD=una-contraseña-larga
   set DEMO_PASSWORD=otra-contraseña
   node --env-file=.env scripts/seed-demo-users.mjs
   ```

   Evita los caracteres `& ^ % " < >` en las contraseñas, porque cmd los interpreta.
3. Cierra la ventana al terminar, para descartar las claves escritas con `set`.

El script se puede repetir: no duplica nada y no cambia la contraseña de las cuentas que ya existen. Los usuarios de prueba son `demo1@example.com` a `demo4@example.com`, con 5, 12, 24 y 40 sesiones.

### Opción B: convertir una cuenta que ya existe

1. Registra la cuenta desde la app.
2. En **SQL Editor** ejecuta, cambiando el correo:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@tu-correo.com'
   on conflict do nothing;
   ```

Para quitar el permiso:

```sql
delete from public.admins
where user_id = (select id from auth.users where email = 'admin@tu-correo.com');
```

## 3. Usar el panel

Inicia sesión con la cuenta administradora. En **Perfil** aparece el botón **Panel de administración**: lista de usuarios con rango, nivel, XP, racha y sesiones. Al tocar uno ves sus PRs y sus últimas sesiones. Se actualiza deslizando hacia abajo.

## Seguridad

- La clave **secret** se salta toda la seguridad. No va en `.env`, ni en Git, ni en la app.
- Si la clave secret se expone, regenérala en **Settings → API Keys**.
- Las contraseñas de las cuentas de prueba y la administradora deben ser distintas de cualquier contraseña real tuya.
- Si la app llega a tener usuarios reales, informa en la política de privacidad que el equipo administrador puede ver sus datos de entrenamiento. Conviene revisar con un abogado qué debe decir según tu país.
