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
import { IAdminPayload } from 'src/share/common/app.interface';
import { RoleStatus, RoleTypes } from '../role/role.constant';
import { RoleEntity } from '../role/role.entity';
import { OtpService } from '../otp/otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { EmailQueueService } from '../queue/email-queue.service';

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

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.name,
      role: user?.role,
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
      relations: ['roles'],
    });

    const isRightPassword = bcrypt.compareSync(password, user?.password);
    if (!user || !isRightPassword) {
      throw new BadRequestException(ERROR_AUTH.PASSWORD_INCORRECT.MESSAGE);
    }

    await user.save();

    return this.generateTokenResponse(user);
  }

  async refreshToken(id: number): Promise<LoginResponseDto> {
    if (!id) {
      throw new InternalServerErrorException(' Invalid user id');
    }
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['roles'],
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
      // throw new BadRequestException(ERROR_AUTH.OTP_INVALID.MESSAGE);
    }

    const uModel = new UserEntity();
    uModel.email = data.email.toLowerCase();
    uModel.password = passwordHash;
    uModel.name = data.name;
    uModel.role = role;
    uModel.createdBy = user?.sub;
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
      // throw new BadRequestException(ERROR_AUTH.USER_EMAIL_EXISTED.MESSAGE);
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
        type: 'register',
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
}
