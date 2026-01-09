import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async validate(payload: JwtPayload) {
    const userId = payload.id;
    const roleId = payload.roleId;

    if (!userId || !roleId) {
      throw new UnauthorizedException('Invalid JWT payload');
    }

    const cacheKey = `role:permissions:${roleId}`;

    try {
      const cached = await this.redisService.get<{
        isSuperAdmin?: boolean;
        permissions?: string[];
      }>(cacheKey);

      if (cached) {
        const user = await this.userService.get(userId);
        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        (user as any).role = {
          id: roleId,
          isSuperAdmin: cached.isSuperAdmin ?? payload.isSuperAdmin ?? false,
          permissions: (cached.permissions || []).map((n) => ({ name: n })),
        };

        return user;
      }
    } catch (err) {
      console.warn('Redis error', err);
    }

    const user = await this.userService.getByIdWithRoles(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    try {
      const permissions = user.role?.permissions?.map((p) => p.name) ?? [];
      await this.redisService.set(
        cacheKey,
        JSON.stringify({
          isSuperAdmin: user.role?.isSuperAdmin ?? false,
          permissions,
        }),
        24 * 3600,
      );
    } catch {}

    return user;
  }
}
