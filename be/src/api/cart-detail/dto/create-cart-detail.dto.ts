import { IsUUID, IsInt, IsDecimal, Min } from 'class-validator';

export class CreateCartDetailDto {
  // ID của giỏ hàng
  @IsUUID()
  cartId: string;

  // ID của sản phẩm
  @IsUUID()
  productId: string;

  // Số lượng sản phẩm
  @IsInt()
  @Min(1)
  quantity: number;

  // Giá sản phẩm
  @IsDecimal()
  price: number;
}
