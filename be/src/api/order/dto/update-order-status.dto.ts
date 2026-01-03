import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../order.constant';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    required: false,
    description: 'Lý do thay đổi trạng thái',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
