//CHƯA SỬA

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

export class CreateBillDto {
  //Mã hóa đơn
  @ApiProperty({
    description: 'maHoaDon',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }) => value.trim())
  maTaiKhoan: string;

  //Ngày lập
  @ApiProperty({
    description: 'date-create',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  datecreate: string;

  //Tổng tiền
  @ApiProperty({
    description: 'tongTien',
  })
  @IsNotEmpty()
  @IsInt()
  tongTien: number;

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
