// api/queue/queue-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailQueueService } from './email-queue.service';
import { OrderQueueService } from './order-queue.service';

@Injectable()
export class QueueCleanupService {
  private readonly logger = new Logger(QueueCleanupService.name);

  constructor(
    private readonly emailQueueService: EmailQueueService,
    private readonly orderQueueService: OrderQueueService,
  ) {}

  /**
   * Run cleanup every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleQueueCleanup() {
    this.logger.log('Starting scheduled queue cleanup...');

    try {
      await this.emailQueueService.cleanupOldJobs();
      await this.orderQueueService.cleanupOldJobs();
      this.logger.log('Queue cleanup completed successfully');
    } catch (error) {
      this.logger.error('Queue cleanup failed:', error);
    }
  }

  /**
   * Run deep cleanup daily at 2 AM
   */
  @Cron('0 2 * * *')
  async handleDeepCleanup() {
    this.logger.log('Starting deep queue cleanup...');

    try {
      // This can be extended with more aggressive cleanup
      await this.emailQueueService.cleanupOldJobs();
      await this.orderQueueService.cleanupOldJobs();
      this.logger.log('Deep cleanup completed successfully');
    } catch (error) {
      this.logger.error('Deep cleanup failed:', error);
    }
  }
}
