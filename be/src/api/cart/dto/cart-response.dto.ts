import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

export class CartItemResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  productId: string;

  @ApiProperty()
  @Expose()
  productName: string;

  @ApiProperty()
  @Expose()
  color: string;

  @ApiProperty()
  @Expose()
  productImage: string;

  @ApiProperty()
  @Expose()
  quantity: number;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty()
  @Expose()
  discount: number;

  @ApiProperty()
  @Expose()
  subtotal: number;

  @ApiProperty()
  @Expose()
  stock: number;
}

export class CartResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  status: number;

  @ApiProperty()
  @Expose()
  totalItems: number;

  @ApiProperty()
  @Expose()
  totalPrice: number;

  @ApiProperty({ type: [CartItemResponseDto] })
  @Expose()
  @Type(() => CartItemResponseDto)
  items: CartItemResponseDto[];

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => value && new Date(value).toISOString())
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => value && new Date(value).toISOString())
  updatedAt: Date;
}
