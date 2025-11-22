import { RoleEntity } from 'src/api/role/role.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  fullName: string;
  iat?: string;
  role?: RoleEntity;
}

export interface JwtRefreshTokenPayload {
  userId: number;
}
