import { Expose, Transform, Type } from 'class-transformer';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../order.constant';
import { toVietnamTime } from '../../../share/utils/moment.util';

function toVN({ value }: { value: Date }) {
  return toVietnamTime(value);
}
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

export class ExpirationResponseDto {
  @Expose()
  remainingSeconds: number;

  @Expose()
  remainingMinutes: number;

  @Expose()
  remainingHours: number;

  @Expose()
  isExpired: boolean;

  @Expose()
  @Transform(toVN)
  expiresAt: Date;
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
  @Transform(toVN)
  paidAt: Date;

  @Expose()
  shippingProvider: string;

  @Expose()
  trackingNumber: string;

  @Expose()
  @Transform(toVN)
  shippedAt: Date;

  @Expose()
  @Transform(toVN)
  deliveredAt: Date;

  @Expose()
  cancelReason: string;

  @Expose()
  @Transform(toVN)
  cancelledAt: Date;

  @Expose()
  @Type(() => OrderItemResponseDto)
  items: OrderItemResponseDto[];

  @Expose()
  @Transform(toVN)
  createdAt: Date;

  @Expose()
  @Transform(toVN)
  updatedAt: Date;

  @Expose()
  expirationTime?: ExpirationResponseDto;

  @Expose()
  refundReason?: string;

  @Expose()
  refundDescription?: string;

  @Expose()
  refundRequestedAt?: Date;

  @Expose()
  refundedAt?: Date;

  @Expose()
  adminRefundNote?: string;

  @Expose()
  refundWindowRemaining?: number;
}
