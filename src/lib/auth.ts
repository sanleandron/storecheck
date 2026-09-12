import { supabase, isDbAvailable } from '../db/supabase';

export interface SessionUser {
  name: string;
  role: 'auditor' | 'admin';
  email: string;
  id: string;
}

const KEY = 'storecheck-session';

/**
 * Sesión local en localStorage (meta de UI). El estado de autenticación real
 * lo gestiona Supabase Auth (persistSession: true).
 */
export function getSession(): SessionUser | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function persistUserLocally(
  id: string,
  email: string,
  role: 'auditor' | 'admin',
  name: string,
): void {
  const session: SessionUser = { id, email, role, name };
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearLocalSession(): void {
  localStorage.removeItem(KEY);
}

/**
 * Sincroniza la sesión local con el usuario autenticado en Supabase.
 * Devuelve la sesión local o null.
 */
export async function refreshLocalSession(): Promise<SessionUser | null> {
  if (!isDbAvailable()) return null;
  const sup = supabase();
  const { data, error } = await sup.auth.getUser();
  if (error || !data.user) {
    clearLocalSession();
    return null;
  }
  const meta = data.user.user_metadata as Record<string, unknown> | null;
  const role: 'auditor' | 'admin' = meta?.role === 'admin' ? 'admin' : 'auditor';
  const name =
    (meta?.name as string) ||
    data.user.email?.split('@')[0] ||
    'Auditor';
  persistUserLocally(data.user.id, data.user.email ?? '', role, name);
  return getSession();
}

/** Inicia sesión con email + contraseña vía Supabase Auth. */
export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  if (!isDbAvailable()) {
    return { error: 'Supabase no configurado. Revisa el archivo .env.' };
  }
  const sup = supabase();
  const { error } = await sup.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  await refreshLocalSession();
  return {};
}

/**
 * Acceso local de respaldo cuando Supabase no está configurado.
 * Permite entrar con nombre+rol para uso offline/demostración.
 */
export async function signInLocal(name: string, role: 'auditor' | 'admin'): Promise<void> {
  persistUserLocally(`local-${role}-${Date.now()}`, `${name}@local`, role, name);
}

/** Registro abierto con rol Auditor por defecto. */
export async function signUp(
  email: string,
  password: string,
  name: string,
  role: 'auditor' | 'admin' = 'auditor',
): Promise<{ error?: string }> {
  if (!isDbAvailable()) {
    return { error: 'Supabase no configurado. Revisa el archivo .env.' };
  }
  const sup = supabase();
  const { error } = await sup.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });
  if (error) return { error: error.message };
  await refreshLocalSession();
  return {};
}

/** Cierra sesión en Supabase y limpia la sesión local. */
export async function signOut(): Promise<void> {
  if (isDbAvailable()) {
    try {
      await supabase().auth.signOut();
    } catch {
      // ignorar: sin red o sin sesión
    }
  }
  clearLocalSession();
}

/**
 * URL base de la app para enlaces de recuperación de contraseña.
 * Deriva de la URL actual para funcionar tanto en local como en GitHub Pages
 * (que se sirve bajo un subpath).
 */
function appBaseUrl(): string {
  const { protocol, host, pathname } = window.location;
  // En GitHub Pages la app está bajo /storecheck/. Los demás casos sirven desde la raíz.
  const baseMatch = pathname.match(/^\/([^/]+)/);
  const hasSubpath = baseMatch && window.location.hostname.endsWith('github.io');
  return `${protocol}//${host}${hasSubpath ? `/${baseMatch![1]}` : ''}`;
}

/** Envía el correo de restablecimiento de contraseña. */
export async function resetPassword(email: string): Promise<{ error?: string }> {
  if (!isDbAvailable()) {
    return { error: 'Supabase no configurado. Revisa el archivo .env.' };
  }
  const sup = supabase();
  const redirectTo = `${appBaseUrl()}/actualizar-contrasena`;
  const { error } = await sup.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) return { error: error.message };
  return {};
}

/** Establece una nueva contraseña con la sesión de recuperación activa. */
export async function updatePassword(newPassword: string): Promise<{ error?: string }> {
  if (!isDbAvailable()) {
    return { error: 'Supabase no configurado. Revisa el archivo .env.' };
  }
  const sup = supabase();
  const { error } = await sup.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  await refreshLocalSession();
  return {};
}

/** Indica si la URL contiene un token de recuperación de contraseña (recovery). */
export function hasRecoveryToken(): boolean {
  const { hash } = window.location;
  // Supabase entrega el token en #access_token o #recovery_token / #token_type=recovery
  return hash.includes('type=recovery') || hash.includes('recovery_token');
}

/**
 * Compatibilidad: llama refreshLocalSession al inicializar la app para
 * mantener la sesión si el usuario ya tiene una en Supabase.
 */
export function initSession(): void {
  void refreshLocalSession();
}