import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OtpService } from './otp.service';
import { EmailModule } from '../email/email.module';
import { RedisModule } from 'src/configs/redis/redis.module';

@Module({
  imports: [ConfigModule, RedisModule, EmailModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
