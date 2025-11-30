import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { OrderEntity } from '../order/order.entity';
import { ProductEntity } from '../product/product.entity';

@Entity({ name: 'chi_tiet_don_hang' })
export class OrderDetailEntity extends BaseEntity {
  @Column({ name: 'ma_don_hang' })
  orderId: number;

  @ManyToOne(() => OrderEntity, (order) => order.orderDetails)
  @JoinColumn({ name: 'ma_don_hang' })
  order: OrderEntity;

  @ManyToOne(() => ProductEntity, (product) => product.orderDetails)
  @JoinColumn({ name: 'ma_don_hang' })
  product: ProductEntity;

  @Column({ name: 'so_luong', type: 'int' })
  quantity: number;

  @Column({ name: 'don_gia', type: 'decimal', precision: 12, scale: 2 })
  price: number;
}
