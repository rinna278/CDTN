//ĐÃ SỬA

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  //Mã tài khoản
  @ApiProperty({
    description: 'maTaiKhoan',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }) => value.trim())
  maTaiKhoan: string;

  //Tên đăng nhập
  @ApiProperty({
    description: 'name',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  name: string;

  //Mật khẩu
  @ApiProperty({
    description: 'matKhau',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  matKhau: string;

  //Họ tên
  @ApiProperty({
    description: 'hoTen',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  hoTen: string;

  //Email
  @ApiProperty({
    description: 'email',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.trim())
  @MaxLength(100)
  email: string;

  //Số điện thoại
  @ApiPropertyOptional({
    description: 'phone',
  })
  @IsOptional()
  @Transform(({ value }) => value.trim())
  @IsInt()
  phone: number;

  //Địa chỉ
  @ApiPropertyOptional({
    description: 'country',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(100)
  country: string;

  //Địa chỉ
  @ApiPropertyOptional({
    description: 'city',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(100)
  city: string;

  //Mã thành phố
  @ApiPropertyOptional({
    description: 'postalCode',
  })
  @IsOptional()
  @Transform(({ value }) => value.trim())
  @IsInt()
  postalCode: number;

  //Vai trò: role
  @ApiPropertyOptional({
    description: 'role',
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => value.trim())
  @MaxLength(10)
  role: string;

  //Trạng thái tài khoản
  @ApiPropertyOptional({
    description: 'status-account',
  })
  @IsOptional()
  @IsInt()
  status: number;
}
