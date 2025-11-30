// api/queue/email-queue.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService } from '../email/email.service';
import { OtpEmailJobData } from './email-queue.service';

@Processor('otp-email-queue')
export class EmailQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailQueueProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<OtpEmailJobData, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-otp-email':
        return this.handleOtpEmail(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  async handleOtpEmail(job: Job<OtpEmailJobData>) {
    const { email, otp, type } = job.data;

    this.logger.log(`Processing OTP email job for ${email}, type: ${type}`);

    try {
      const success = await this.emailService.sendOtpEmail(email, otp, type);

      if (!success) {
        throw new Error('Failed to send OTP email');
      }

      this.logger.log(`OTP email sent successfully to ${email}`);
      return { success: true, email, type };
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      throw error; // This will mark the job as failed and trigger retry
    }
  }
}
