export type UserRole = 'OPERADOR' | 'AUDITOR';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthUser {
  email: string;
  role: UserRole;
  /** Momento de expiracion del token, en epoch ms. */
  expiresAt: number;
}
