import type { Session as SupaSession } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

interface AuthContext {
  session: SupaSession | null;
  user: SupaSession['user'] | null;
  loading: boolean;
  /** Devuelven un mensaje de error en español, o null si salió bien. */
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthContext | null>(null);

function translateError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
  if (m.includes('already registered')) return 'Ese correo ya está registrado. Inicia sesión.';
  if (m.includes('at least')) return 'La contraseña es demasiado corta.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  if (m.includes('network') || m.includes('fetch')) return 'No hay conexión. Revisa tu internet e inténtalo de nuevo.';
  if (m.includes('provider is not enabled') || m.includes('unsupported provider'))
    return 'El inicio con Google no está activado en Supabase.';
  return message;
}

/** Une los parámetros del query (?a=b) y del fragmento (#a=b) de una URL. */
function parseAuthParams(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.includes('?') ? beforeHash.split('?')[1] : '';
  for (const part of [query, hash]) {
    for (const pair of part.split('&')) {
      if (!pair) continue;
      const [k, v = ''] = pair.split('=');
      try {
        out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
      } catch {
        out[k] = v;
      }
    }
  }
  return out;
}

const web = globalThis as unknown as { location?: { origin: string } };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SupaSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let alive = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (alive) setSession(data.session);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? translateError(error.message) : null;
    } catch {
      return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: translateError(error.message), needsConfirmation: false };
      return { error: null, needsConfirmation: !data.session };
    } catch {
      return { error: 'No se pudo crear la cuenta. Inténtalo de nuevo.', needsConfirmation: false };
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        // En web el navegador redirige a Google y vuelve a esta misma página.
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: web.location?.origin },
        });
        return error ? translateError(error.message) : null;
      }

      const redirectTo = Linking.createURL('auth/callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data.url) return translateError(error?.message ?? 'No se pudo iniciar con Google.');

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (res.type !== 'success') return null; // la persona canceló

      const params = parseAuthParams(res.url);
      if (params.error || params.error_description) {
        return translateError(params.error_description ?? params.error);
      }
      if (params.code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(params.code);
        return exErr ? translateError(exErr.message) : null;
      }
      if (params.access_token && params.refresh_token) {
        const { error: setErr } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        return setErr ? translateError(setErr.message) : null;
      }
      return 'No se pudo completar el inicio de sesión con Google.';
    } catch {
      return 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContext>(
    () => ({ session, user: session?.user ?? null, loading, signIn, signUp, signInWithGoogle, signOut }),
    [session, loading, signIn, signUp, signInWithGoogle, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
