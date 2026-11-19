// Crea una cuenta administradora y 4 usuarios de prueba con datos de ejemplo.
//
// Uso (desde la raíz del proyecto, Node 20.6 o superior):
//   set SUPABASE_SECRET_KEY=sb_secret_...
//   set ADMIN_EMAIL=admin@ejemplo.com
//   set ADMIN_PASSWORD=...
//   set DEMO_PASSWORD=...
//   node --env-file=.env scripts/seed-demo-users.mjs
//
// La clave SECRET se salta toda la seguridad: no la pongas en .env, no la subas
// a Git y no la uses dentro de la app. Cierra la ventana al terminar.
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const demoPassword = process.env.DEMO_PASSWORD;

const missing = [
  ['URL de Supabase (EXPO_PUBLIC_SUPABASE_URL en .env)', url],
  ['SUPABASE_SECRET_KEY', secret],
  ['ADMIN_EMAIL', adminEmail],
  ['ADMIN_PASSWORD', adminPassword],
  ['DEMO_PASSWORD', demoPassword],
].filter(([, v]) => !v);

if (missing.length > 0) {
  console.error('Faltan datos:\n- ' + missing.map(([n]) => n).join('\n- '));
  process.exit(1);
}
if (secret.startsWith('sb_publishable_')) {
  console.error('SUPABASE_SECRET_KEY es la clave publishable. Usa la clave secret del panel de Supabase.');
  process.exit(1);
}

const admin = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });

const must = (res, where) => {
  if (res.error) throw new Error(`${where}: ${res.error.message}`);
  return res.data;
};

async function ensureUser(email, password, fullName) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (!error) return { id: data.user.id, created: true };

  // Si ya existe, se reutiliza (su contraseña no se cambia).
  const list = must(await admin.auth.admin.listUsers({ page: 1, perPage: 1000 }), 'listUsers');
  const found = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!found) throw new Error(`createUser ${email}: ${error.message}`);
  return { id: found.id, created: false };
}

// ---------- Datos de ejemplo ----------
const r25 = (x) => Math.round(x / 2.5) * 2.5;
const epley = (w, r) => (r <= 1 ? w : w * (1 + r / 30));
const NAMES = { press_banca: 'Press banca', sentadilla: 'Sentadilla', peso_muerto: 'Peso muerto' };
const TEMPLATES = [
  { name: 'Empuje', main: 'press_banca', acc: 'press_militar', accFactor: 0.55 },
  { name: 'Tirón', main: 'peso_muerto', acc: 'remo_barra', accFactor: 0.5 },
  { name: 'Piernas', main: 'sentadilla', acc: 'prensa', accFactor: 1.4 },
];

const DEMO = [
  { email: 'demo1@example.com', name: 'Valentina', unit: 'kg', sessions: 24, lastDaysAgo: 1, streak: 9, best: 12, base: { press_banca: 60, sentadilla: 90, peso_muerto: 110 } },
  { email: 'demo2@example.com', name: 'Mateo', unit: 'kg', sessions: 12, lastDaysAgo: 2, streak: 4, best: 6, base: { press_banca: 85, sentadilla: 120, peso_muerto: 150 } },
  { email: 'demo3@example.com', name: 'Camila', unit: 'lb', sessions: 5, lastDaysAgo: 1, streak: 3, best: 3, base: { press_banca: 40, sentadilla: 70, peso_muerto: 85 } },
  { email: 'demo4@example.com', name: 'Andrés', unit: 'kg', sessions: 40, lastDaysAgo: 3, streak: 0, best: 21, base: { press_banca: 105, sentadilla: 145, peso_muerto: 185 } },
];

function at(daysAgo) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(18, 0, 0, 0);
  return d.toISOString();
}

function buildData(userId, spec) {
  const sessions = [];
  const events = [];
  const prs = {};

  for (let k = 0; k < spec.sessions; k++) {
    const tpl = TEMPLATES[k % 3];
    const factor = Math.max(0.7, 1 - k * 0.012);
    const w = r25(spec.base[tpl.main] * factor);
    const accW = r25(spec.base[tpl.main] * tpl.accFactor * factor);
    const date = at(spec.lastDaysAgo + k * 2);

    const exercises = [
      { exerciseId: tpl.main, sets: [{ weightKg: w, reps: 5 }, { weightKg: r25(w * 0.95), reps: 6 }, { weightKg: r25(w * 0.9), reps: 8 }] },
      { exerciseId: tpl.acc, sets: [{ weightKg: accW, reps: 8 }, { weightKg: accW, reps: 8 }] },
    ];
    const volume = exercises.reduce((t, e) => t + e.sets.reduce((s, x) => s + x.weightKg * x.reps, 0), 0);
    const id = `d_${userId.slice(0, 8)}_${k}`;

    sessions.push({ user_id: userId, id, name: tpl.name, performed_at: date, exercises, volume_kg: volume, xp: 50 });
    events.push({ user_id: userId, id: `${id}_s`, kind: 'session', title: 'Sesión completa', xp: 50, occurred_at: date });

    // El PR de cada básico es su mejor serie (la sesión más reciente, la más pesada).
    const best = epley(w, 5);
    if (!prs[tpl.main] || best > prs[tpl.main].e1rm) {
      prs[tpl.main] = { user_id: userId, exercise_id: tpl.main, weight_kg: w, reps: 5, e1rm: Math.round(best * 100) / 100, achieved_at: date };
    }
    if (k < 3) {
      events.push({ user_id: userId, id: `${id}_p`, kind: 'pr', title: `Nuevo PR - ${NAMES[tpl.main]}`, xp: 150, occurred_at: date });
    }
  }
  for (let j = 1; j <= Math.floor(spec.best / 7); j++) {
    events.push({ user_id: userId, id: `d_${userId.slice(0, 8)}_b${j}`, kind: 'streak', title: 'Bonus - Racha semanal', xp: 80, occurred_at: at(spec.lastDaysAgo + j * 7) });
  }

  const totalXp = events.reduce((t, e) => t + e.xp, 0);
  return { sessions, events, prs: Object.values(prs), totalXp };
}

async function seedUser(spec) {
  const { id, created } = await ensureUser(spec.email, demoPassword, spec.name);
  const data = buildData(id, spec);

  must(await admin.from('sessions').upsert(data.sessions), 'sessions');
  must(await admin.from('xp_events').upsert(data.events), 'xp_events');
  must(await admin.from('personal_records').upsert(data.prs), 'personal_records');
  must(
    await admin.from('profiles').upsert({
      id,
      display_name: spec.name,
      unit: spec.unit,
      total_xp: data.totalXp,
      streak: spec.streak,
      best_streak: spec.best,
      last_training_day: at(spec.lastDaysAgo).slice(0, 10),
      onboarded: true,
    }),
    'profiles',
  );
  return { email: spec.email, name: spec.name, estado: created ? 'creada' : 'ya existía (datos actualizados)', xp: data.totalXp, sesiones: spec.sessions };
}

// ---------- Ejecución ----------
try {
  const adm = await ensureUser(adminEmail, adminPassword, 'Administrador');
  must(await admin.from('admins').upsert({ user_id: adm.id }), 'admins (¿ejecutaste supabase/admin.sql?)');
  must(await admin.from('profiles').upsert({ id: adm.id, display_name: 'Administrador', onboarded: true }), 'profiles');
  console.log(`Administrador: ${adminEmail} (${adm.created ? 'creada' : 'ya existía, contraseña sin cambios'})\n`);

  const rows = [];
  for (const spec of DEMO) rows.push(await seedUser(spec));
  console.table(rows);
  console.log('Listo. Cierra esta ventana para descartar las contraseñas escritas con set.');
} catch (e) {
  console.error('Error:', e instanceof Error ? e.message : e);
  process.exit(1);
}
