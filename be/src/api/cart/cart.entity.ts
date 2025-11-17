//ĐÃ SỬA


import { Column, Entity, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { UserEntity } from '../user/user.entity'; // UserEntity bạn đã cung cấp
import { CartDetailEntity } from '../cart-detail/cart-detail.entity';

// Tên bảng vẫn là phieu_thu để khớp với DB Schema, nhưng Entity là CartEntity
@Entity({ name: 'phieu_thu' })
export class CartEntity extends BaseEntity {
  @Column({ type: 'timestamp', name: 'ngay_lap' })
  createdAt: Date; // Ngày tạo/cập nhật Giỏ hàng

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number; // Tổng tiền tạm thời của giỏ hàng

  // Trạng thái 'DRAFT' là Cart, 'COMPLETED' là Order
  @Column({ length: 50, default: 'DRAFT' })
  status: string;

  // --------------------------------------------------------
  // QUAN HỆ: User <-> Cart (Many Cart belongs to One User)
  @OneToOne(() => UserEntity, (user) => user.cart) // Giả định user.entity.ts đã có 'carts'
  @JoinColumn({ name: 'tai_khoan_id' }) // Khóa ngoại trong bảng này
  user: UserEntity;

  @Column({ type: 'bigint', name: 'tai_khoan_id' })
  userId: number;
  // --------------------------------------------------------

  // QUAN HỆ: Cart (1) -> CartItem (N)
  @OneToMany(() => CartDetailEntity, (cartItem) => cartItem.cart)
  items: CartDetailEntity[];
}