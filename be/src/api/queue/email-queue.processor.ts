// queue/email-queue.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService, OrderEmailData } from '../email/email.service';
import {
  OtpEmailJobData,
  OrderCancellationEmailData,
  RefundRejectedEmailData,
  AdminRefundNotificationData,
  RefundApprovedEmailData,
  RefundRequestedEmailData,
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

        case 'send-refund-requested':
          await this.handleRefundRequested(
            job.data as RefundRequestedEmailData,
          );
          break;

        case 'send-admin-refund-notification':
          await this.handleAdminRefundNotification(
            job.data as AdminRefundNotificationData,
          );
          break;

        case 'send-refund-approved':
          await this.handleRefundApproved(job.data as RefundApprovedEmailData);
          break;

        case 'send-refund-rejected':
          await this.handleRefundRejected(job.data as RefundRejectedEmailData);
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
   * Handle order cancellation email
   */
  private async handleOrderCancellation(
    data: OrderCancellationEmailData,
  ): Promise<void> {
    // ✅ Parse date if it's a string (from Redis serialization)
    const parsedData = {
      ...data,
      cancelledAt: this.parseDate(data.cancelledAt),
    };

    const success =
      await this.emailService.sendOrderCancellationEmail(parsedData);

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
   * Handle payment reminder email
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

  /**
   * Handle refund requested email
   * ✅ FIX: Parse requestedAt date properly
   */
  private async handleRefundRequested(
    data: RefundRequestedEmailData,
  ): Promise<void> {
    // 🔍 Debug log
    this.logger.debug(`Raw refund data:`, {
      orderCode: data.orderCode,
      requestedAt: data.requestedAt,
      requestedAtType: typeof data.requestedAt,
    });

    // ✅ Parse date if it's a string (from Redis serialization)
    const parsedData: RefundRequestedEmailData = {
      ...data,
      requestedAt: this.parseDate(data.requestedAt),
    };

    this.logger.debug(`Parsed refund data:`, {
      orderCode: parsedData.orderCode,
      requestedAt: parsedData.requestedAt,
      requestedAtType: typeof parsedData.requestedAt,
    });

    const success =
      await this.emailService.sendRefundRequestedEmail(parsedData);

    if (!success) {
      throw new Error(
        `Failed to send refund requested email for ${data.orderCode}`,
      );
    }

    this.logger.log(
      `📧 Refund requested email sent for order ${data.orderCode}`,
    );
  }

  /**
   * Handle admin refund notification email
   */
  private async handleAdminRefundNotification(
    data: AdminRefundNotificationData,
  ): Promise<void> {
    const success = await this.emailService.sendAdminRefundNotification(data);

    if (!success) {
      throw new Error(
        `Failed to send admin refund notification for ${data.orderCode}`,
      );
    }

    this.logger.log(
      `📧 Admin refund notification sent for order ${data.orderCode}`,
    );
  }

  /**
   * Handle refund approved email
   * ✅ FIX: Parse refundedAt date properly
   */
  private async handleRefundApproved(
    data: RefundApprovedEmailData,
  ): Promise<void> {
    // ✅ Parse date if it's a string (from Redis serialization)
    const parsedData: RefundApprovedEmailData = {
      ...data,
      refundedAt: this.parseDate(data.refundedAt),
    };

    const success = await this.emailService.sendRefundApprovedEmail(parsedData);

    if (!success) {
      throw new Error(
        `Failed to send refund approved email for ${data.orderCode}`,
      );
    }

    this.logger.log(
      `📧 Refund approved email sent for order ${data.orderCode}`,
    );
  }

  /**
   * Handle refund rejected email
   */
  private async handleRefundRejected(
    data: RefundRejectedEmailData,
  ): Promise<void> {
    const parsedData: RefundRejectedEmailData = {
      ...data,
      rejectedAt: this.parseDate(data.rejectedAt),
    };
    const success = await this.emailService.sendRefundRejectedEmail(parsedData);

    if (!success) {
      throw new Error(
        `Failed to send refund rejected email for ${data.orderCode}`,
      );
    }

    this.logger.log(
      `📧 Refund rejected email sent for order ${data.orderCode}`,
    );
  }

  // ==================== HELPER METHODS ====================

  /**
   * ✅ Parse date from string or Date object
   * This is needed because Redis serialization converts Date to string
   */
  private parseDate(date: Date | string | any): Date {
    if (!date) {
      this.logger.warn('parseDate received null/undefined, using current date');
      return new Date();
    }

    if (date instanceof Date) {
      // Already a Date object
      if (isNaN(date.getTime())) {
        this.logger.warn('parseDate received invalid Date object');
        return new Date();
      }
      return date;
    }

    if (typeof date === 'string') {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        this.logger.warn(`parseDate failed to parse string: ${date}`);
        return new Date();
      }
      return parsed;
    }

    // Unexpected type
    this.logger.warn(`parseDate received unexpected type: ${typeof date}`);
    return new Date();
  }

  // ==================== ERROR HANDLING ====================

  async onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} (${job.name}) completed successfully`);
  }

  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} (${job.name}) failed: ${error.message}`,
      error.stack,
    );
  }

  async onActive(job: Job) {
    this.logger.debug(`Job ${job.id} (${job.name}) is now active`);
  }
}
