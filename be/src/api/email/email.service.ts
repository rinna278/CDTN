import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailSendType } from 'src/share/common/app.interface';

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
   * Send OTP email to user
   * @param email - User email
   * @param otp - One-time password
   * @param type - Type of OTP: 'register' or 'forgot-password'
   * @returns Promise with send status
   */
  async sendOtpEmail(
    email: string,
    otp: string,
    type: EmailSendType = EmailSendType.REGISTER,
  ): Promise<boolean> {
    try {
      const appName = this.configService.get('APP_NAME', 'My Application');
      const otpExpiration = this.configService.get('OTP_EXPIRATION', 300) / 60; // Convert to minutes

      // Select template based on type
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

      // Helper để format currency
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(amount);
      };

      // Format dữ liệu trước khi gửi template
      const formattedData = {
        ...data,
        subtotal: formatCurrency(data.subtotal),
        discountAmount: formatCurrency(data.discountAmount),
        shippingFee: formatCurrency(data.shippingFee),
        totalAmount: formatCurrency(data.totalAmount),
        items: data.items.map((item) => ({
          ...item,
          price: formatCurrency(item.price),
          subtotal: formatCurrency(item.subtotal),
          discount: formatCurrency(item.discount),
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
}
