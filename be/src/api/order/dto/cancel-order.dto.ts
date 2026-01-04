import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiProperty({
    description: 'Lý do hủy đơn',
    example: 'Đặt nhầm địa chỉ',
  })
  @IsString()
  reason: string;
}
