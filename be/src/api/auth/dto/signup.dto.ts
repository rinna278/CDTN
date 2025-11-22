import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({ description: 'email' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ description: 'password' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'phone number' })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'One-time password sent to email',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  otp: string;
}
