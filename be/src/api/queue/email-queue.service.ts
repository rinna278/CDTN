// api/queue/email-queue.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailSendType } from 'src/share/common/app.interface';

export interface OtpEmailJobData {
  email: string;
  otp: string;
  type: EmailSendType;
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
      delay: 1000, // Wait 1 second before processing
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      // Auto-remove jobs after completion/failure
      removeOnComplete: true, // Remove immediately after completion
      removeOnFail: false, // Keep failed jobs for debugging (optional)

      // Unique job ID to prevent duplicates
      jobId: `otp-${data.email}-${Date.now()}`,
    });
  }

  /**
   * Clean up old jobs manually (optional method for manual cleanup)
   */
  async cleanupOldJobs(): Promise<void> {
    try {
      // Clean completed jobs older than 1 hour
      await this.otpEmailQueue.clean(60 * 60 * 1000, 10, 'completed');

      // Clean failed jobs older than 24 hours
      await this.otpEmailQueue.clean(24 * 60 * 60 * 1000, 5, 'failed');

      // Clean active jobs older than 30 minutes (stuck jobs)
      await this.otpEmailQueue.clean(30 * 60 * 1000, 0, 'active');

      console.log('Queue cleanup completed');
    } catch (error) {
      console.error('Queue cleanup failed:', error);
    }
  }
}
