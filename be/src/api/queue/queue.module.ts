import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailQueueProcessor } from './email-queue.processor';
import { EmailQueueService } from './email-queue.service';
import { QueueCleanupService } from './queue-cleanup.service';
import { EmailModule } from '../email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../order/order.entity';
import { OrderQueueService } from './order-queue.service';
import { OrderProcessor } from './order.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
        // Global default job options
        defaultJobOptions: {
          removeOnComplete: 10, // Keep last 10 completed jobs
          removeOnFail: 5, // Keep last 5 failed jobs
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'otp-email-queue',
    }),
    BullModule.registerQueue({
      name: 'order-queue',
    }),
    EmailModule,
    TypeOrmModule.forFeature([OrderEntity]),
  ],
  providers: [
    EmailQueueProcessor,
    EmailQueueService,
    QueueCleanupService,
    OrderQueueService,
    OrderProcessor,
  ],
  exports: [EmailQueueService, OrderQueueService],
})
export class QueueModule {}
