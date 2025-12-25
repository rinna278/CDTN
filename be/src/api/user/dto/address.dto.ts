import {
  IsString,
  IsBoolean,
  IsOptional,
  Length,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  fullName: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsOptional()
  @IsString()
  @Length(7, 20)
  phone: string;

  @ApiProperty({ example: '123 Nguyễn Huệ' })
  @IsNotEmpty()
  @IsString()
  @Length(5, 500)
  street: string;

  @ApiProperty({ example: 'Phường 1' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  ward: string;

  @ApiProperty({ example: 'Quận 1' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  district: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  city: string;

  @ApiProperty({ example: '700000', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  postalCode?: string;

  @ApiProperty({ example: 'Nhà, tầng 2, gần Bưu điện', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}

export class AddressResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  street: string;

  @ApiProperty()
  ward: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
