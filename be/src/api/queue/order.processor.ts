// queue/order.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../order/order.entity';
import { OrderStatus, PaymentStatus } from '../order/order.constant';
import { AutoCancelOrderJobData } from './order-queue.service';

@Processor('order-queue')
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {
    super();
  }

  async process(job: Job<AutoCancelOrderJobData>): Promise<void> {
    this.logger.log(`Processing auto-cancel job ${job.id}`);

    try {
      const { orderId, orderCode } = job.data;

      // Fetch order with latest status
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        this.logger.warn(`Order ${orderCode} not found, skipping auto-cancel`);
        return;
      }

      // Only cancel if still PENDING and UNPAID
      if (
        order.orderStatus === OrderStatus.PENDING &&
        order.paymentStatus === PaymentStatus.PENDING
      ) {
        order.orderStatus = OrderStatus.CANCELLED;
        order.cancelledAt = new Date();
        order.cancelReason = 'Tự động hủy do quá thời gian thanh toán (24h)';

        await this.orderRepository.save(order);

        this.logger.log(
          `Order ${orderCode} auto-cancelled due to payment timeout`,
        );

        // TODO: Send notification email to user about cancellation
      } else {
        this.logger.log(
          `Order ${orderCode} status: ${order.orderStatus}, payment: ${order.paymentStatus} - No action needed`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to auto-cancel order:`, error);
      throw error;
    }
  }
}
