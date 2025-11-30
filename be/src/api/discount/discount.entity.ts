//ĐÃ SỬA

import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { KHUYEN_MAI_CONST } from './discount.constant';
import { ProductEntity } from '../product/product.entity';

@Entity({ name: KHUYEN_MAI_CONST.MODEL_NAME })
export class DiscountEntity extends BaseEntity {
  @Column({ length: 255 })
  tenKhuyenMai: string;

  @Column({ type: 'text', nullable: true })
  moTa: string;

  @Column({ type: 'timestamp' })
  ngayBatDau: Date;

  @Column({ type: 'timestamp' })
  ngayKetThuc: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  phanTramGiam: number;

  @OneToOne(() => ProductEntity, (product) => product.discount)
  products: ProductEntity[];

  themKM() {}
  suaKM() {}
  xoaKM() {}
}
