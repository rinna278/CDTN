import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../order.constant';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryOrderDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    enum: OrderStatus,
    required: false,
    description: 'Filter theo trạng thái đơn hàng',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;

  @ApiProperty({
    enum: PaymentStatus,
    required: false,
    description: 'Filter theo trạng thái thanh toán',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    enum: PaymentMethod,
    required: false,
    description: 'Filter theo phương thức thanh toán',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    required: false,
    description: 'Tìm theo mã đơn hàng',
  })
  @IsOptional()
  @IsString()
  orderCode?: string;

  @ApiProperty({
    required: false,
    description: 'Tìm theo tên người nhận',
  })
  @IsOptional()
  @IsString()
  recipientName?: string;
}
