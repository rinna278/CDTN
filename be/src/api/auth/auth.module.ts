import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JWT_CONFIG } from '../../configs/constant.config';
// import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { QueueModule } from '../queue/queue.module';
import { RoleEntity } from '../role/role.entity';
import { EmailModule } from '../email/email.module';
import { OtpModule } from '../otp/otp.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    QueueModule,
    ConfigModule,
    UserModule,
    OtpModule,
    EmailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_CONFIG.JWT_ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: JWT_CONFIG.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      },
    }),
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
