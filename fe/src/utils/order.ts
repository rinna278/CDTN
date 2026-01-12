// OrderDetailModalAdmin.tsx hoặc utils/order.ts
import { OrderAdmin, OrderItem, ManageOrderItem } from "../types/type";
// map AdminOrderListResponse -> ManageOrderItem có items
export const mapAdminOrderToManageOrderItem = (
  order: OrderAdmin
): ManageOrderItem & { items: OrderItem[] } => ({
  id: order.id,
  maDon: order.orderCode,
  nameCustomer: order.recipientName,
  totalPrice: order.totalAmount,
  status: order.orderStatus,
  date: order.createdAt,
  items: (order as any).items || [], // API thực tế không trả items thì để []
});
