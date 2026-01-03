import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from '../order.constant';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID địa chỉ giao hàng (phải là địa chỉ của user)',
    example: 'uuid-address-id',
  })
  @IsUUID()
  addressId: string;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.COD,
    description: 'Phương thức thanh toán',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    required: false,
    description: 'Ghi chú đơn hàng',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    required: false,
    description: 'Mã giảm giá (nếu có)',
  })
  @IsString()
  @IsOptional()
  discountCode?: string;
}
