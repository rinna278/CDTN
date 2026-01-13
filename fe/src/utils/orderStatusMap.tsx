import { OrderStatus } from "../types/type";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Chờ xác nhận",
  [OrderStatus.CONFIRMED]: "Đã xác nhận",
  [OrderStatus.PROCESSING]: "Đang xử lý",
  [OrderStatus.SHIPPING]: "Đang giao",
  [OrderStatus.DELIVERED]: "Đã giao",
  [OrderStatus.CANCELLED]: "Đã hủy",
  [OrderStatus.REFUND_REQUESTED]: "Yêu cầu hoàn tiền",
  [OrderStatus.REFUNDED]: "Hoàn tiền",
};
