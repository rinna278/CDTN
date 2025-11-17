//ĐÃ SỬA

import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { CategoryEntity } from '../category/category.entity';
import { OrderDetailEntity } from '../order-detail/order-detail.entity';
import { SAN_PHAM_CONST } from './product.constant';
import { CartDetailEntity } from '../cart-detail/cart-detail.entity';

@Entity({ name: SAN_PHAM_CONST.MODEL_NAME })
export class ProductEntity extends BaseEntity {
  @Column({ length: 255 })
  tenSanPham: string;

  @Column({ type: 'text', nullable: true })
  moTa: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  gia: number;

  @Column({ type: 'int' })
  soLuong: number;

  @Column({ length: 255, nullable: true })
  hinhAnh: string;

  @ManyToOne(() => CategoryEntity, (danhMuc) => danhMuc.sanPhams)
  @JoinColumn({ name: 'maDanhMuc' })
  danhMuc: CategoryEntity;

  @OneToMany(() => OrderDetailEntity, (ctdh) => ctdh.productId) // ✅ Dùng "product"
  chiTietDonHangs: OrderDetailEntity[];

  @OneToMany(() => CartDetailEntity, (cartItem) => cartItem.product)
  cartItems: CartDetailEntity[];
  // Methods
  themSanPham() {}
  suaSanPham() {}
  xoaSanPham() {}
  timKiem() {}
  locSanPham() {}
}
