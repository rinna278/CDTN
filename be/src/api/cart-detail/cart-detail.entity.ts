//ĐÃ SỬA

import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { CartEntity } from '../cart/cart.entity';
import { ProductEntity } from '../product/product.entity'; 

// Tên bảng vẫn là chi_tiet_phieu_thu
@Entity({ name: 'chi_tiet_phieu_thu' })
export class CartDetailEntity extends BaseEntity {
  @Column({ type: 'int' })
  quantity: number; // Số lượng sản phẩm trong giỏ hàng

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // Đơn giá tại thời điểm thêm vào giỏ

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subTotal: number; // Thành tiền (quantity * unitPrice)

  // --------------------------------------------------------
  // QUAN HỆ: Cart <-> CartItem (Many CartItem belongs to One Cart)
  @ManyToOne(() => CartEntity, (cart) => cart.items)
  @JoinColumn({ name: 'phieu_thu_id' })
  cart: CartEntity;

  @Column({ type: 'bigint', name: 'phieu_thu_id' })
  cartId: number;
  // --------------------------------------------------------

  // QUAN HỆ: Product <-> CartItem (Many CartItem links to One Product)
  @ManyToOne(() => ProductEntity, (product) => product.cartItems)
  @JoinColumn({ name: 'san_pham_id' })
  product: ProductEntity;

  @Column({ type: 'bigint', name: 'san_pham_id' })
  productId: number;
  // --------------------------------------------------------
}