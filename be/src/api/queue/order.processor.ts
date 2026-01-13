// queue/order.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { OrderEntity } from '../order/order.entity';
import { ProductEntity } from '../product/product.entity';
import { OrderStatus, PaymentStatus } from '../order/order.constant';

@Processor('order-queue')
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name === 'auto-cancel-order') {
      await this.handleAutoCancel(job);
    }
  }

  /**
   * 🔥 AUTO CANCEL ORDER (VNPay timeout)
   */
  private async handleAutoCancel(job: Job): Promise<void> {
    const { orderId, orderCode } = job.data;

    this.logger.log(`Auto-cancel processing for order ${orderCode}`);

    await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(OrderEntity, {
        where: { id: orderId },
        relations: ['items'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        this.logger.warn(`Order ${orderId} not found, skip auto-cancel`);
        return;
      }

      // ✅ Nếu đã PAID → KHÔNG LÀM GÌ
      if (order.paymentStatus === PaymentStatus.PAID) {
        this.logger.log(`Order ${orderCode} already paid, skip auto-cancel`);
        return;
      }

      // ✅ Nếu đã CANCEL rồi → skip
      if (order.orderStatus === OrderStatus.CANCELLED) {
        return;
      }

      // 🔥 RELEASE RESERVED STOCK
      for (const item of order.items) {
        const product = await manager.findOne(ProductEntity, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) continue;

        const variant = product.variants.find((v) => v.color === item.color);

        if (!variant) continue;

        variant.reservedStock ??= 0;

        variant.reservedStock = Math.max(
          0,
          variant.reservedStock - item.quantity,
        );

        product.variants = [...product.variants];
        await manager.save(product);
      }

      // 🔥 CANCEL ORDER
      order.orderStatus = OrderStatus.CANCELLED;
      order.paymentStatus = PaymentStatus.FAILED;
      order.cancelledAt = new Date();
      order.cancelReason = 'VNPay payment timeout';

      await manager.save(order);

      this.logger.log(`Order ${orderCode} auto-cancelled successfully`);
    });
  }
}
