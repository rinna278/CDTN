import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'name',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'phone',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(12)
  phone: string;

  @ApiPropertyOptional({
    description: 'status',
  })
  @IsOptional()
  @IsIn([1, 0])
  status: number;
}

export class ChangeUserPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
