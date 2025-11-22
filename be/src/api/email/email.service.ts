import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
   * @returns Promise with send status
   */
  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    try {
      const appName = this.configService.get('APP_NAME', 'My Application');
      const otpExpiration = this.configService.get('OTP_EXPIRATION', 300) / 60; // Convert to minutes

      await this.mailerService.sendMail({
        to: email,
        subject: `${appName} - Your OTP Code`,
        template: './otp', // This refers to otp.hbs template
        context: {
          otp,
          email,
          appName,
          expirationMinutes: otpExpiration,
        },
      });

      this.logger.log(`OTP email sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      return false;
    }
  }
}
