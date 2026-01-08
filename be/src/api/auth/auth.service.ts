import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './payloads/jwt-payload';
import { JWT_CONFIG } from '../../configs/constant.config';
import { ACCEPT_AUTH, ERROR_AUTH } from './auth.constant';
import { UserEntity } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import { EmailSendType, IAdminPayload } from 'src/share/common/app.interface';
import { RoleStatus, RoleTypes } from '../role/role.constant';
import { RoleEntity } from '../role/role.entity';
import { OtpService } from '../otp/otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { EmailQueueService } from '../queue/email-queue.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RedisService } from '../../configs/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly emailQueueService: EmailQueueService,
    private readonly redisService: RedisService,
  ) {}
  createAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: JWT_CONFIG.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: JWT_CONFIG.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
  }

  createRefreshToken({ userId }): Promise<string> {
    return this.jwtService.signAsync(
      { userId },
      {
        secret: JWT_CONFIG.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: JWT_CONFIG.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      },
    );
  }

  async generateTokenResponse(user: UserEntity): Promise<LoginResponseDto> {
    const refreshToken = await this.createRefreshToken({ userId: user.id });
    await this.userService.setCurrentRefreshToken(refreshToken, user.id);

    const permissions = user.role?.permissions?.map((p) => p.name) ?? [];

    // Cache role permissions in Redis (per-role, not per-user) for optimal cache reuse
    try {
      const roleId = user.role?.id;
      if (roleId) {
        const cacheKey = `role:permissions:${roleId}`;
        const cacheValue = {
          isSuperAdmin: user.role?.isSuperAdmin ?? false,
          permissions,
        };
        // TTL = 24h for role cache (longer than token expiration)
        const ttl = 24 * 3600;
        await this.redisService.set(cacheKey, JSON.stringify(cacheValue), ttl);
      }
    } catch (err) {
      // don't block login if cache fails
      console.warn('Failed to cache role permissions', user.role?.id, err);
    }

    // Embed roleId & isSuperAdmin in JWT to avoid DB query on every request
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      fullName: user.name,
      roleId: user.role?.id,
      isSuperAdmin: user.role?.isSuperAdmin ?? false,
    };

    return {
      email: user.email,
      fullName: user.name,
      accessToken: await this.createAccessToken(payload),
      accessTokenExpire: JWT_CONFIG.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      refreshToken,
      refreshTokenExpire: JWT_CONFIG.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      isFirstTimeLogin: !user.lastLogin,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: {
        role: {
          permissions: true,
        },
      },
    });

    const isRightPassword = bcrypt.compareSync(password, user?.password);
    if (!user || !isRightPassword) {
      throw new BadRequestException(ERROR_AUTH.PASSWORD_INCORRECT.MESSAGE);
    }

    await user.save();

    return this.generateTokenResponse(user);
  }

  async refreshToken(id: string): Promise<LoginResponseDto> {
    if (!id) {
      throw new InternalServerErrorException(' Invalid user id');
    }
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['role', 'role.permissions'],
    });
    return this.generateTokenResponse(user);
  }

  async removeRefreshToken(userId: string) {
    await this.userService.removeRefreshToken(userId);
    return {
      status: true,
    };
  }

  async checkExistsUserByEmail(email: string) {
    const user = await this.userRepository.findOneBy({
      email: email?.toLowerCase(),
    });

    if (!user) return true;

    throw new NotFoundException(ERROR_AUTH.USER_NAME_EXISTED.MESSAGE);
  }

  async signUp(data: SignUpDto, user: IAdminPayload): Promise<unknown> {
    await this.checkExistsUserByEmail(data.email);
    const passwordHash = await bcrypt.hash(
      data.password,
      JWT_CONFIG.SALT_ROUNDS,
    );
    const role = await this.roleRepository.findOneBy({
      type: RoleTypes.User,
      status: RoleStatus.ACTIVE,
    });

    const isValid = await this.otpService.verifyOtp(data.email, data.otp);
    if (!isValid) {
      throw new BadRequestException(ERROR_AUTH.OTP_INVALID.MESSAGE);
    }

    const uModel = new UserEntity();
    uModel.email = data.email.toLowerCase();
    uModel.password = passwordHash;
    uModel.name = data.name;
    uModel.role = role;
    uModel.createdBy = user?.id;
    if (data.phone) {
      uModel.phone = data.phone;
    }
    return this.userRepository.save(uModel);
  }

  /**
   * Send OTP to user's email
   */
  async sendOtp(
    data: SendOtpDto,
  ): Promise<{ success: boolean; message: string }> {
    const { email } = data;

    // Check if user exists
    const user = await this.userService.findByEmail(email);
    if (user) {
      throw new BadRequestException(ERROR_AUTH.USER_EMAIL_EXISTED.MESSAGE);
    }

    // Check if there's already an active OTP
    const hasActiveOtp = await this.otpService.hasActiveOtp(email);
    if (hasActiveOtp) {
      return {
        success: false,
        message: ERROR_AUTH.OTP_EXPIRED.MESSAGE,
      };
    }

    // Generate OTP
    const otp = this.otpService.generateOtp();

    // Store OTP in Redis
    await this.otpService.storeOtp(email, otp);

    try {
      await this.emailQueueService.addOtpEmailJob({
        email,
        otp,
        type: EmailSendType.REGISTER,
      });

      return {
        success: true,
        message: ACCEPT_AUTH.OTP_SENT_SUCCESS.MESSAGE,
      };
    } catch (e) {
      // If queue fails, clean up the stored OTP
      await this.otpService.invalidateOtp(email);
      throw new InternalServerErrorException(
        ERROR_AUTH.OTP_QUEUE_FAILED.MESSAGE,
      );
    }
  }

  async sendOtpForChangePassword(
    data: SendOtpDto,
  ): Promise<{ success: boolean; message: string }> {
    const { email } = data;

    // Check if user exists
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException(ERROR_AUTH.USER_EMAIL_NOT_EXIST.MESSAGE);
    }

    // Check if there's already an active OTP
    const hasActiveOtp = await this.otpService.hasActiveOtp(email);
    if (hasActiveOtp) {
      return {
        success: false,
        message: ERROR_AUTH.OTP_EXPIRED.MESSAGE,
      };
    }

    // Generate OTP
    const otp = this.otpService.generateOtp();

    // Store OTP in Redis
    await this.otpService.storeOtp(email, otp);

    try {
      await this.emailQueueService.addOtpEmailJob({
        email,
        otp,
        type: EmailSendType.FORGOT_PASSWORD,
      });

      return {
        success: true,
        message: ACCEPT_AUTH.OTP_SENT_SUCCESS.MESSAGE,
      };
    } catch (e) {
      // If queue fails, clean up the stored OTP
      await this.otpService.invalidateOtp(email);
      throw new InternalServerErrorException(
        ERROR_AUTH.OTP_QUEUE_FAILED.MESSAGE,
      );
    }
  }

  async changePasswordWithOtp(dto: ForgotPasswordDto) {
    const isValid = await this.otpService.verifyOtp(dto.email, dto.otp);

    if (!isValid) {
      throw new BadRequestException(ERROR_AUTH.OTP_INVALID.MESSAGE);
    }

    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException(ERROR_AUTH.USER_EMAIL_NOT_EXIST.MESSAGE);
    }

    user.password = bcrypt.hashSync(dto.newPassword, JWT_CONFIG.SALT_ROUNDS);
    console.log(user.password);
    await user.save();

    return { message: ACCEPT_AUTH.PASSWORD_CHANGED.MESSAGE };
  }
}
