import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateShippingDto {
  @ApiProperty({
    example: 'Giao hàng nhanh',
    required: false,
  })
  @IsString()
  @IsOptional()
  shippingProvider?: string;

  @ApiProperty({
    example: 'GHN123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  trackingNumber?: string;
}
