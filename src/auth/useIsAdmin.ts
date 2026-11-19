import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

/**
 * true si la cuenta figura en la tabla `admins`. Es solo para mostrar u ocultar
 * el acceso: la seguridad real la imponen las políticas de la base de datos.
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  const userId = user?.id;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    setIsAdmin(false);
    if (!userId) return;
    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(
        ({ data }) => {
          if (alive) setIsAdmin(Boolean(data));
        },
        () => {},
      );
    return () => {
      alive = false;
    };
  }, [userId]);

  return isAdmin;
}
