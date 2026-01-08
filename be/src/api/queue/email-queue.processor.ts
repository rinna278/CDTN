// queue/email-queue.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService, OrderEmailData } from '../email/email.service';
import {
  OtpEmailJobData,
  OrderCancellationEmailData,
} from './email-queue.service';

@Processor('otp-email-queue')
export class EmailQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailQueueProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`📧 Processing email job: ${job.name} (ID: ${job.id})`);

    try {
      switch (job.name) {
        case 'send-otp-email':
          await this.handleOtpEmail(job.data as OtpEmailJobData);
          break;

        case 'send-order-confirmation':
          await this.handleOrderConfirmation(job.data as OrderEmailData);
          break;

        case 'send-order-cancellation':
          await this.handleOrderCancellation(
            job.data as OrderCancellationEmailData,
          );
          break;

        case 'send-payment-reminder':
          await this.handlePaymentReminder(job.data);
          break;

        default:
          this.logger.warn(`⚠️  Unknown job type: ${job.name}`);
      }

      this.logger.log(`✅ Email job ${job.name} completed successfully`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to process email job ${job.name}:`,
        error.stack || error,
      );
      throw error; // Re-throw to trigger retry
    }
  }

  /**
   * Handle OTP email
   */
  private async handleOtpEmail(data: OtpEmailJobData): Promise<void> {
    const success = await this.emailService.sendOtpEmail(
      data.email,
      data.otp,
      data.type,
    );

    if (!success) {
      throw new Error(`Failed to send OTP email to ${data.email}`);
    }
  }

  /**
   * Handle order confirmation email
   */
  private async handleOrderConfirmation(data: OrderEmailData): Promise<void> {
    const success = await this.emailService.sendOrderConfirmationEmail(data);

    if (!success) {
      throw new Error(
        `Failed to send order confirmation email for ${data.orderCode}`,
      );
    }
  }

  /**
   * Handle order cancellation email (NEW)
   */
  private async handleOrderCancellation(
    data: OrderCancellationEmailData,
  ): Promise<void> {
    const success = await this.emailService.sendOrderCancellationEmail(data);

    if (!success) {
      throw new Error(
        `Failed to send order cancellation email for ${data.orderCode}`,
      );
    }

    this.logger.log(
      `📧 Order cancellation email sent for order ${data.orderCode}`,
    );
  }

  /**
   * Handle payment reminder email (OPTIONAL - for future use)
   */
  private async handlePaymentReminder(data: any): Promise<void> {
    const success = await this.emailService.sendPaymentReminderEmail(data);

    if (!success) {
      throw new Error(
        `Failed to send payment reminder email for ${data.orderCode}`,
      );
    }

    this.logger.log(
      `📧 Payment reminder email sent for order ${data.orderCode}`,
    );
  }
}
