import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JWT_CONFIG } from '../../../configs/constant.config';
import { JwtPayload } from '../payloads/jwt-payload';
import { UserService } from '../../user/user.service';
import { UserEntity } from '../../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONFIG.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  // async validate(payload: JwtPayload): Promise<UserEntity | null> {
  //   // const user = await this.userService.getByIdWithRoles(payload.sub as string);
  //   return ...payload;
  // }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return { ...payload };
  }
}
