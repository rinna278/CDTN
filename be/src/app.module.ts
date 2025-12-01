import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './api/user/user.module';
import { AuthModule } from './api/auth/auth.module';
import { LoggerMiddleware } from './share/middlewares/logger.middleware';
import { PermissionModule } from './api/permission/permission.module';
import { RoleModule } from './api/role/role.module';
import { DatabaseModule } from './configs/database/database.module';
import { EmailModule } from './api/email/email.module';
import { OtpModule } from './api/otp/otp.module';
import { RedisModule } from './configs/redis/redis.module';
import { ProductModule } from './api/product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    PermissionModule,
    RoleModule,
    UserModule,
    AuthModule,
    EmailModule,
    OtpModule,
    RedisModule,
    ProductModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
