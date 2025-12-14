export interface JwtPayload {
  sub: string;
  email: string;
  fullName: string;
  roleId?: string;
  isSuperAdmin?: boolean;
  iat?: string;
}

export interface JwtRefreshTokenPayload {
  userId: string;
}
