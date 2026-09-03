import { UserRole } from '../models/auth.models';

/** Ruta de aterrizaje tras el login, segun el rol del usuario. */
export function landingRouteForRole(role: UserRole): string {
  return role === 'OPERADOR' ? '/invoices' : '/dashboard';
}
