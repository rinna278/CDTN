// order.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { UserEntity } from '../user/user.entity';
import { OrderDetailEntity } from '../order-detail/order-detail.entity';
import {
  ORDER_CONST,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from './order.constant';

@Entity({ name: ORDER_CONST.MODEL_NAME })
export class OrderEntity extends BaseEntity {
  // Mã đơn hàng (tự generate: ORD-20240101-0001)
  @Column({ type: 'varchar', length: 50, unique: true, name: 'order_code' })
  orderCode: string;

  // User đặt hàng
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  // Thông tin giao hàng
  @Column({ type: 'varchar', length: 100, name: 'recipient_name' })
  recipientName: string;

  @Column({ type: 'varchar', length: 15, name: 'phone_number' })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 500 })
  street: string;

  @Column({ type: 'varchar', length: 100 })
  ward: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Thông tin đơn hàng
  @Column({ type: 'int', name: 'total_items' })
  totalItems: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'subtotal' })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'discount_amount',
  })
  discountAmount: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'discount_code',
  })
  discountCode: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'shipping_fee',
  })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_amount' })
  totalAmount: number;

  // Trạng thái
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    name: 'order_status',
  })
  orderStatus: OrderStatus;

  // Thanh toán
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'payment_method',
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    name: 'payment_status',
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'payment_transaction_id',
  })
  paymentTransactionId: string;

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date;

  // Vận chuyển
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'shipping_provider',
  })
  shippingProvider: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'tracking_number',
  })
  trackingNumber: string;

  @Column({ type: 'timestamp', nullable: true, name: 'shipped_at' })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'delivered_at' })
  deliveredAt: Date;

  // Hủy đơn
  @Column({ type: 'text', nullable: true, name: 'cancel_reason' })
  cancelReason: string;

  @Column({ type: 'timestamp', nullable: true, name: 'cancelled_at' })
  cancelledAt: Date;

  // Relations
  @OneToMany(() => OrderDetailEntity, (detail) => detail.order, {
    cascade: true,
  })
  items: OrderDetailEntity[];
}
