//ĐÃ SỬA

import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { KHUYEN_MAI_CONST } from './discount.constant';

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

  themKM() {}
  suaKM() {}
  xoaKM() {}
}
