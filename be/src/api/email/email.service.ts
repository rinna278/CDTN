import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailSendType } from 'src/share/common/app.interface';

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
}
