export class RevenueResponseDto {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  averageOrderValue: number;
  timeframe: string;
  startDate?: Date;
  endDate?: Date;

  // Breakdown by payment method
  revenueByPaymentMethod?: {
    cod: number;
    vnpay: number;
    momo: number;
    zalopay: number;
    bank_transfer: number;
  };
}
