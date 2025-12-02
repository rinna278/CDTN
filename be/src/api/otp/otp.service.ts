import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/configs/redis/redis.service';

@Injectable()
export class OtpService {
  private readonly otpLength: number;
  private readonly otpExpiration: number; // in seconds

  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    this.otpLength = this.configService.get<number>('OTP_LENGTH', 6);
    this.otpExpiration = this.configService.get<number>('OTP_EXPIRATION', 300); // 5 minutes default
  }

  /**
   * Generate a random OTP
   * @returns OTP string
   */
  generateOtp(): string {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < this.otpLength; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }

    return otp;
  }

  /**
   * Store OTP in Redis with email as key
   * @param email - User email
   * @param otp - Generated OTP
   */
  async storeOtp(email: string, otp: string): Promise<void> {
    const key = `otp:${email}`;
    await this.redisService.set(key, JSON.stringify(otp), this.otpExpiration);
  }

  /**
   * Verify if the provided OTP matches the one stored for the email
   * @param email - User email
   * @param otp - OTP to verify
   * @returns boolean indicating if OTP is valid
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const key = `otp:${email}`;
    const storedOtp = await this.redisService.get<string>(key);

    if (!storedOtp) {
      return false; // OTP expired or not found
    }

    // If OTP matches, remove it to prevent reuse
    if (storedOtp === otp) {
      await this.redisService.del(key);
      return true;
    }

    return false;
  }

  /**
   * Check if there's an active OTP for the given email
   * @param email - User email
   * @returns boolean indicating if there's an active OTP
   */
  async hasActiveOtp(email: string): Promise<boolean> {
    const key = `otp:${email}`;
    return await this.redisService.exists(key);
  }

  /**
   * Invalidate an OTP for a specific email
   * @param email - User email
   */
  async invalidateOtp(email: string): Promise<void> {
    const key = `otp:${email}`;
    await this.redisService.del(key);
  }

  /**
   * Get the remaining time-to-live (TTL) of an OTP in seconds
   * @param email - User email
   * @returns TTL in seconds (0 if expired/not found, or positive seconds remaining)
   */
  async getOtpTtl(email: string): Promise<number> {
    const key = `otp:${email}`;
    const ttl = await this.redisService.getTtl(key);

    // Redis returns:
    // -2 if key doesn't exist
    // -1 if key exists but has no expiry
    // positive number for seconds remaining
    return ttl > 0 ? ttl : 0;
  }
}
