// order.constant.ts

export const ORDER_CONST = {
  MODEL_NAME: 'orders',
};

export enum OrderStatus {
  PENDING = 'pending', // Chờ xác nhận
  CONFIRMED = 'confirmed', // Đã xác nhận
  PROCESSING = 'processing', // Đang xử lý
  SHIPPING = 'shipping', // Đang giao
  DELIVERED = 'delivered', // Đã giao
  CANCELLED = 'cancelled', // Đã hủy
  REFUNDED = 'refunded', // Đã hoàn tiền
}

export enum PaymentMethod {
  COD = 'cod', // Thanh toán khi nhận hàng
  VNPAY = 'vnpay', // VNPay
  MOMO = 'momo', // MoMo
  ZALOPAY = 'zalopay', // ZaloPay
  BANK_TRANSFER = 'bank_transfer', // Chuyển khoản
}

export enum PaymentStatus {
  PENDING = 'pending', // Chờ thanh toán
  PAID = 'paid', // Đã thanh toán
  FAILED = 'failed', // Thanh toán thất bại
  REFUNDED = 'refunded', // Đã hoàn tiền
}

export const ORDER_STATUS_TRANSITIONS = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export const ERROR_ORDER = {
  ORDER_NOT_FOUND: {
    CODE: 'od00001',
    MESSAGE: 'Order not found',
  },
  INVALID_STATUS_TRANSITION: {
    CODE: 'od00002',
    MESSAGE: 'Invalid order status transition',
  },
  CART_EMPTY: {
    CODE: 'od00003',
    MESSAGE: 'Cart is empty',
  },
  PAYMENT_FAILED: {
    CODE: 'od00004',
    MESSAGE: 'Payment failed',
  },
  CANNOT_CANCEL: {
    CODE: 'od00005',
    MESSAGE: 'Cannot cancel order in this status',
  },
};
