import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailSendType } from 'src/share/common/app.interface';
import { OrderCancellationEmailData } from '../queue/email-queue.service';

export interface OrderEmailData {
  email: string;
  orderCode: string;
  recipientName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  items: Array<{
    productName: string;
    productImage: string;
    color: string;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
  }>;
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentMethodText: string;
  isPaid: boolean;
  isVNPay: boolean;
  notes?: string;
  trackingUrl: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Format currency helper
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  /**
   * Format date helper
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(date);
  }

  /**
   * Send OTP email to user
   */
  async sendOtpEmail(
    email: string,
    otp: string,
    type: EmailSendType = EmailSendType.REGISTER,
  ): Promise<boolean> {
    try {
      const appName = this.configService.get('APP_NAME', 'My Application');
      const otpExpiration = this.configService.get('OTP_EXPIRATION', 300) / 60;

      let template = './otp-register';
      let subject = `${appName} - Verify Your Email`;

      if (type === 'forgot-password') {
        template = './otp-forgot-password';
        subject = `${appName} - Reset Your Password`;
      }

      await this.mailerService.sendMail({
        to: email,
        subject,
        template,
        context: {
          otp,
          email,
          appName,
          expirationMinutes: otpExpiration,
        },
      });

      this.logger.log(
        `OTP email sent successfully to ${email} for type: ${type}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
    try {
      const appName = this.configService.get('APP_NAME', 'AVICI');

      const formattedData = {
        ...data,
        subtotal: this.formatCurrency(data.subtotal),
        discountAmount: this.formatCurrency(data.discountAmount),
        shippingFee: this.formatCurrency(data.shippingFee),
        totalAmount: this.formatCurrency(data.totalAmount),
        items: data.items.map((item) => ({
          ...item,
          price: this.formatCurrency(item.price),
          subtotal: this.formatCurrency(item.subtotal),
          discount: this.formatCurrency(item.discount),
        })),
      };

      await this.mailerService.sendMail({
        to: data.email,
        subject: `${appName} - Xác Nhận Đơn Hàng #${data.orderCode}`,
        template: './order-confirmation',
        context: {
          ...formattedData,
          appName,
        },
      });

      this.logger.log(
        `Order confirmation email sent to ${data.email} for order ${data.orderCode}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order confirmation email to ${data.email}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Send order cancellation email
   */
  async sendOrderCancellationEmail(
    data: OrderCancellationEmailData,
  ): Promise<boolean> {
    try {
      const appName = this.configService.get('APP_NAME', 'AVICI');
      const frontendUrl = this.configService.get(
        'FRONTEND_URL',
        'http://localhost:3000',
      );

      await this.mailerService.sendMail({
        to: data.email,
        subject: `${appName} - Đơn Hàng #${data.orderCode} Đã Bị Hủy`,
        template: './order-cancellation',
        context: {
          orderCode: data.orderCode,
          cancelReason: data.cancelReason,
          totalAmount: data.totalAmount,
          cancelledAt: data.cancelledAt,
          isPaid: data.isPaid || false,
          isAutoCancel: data.isAutoCancel || false,
          shopUrl: frontendUrl,
          appName,
          formatCurrency: this.formatCurrency.bind(this),
          formatDate: this.formatDate.bind(this),
        },
      });

      this.logger.log(
        `Order cancellation email sent to ${data.email} for order ${data.orderCode}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order cancellation email to ${data.email}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Send payment reminder email (1 hour before auto-cancel)
   */
  async sendPaymentReminderEmail(data: {
    email: string;
    orderCode: string;
    totalAmount: number;
    paymentUrl: string;
    hoursRemaining: number;
  }): Promise<boolean> {
    try {
      const appName = this.configService.get('APP_NAME', 'AVICI');

      await this.mailerService.sendMail({
        to: data.email,
        subject: `${appName} - Nhắc Nhở Thanh Toán Đơn #${data.orderCode}`,
        template: './payment-reminder',
        context: {
          orderCode: data.orderCode,
          totalAmount: this.formatCurrency(data.totalAmount),
          paymentUrl: data.paymentUrl,
          hoursRemaining: data.hoursRemaining,
          appName,
        },
      });

      this.logger.log(
        `Payment reminder email sent to ${data.email} for order ${data.orderCode}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send payment reminder email to ${data.email}:`,
        error,
      );
      return false;
    }
  }
}
