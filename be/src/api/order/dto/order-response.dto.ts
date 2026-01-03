import { Expose, Type } from 'class-transformer';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../order.constant';

export class OrderItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  productId: string;

  @Expose()
  productName: string;

  @Expose()
  color: string;

  @Expose()
  productImage: string;

  @Expose()
  sku: string;

  @Expose()
  price: number;

  @Expose()
  discount: number;

  @Expose()
  quantity: number;

  @Expose()
  subtotal: number;
}

export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  orderCode: string;

  @Expose()
  userId: string;

  @Expose()
  recipientName: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  street: string;

  @Expose()
  ward: string;

  @Expose()
  district: string;

  @Expose()
  city: string;

  @Expose()
  notes: string;

  @Expose()
  totalItems: number;

  @Expose()
  subtotal: number;

  @Expose()
  discountAmount: number;

  @Expose()
  discountCode: string;

  @Expose()
  shippingFee: number;

  @Expose()
  totalAmount: number;

  @Expose()
  orderStatus: OrderStatus;

  @Expose()
  paymentMethod: PaymentMethod;

  @Expose()
  paymentStatus: PaymentStatus;

  @Expose()
  paymentTransactionId: string;

  @Expose()
  paidAt: Date;

  @Expose()
  shippingProvider: string;

  @Expose()
  trackingNumber: string;

  @Expose()
  shippedAt: Date;

  @Expose()
  deliveredAt: Date;

  @Expose()
  cancelReason: string;

  @Expose()
  cancelledAt: Date;

  @Expose()
  @Type(() => OrderItemResponseDto)
  items: OrderItemResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
