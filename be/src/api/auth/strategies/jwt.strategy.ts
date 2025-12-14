import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JWT_CONFIG } from '../../../configs/constant.config';
import { JwtPayload } from '../payloads/jwt-payload';
import { UserService } from '../../user/user.service';
import { RedisService } from '../../../configs/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONFIG.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const userId = payload.sub as string;
    const roleId = payload.roleId as string;
    const isSuperAdmin = payload.isSuperAdmin ?? false;

    // Optimized: roleId is already in token, no DB query needed to get it
    if (!roleId) {
      // Fallback if roleId missing from token (shouldn't happen with new tokens)
      return null;
    }

    const cacheKey = `role:permissions:${roleId}`;

    try {
      // Try load role permissions from Redis cache (per-role, reused by all users)
      const cached = await this.redisService.get<{
        isSuperAdmin?: boolean;
        permissions?: string[];
      }>(cacheKey);

      if (cached) {
        // Cache hit: construct user with cached role/permissions
        // No DB query needed - roleId from token, permissions from cache
        const role = {
          id: roleId,
          isSuperAdmin: cached.isSuperAdmin ?? isSuperAdmin,
          permissions: (cached.permissions || []).map((n) => ({ name: n })),
        } as any;

        return {
          id: userId,
          role,
        } as any;
      }
    } catch (err) {
      // ignore redis errors and fallback to DB
      console.warn('Redis error reading role:permissions cache', err);
    }

    // Cache miss: load full user with role & permissions from DB and prime cache
    const user = await this.userService.getByIdWithRoles(userId);
    if (user) {
      try {
        const permissions = user.role?.permissions?.map((p) => p.name) ?? [];
        const cacheValue = {
          isSuperAdmin: user.role?.isSuperAdmin ?? false,
          permissions,
        };
        // TTL = 24h (role cache is long-lived)
        const ttl = 24 * 3600;
        await this.redisService.set(cacheKey, JSON.stringify(cacheValue), ttl);
      } catch (err) {
        // ignore cache set errors
      }
    }

    return user || null;
  }
}
