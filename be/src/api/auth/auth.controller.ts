import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBody,
} from '@nestjs/swagger';
import { GetUser } from '../../share/decorator/get-user.decorator';
import { AUTH_SWAGGER_RESPONSE } from './auth.constant';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { IAdminPayload } from 'src/share/common/app.interface';
import { SignUpDto } from './dto/signup.dto';
import { SendOtpDto } from './dto/send-otp.dto';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse(AUTH_SWAGGER_RESPONSE.LOGIN_SUCCESS)
  @ApiBadRequestResponse(AUTH_SWAGGER_RESPONSE.BAD_REQUEST_EXCEPTION)
  @ApiNotFoundResponse(AUTH_SWAGGER_RESPONSE.LOGIN_FAIL)
  @ApiInternalServerErrorResponse(
    AUTH_SWAGGER_RESPONSE.INTERNAL_SERVER_EXCEPTION,
  )
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  signUp(
    @Body() data: SignUpDto,
    @GetUser() user: IAdminPayload,
  ): Promise<unknown> {
    return this.authService.signUp(data, user);
  }

<<<<<<< HEAD
  @Post('test')
  testRoute() {}
=======
>>>>>>> d419e2c0b3429fbcd139febb2c3ecff9d887a0fa
  @HttpCode(HttpStatus.OK)
  @Post('send-otp')
  @ApiBody({
    type: SendOtpDto,
    description: 'Email to send OTP',
    required: true,
  })
  sendOtp(@Body() data: SendOtpDto) {
    console.log('🔥 sendOtp method called with data:', data);
    return this.authService.sendOtp(data);
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('refresh')
  @ApiBody({
    type: RefreshDto,
    description: 'refresh token',
    required: true,
  })
  refresh(@GetUser('id') userId) {
    return this.authService.refreshToken(userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('logout')
  logOut(@GetUser('sub') userId: string) {
    return this.authService.removeRefreshToken(userId);
  }
}
