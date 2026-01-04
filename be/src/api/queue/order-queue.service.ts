// queue/order-queue.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface AutoCancelOrderJobData {
  orderId: string;
  orderCode: string;
}

@Injectable()
export class OrderQueueService {
  private readonly logger = new Logger(OrderQueueService.name);

  constructor(@InjectQueue('order-queue') private orderQueue: Queue) {}

  /**
   * Schedule auto-cancel job for unpaid VNPay orders after 24 hours
   */
  async scheduleAutoCancelOrder(
    orderId: string,
    orderCode: string,
  ): Promise<void> {
    const delay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    await this.orderQueue.add(
      'auto-cancel-order',
      { orderId, orderCode },
      {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
        jobId: `auto-cancel-${orderId}`,
      },
    );

    this.logger.log(
      `Scheduled auto-cancel job for order ${orderCode} after 24 hours`,
    );
  }

  /**
   * Cancel the auto-cancel job (when order is paid or manually cancelled)
   */
  async cancelAutoCancelJob(orderId: string): Promise<void> {
    try {
      const jobId = `auto-cancel-${orderId}`;
      const job = await this.orderQueue.getJob(jobId);

      if (job) {
        await job.remove();
        this.logger.log(`Cancelled auto-cancel job for order ${orderId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to cancel auto-cancel job for order ${orderId}:`,
        error,
      );
    }
  }

  /**
   * Clean up old jobs
   */
  async cleanupOldJobs(): Promise<void> {
    try {
      await this.orderQueue.clean(60 * 60 * 1000, 10, 'completed');
      await this.orderQueue.clean(7 * 24 * 60 * 60 * 1000, 5, 'failed');
      this.logger.log('Order queue cleanup completed');
    } catch (error) {
      this.logger.error('Order queue cleanup failed:', error);
    }
  }
}
