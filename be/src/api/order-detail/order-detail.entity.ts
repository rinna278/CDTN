// order-detail.entity.ts
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { OrderEntity } from '../order/order.entity';
import { ProductEntity } from '../product/product.entity';

@Entity({ name: 'order_details' })
export class OrderDetailEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @ManyToOne(() => OrderEntity, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  // Thông tin sản phẩm (snapshot tại thời điểm đặt)
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'varchar', length: 255, name: 'product_name' })
  productName: string;

  @Column({ type: 'varchar', length: 50 })
  color: string;

  @Column({ type: 'varchar', length: 500, name: 'product_image' })
  productImage: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sku: string;

  // Giá tại thời điểm đặt
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  discount: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  // Reference (optional)
  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
