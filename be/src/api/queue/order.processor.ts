// queue/order.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderEntity } from '../order/order.entity';
import { OrderStatus, PaymentStatus } from '../order/order.constant';
import { AutoCancelOrderJobData } from './order-queue.service';
import { EmailQueueService } from './email-queue.service';

@Processor('order-queue')
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly dataSource: DataSource,
    private readonly emailQueueService: EmailQueueService,
  ) {
    super();
  }

  async process(job: Job<AutoCancelOrderJobData>): Promise<void> {
    this.logger.log(
      `Processing auto-cancel job ${job.id} for order ${job.data.orderCode}`,
    );

    const { orderId, orderCode } = job.data;

    try {
      // Use transaction with pessimistic lock to prevent race conditions
      await this.dataSource.transaction(async (manager) => {
        // Fetch order with pessimistic write lock
        const order = await manager.findOne(OrderEntity, {
          where: { id: orderId },
          relations: ['items', 'user'],
          lock: { mode: 'pessimistic_write' },
        });

        if (!order) {
          this.logger.warn(
            `Order ${orderCode} not found, skipping auto-cancel`,
          );
          return;
        }

        // Only cancel if still PENDING and UNPAID
        if (
          order.orderStatus === OrderStatus.PENDING &&
          order.paymentStatus === PaymentStatus.PENDING
        ) {
          // Update order status
          order.orderStatus = OrderStatus.CANCELLED;
          order.cancelledAt = new Date();
          order.cancelReason =
            'Tự động hủy do quá thời gian thanh toán (24 giờ)';

          await manager.save(order);

          this.logger.log(
            `✅ Order ${orderCode} auto-cancelled due to payment timeout`,
          );

          // Send cancellation email asynchronously (don't block the job)
          this.sendCancellationEmail(order).catch((error) => {
            this.logger.error(
              `Failed to send cancellation email for order ${orderCode}:`,
              error,
            );
          });

          // Note: No need to release stock because VNPay orders don't reserve stock
          // Stock is only decremented after successful payment
        } else {
          this.logger.log(
            `⏭️  Order ${orderCode} already processed - Status: ${order.orderStatus}, Payment: ${order.paymentStatus}`,
          );
        }
      });
    } catch (error) {
      this.logger.error(
        `❌ Failed to auto-cancel order ${orderCode}:`,
        error.stack || error,
      );
      throw error; // Re-throw to trigger retry
    }
  }

  /**
   * Send cancellation notification email to user
   */
  private async sendCancellationEmail(order: OrderEntity): Promise<void> {
    if (!order.user?.email) {
      this.logger.warn(`No email found for order ${order.orderCode}`);
      return;
    }

    try {
      await this.emailQueueService.addOrderCancellationEmailJob({
        email: order.user.email,
        orderCode: order.orderCode,
        cancelReason: order.cancelReason,
        totalAmount: Number(order.totalAmount),
        cancelledAt: order.cancelledAt,
        isPaid: order.paymentStatus === PaymentStatus.PAID,
        isAutoCancel: true,
      });

      this.logger.log(
        `📧 Queued cancellation email for order ${order.orderCode}`,
      );
    } catch (error) {
      // Log but don't throw - email failure shouldn't fail the cancellation
      this.logger.error(
        `Failed to queue cancellation email for order ${order.orderCode}:`,
        error,
      );
    }
  }
}
