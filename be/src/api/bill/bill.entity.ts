//ĐÃ SỬA

import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { OrderEntity } from '../order/order.entity';

@Entity({ name: 'hoa_don' })
export class BillEntity extends BaseEntity {
  @Column({ name: 'tong_tien', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @CreateDateColumn({ name: 'ngay_lap' })
  createdAt: Date;

  @Column({ name: 'ma_don_hang' })
  orderId: number;

  @ManyToOne(() => OrderEntity, (order) => order.bills)
  @JoinColumn({ name: 'ma_don_hang' })
  order: OrderEntity;
}
