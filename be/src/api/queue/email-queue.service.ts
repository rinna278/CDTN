// api/queue/email-queue.service.ts - UPDATED
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailSendType } from 'src/share/common/app.interface';
import { OrderEmailData } from '../email/email.service';

export interface OtpEmailJobData {
  email: string;
  otp: string;
  type: EmailSendType;
}

export interface OrderCancellationEmailData {
  email: string;
  orderCode: string;
  cancelReason: string;
  totalAmount: number;
  cancelledAt: Date;
  isPaid?: boolean;
  isAutoCancel?: boolean;
}

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue('otp-email-queue') private otpEmailQueue: Queue) {}

  /**
   * Add OTP email job to queue
   */
  async addOtpEmailJob(data: OtpEmailJobData): Promise<void> {
    await this.otpEmailQueue.add('send-otp-email', data, {
      attempts: 3,
      delay: 1000,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: `otp-${data.email}-${Date.now()}`,
    });
  }

  /**
   * Add order confirmation email job to queue
   */
  async addOrderConfirmationEmailJob(data: OrderEmailData): Promise<void> {
    await this.otpEmailQueue.add('send-order-confirmation', data, {
      attempts: 3,
      delay: 500,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: `order-${data.orderCode}-${Date.now()}`,
    });
  }

  /**
   * Add order cancellation email job to queue
   */
  async addOrderCancellationEmailJob(
    data: OrderCancellationEmailData,
  ): Promise<void> {
    await this.otpEmailQueue.add('send-order-cancellation', data, {
      attempts: 3,
      delay: 500,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: `cancel-${data.orderCode}-${Date.now()}`,
    });
  }

  /**
   * 🆕 Add payment failed email job to queue
   */
  async addPaymentFailedEmailJob(
    data: OrderCancellationEmailData,
  ): Promise<void> {
    await this.otpEmailQueue.add('send-payment-failed', data, {
      attempts: 3,
      delay: 500,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: `payment-failed-${data.orderCode}-${Date.now()}`,
    });
  }

  /**
   * Add payment reminder email (23 hours after order creation)
   */
  async addPaymentReminderEmailJob(
    data: {
      email: string;
      orderCode: string;
      totalAmount: number;
      paymentUrl: string;
      hoursRemaining: number;
    },
    delayMs: number = 23 * 60 * 60 * 1000, // 23 hours
  ): Promise<void> {
    await this.otpEmailQueue.add('send-payment-reminder', data, {
      attempts: 2,
      delay: delayMs,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: `reminder-${data.orderCode}`,
    });
  }

  /**
   * Cancel payment reminder job (when order is paid or cancelled)
   */
  async cancelPaymentReminderJob(orderCode: string): Promise<void> {
    try {
      const jobId = `reminder-${orderCode}`;
      const job = await this.otpEmailQueue.getJob(jobId);
      if (job) {
        await job.remove();
      }
    } catch (error) {
      console.error(`Failed to cancel reminder job for ${orderCode}:`, error);
    }
  }

  /**
   * Clean up old jobs manually
   */
  async cleanupOldJobs(): Promise<void> {
    try {
      await this.otpEmailQueue.clean(60 * 60 * 1000, 10, 'completed');
      await this.otpEmailQueue.clean(24 * 60 * 60 * 1000, 5, 'failed');
      await this.otpEmailQueue.clean(30 * 60 * 1000, 0, 'active');
      console.log('Queue cleanup completed');
    } catch (error) {
      console.error('Queue cleanup failed:', error);
    }
  }
}
