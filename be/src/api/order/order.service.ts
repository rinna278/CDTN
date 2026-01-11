// order.service.ts - PRODUCTION READY VERSION - FIXED
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderEntity } from './order.entity';
import { OrderDetailEntity } from '../order-detail/order-detail.entity';
import { CartService } from '../cart/cart.service';
import { AddressService } from '../user/address.service';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { plainToInstance } from 'class-transformer';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ORDER_STATUS_TRANSITIONS,
  ERROR_ORDER,
  ORDER_CONST,
} from './order.constant';
import { EmailQueueService } from '../queue/email-queue.service';
import { OrderQueueService } from '../queue/order-queue.service';
import { EmailService, OrderEmailData } from '../email/email.service';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderDetailEntity)
    private readonly orderDetailRepository: Repository<OrderDetailEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly cartService: CartService,
    private readonly addressService: AddressService,
    private readonly productService: ProductService,
    private readonly emailQueueService: EmailQueueService,
    private readonly orderQueueService: OrderQueueService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
  ) {}

  private prepareOrderEmailData(
    order: OrderEntity,
    userEmail: string,
  ): OrderEmailData {
    const paymentMethodMap = {
      cod: 'Thanh toán khi nhận hàng (COD)',
      vnpay: 'VNPay',
      momo: 'MoMo',
      zalopay: 'ZaloPay',
      bank_transfer: 'Chuyển khoản ngân hàng',
    };

    return {
      email: userEmail,
      orderCode: order.orderCode,
      recipientName: order.recipientName,
      phoneNumber: order.phoneNumber,
      street: order.street,
      ward: order.ward,
      district: order.district,
      city: order.city,
      items: order.items.map((item) => ({
        productName: item.productName,
        productImage: item.productImage,
        color: item.color,
        quantity: item.quantity,
        price: Number(item.price),
        discount: item.discount,
        subtotal: Number(item.subtotal),
      })),
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      discountCode: order.discountCode,
      shippingFee: Number(order.shippingFee),
      totalAmount: Number(order.totalAmount),
      paymentMethod: order.paymentMethod,
      paymentMethodText:
        paymentMethodMap[order.paymentMethod] || order.paymentMethod,
      isPaid: order.paymentStatus === PaymentStatus.PAID,
      isVNPay: order.paymentMethod === PaymentMethod.VNPAY,
      notes: order.notes,
      trackingUrl: `${process.env.FRONTEND_URL}/orders/${order.id}`,
    };
  }

  private calculateExpirationTime(order: OrderEntity) {
    if (
      order.orderStatus !== OrderStatus.PENDING ||
      order.paymentStatus === PaymentStatus.PAID
    ) {
      return null;
    }

    const expiresAt = new Date(
      order.createdAt.getTime() + ORDER_CONST.EXPIRATION_TIME,
    );
    const now = new Date();
    const remainingMs = expiresAt.getTime() - now.getTime();
    const isExpired = remainingMs <= 0;

    return {
      remainingSeconds: Math.max(0, Math.floor(remainingMs / 1000)),
      remainingMinutes: Math.max(0, Math.floor(remainingMs / (1000 * 60))),
      remainingHours: Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60))),
      isExpired,
      expiresAt,
    };
  }

  private async generateOrderCode(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    // Use transaction to prevent race condition
    return await this.dataSource.transaction(async (manager) => {
      const lastOrder = await manager
        .createQueryBuilder(OrderEntity, 'order')
        .where('order.orderCode LIKE :pattern', {
          pattern: `ORD-${dateStr}-%`,
        })
        .orderBy('order.createdAt', 'DESC')
        .setLock('pessimistic_write')
        .getOne();

      let sequence = 1;
      if (lastOrder) {
        const lastSequence = parseInt(lastOrder.orderCode.split('-').pop());
        sequence = lastSequence + 1;
      }

      return `ORD-${dateStr}-${sequence.toString().padStart(4, '0')}`;
    });
  }

  private calculateShippingFee(city: string, totalAmount: number): number {
    if (totalAmount >= 500000) return 0;

    const shippingRates = {
      'Hồ Chí Minh': 30000,
      'Hà Nội': 30000,
      'Đà Nẵng': 35000,
    };

    return shippingRates[city] || 40000;
  }

  /**
   * Create order with transaction and proper stock management
   */
  async createOrder(
    userId: string,
    createDto: CreateOrderDto,
  ): Promise<OrderResponseDto | { paymentUrl: string; orderId: string }> {
    // 1. Get cart OUTSIDE transaction
    const cart = await this.cartService.getCart(userId);
    const selectedItems = cart.items.filter((item) =>
      createDto.cartItemIds.includes(item.id),
    );

    if (selectedItems.length === 0) {
      throw new BadRequestException(
        'Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng',
      );
    }

    if (selectedItems.length !== createDto.cartItemIds.length) {
      throw new BadRequestException('Có sản phẩm không hợp lệ trong giỏ hàng');
    }

    // 2. Get address OUTSIDE transaction
    const address = await this.addressService.findOne(
      createDto.addressId,
      userId,
    );

    // 3. Calculate totals OUTSIDE transaction
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );
    const totalItems = selectedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const discountAmount = 0;
    const shippingFee = this.calculateShippingFee(address.city, subtotal);
    const totalAmount = subtotal - discountAmount + shippingFee;

    // 4. Start transaction ONLY for critical operations
    const { completeOrder } = await this.dataSource.transaction(
      async (manager) => {
        // Validate stock with pessimistic lock
        for (const item of selectedItems) {
          const product = await manager.findOne(
            this.productService['productRepository'].target,
            {
              where: { id: item.productId },
              lock: { mode: 'pessimistic_write' },
            },
          );

          const variant = product.variants.find((v) => v.color === item.color);

          if (!variant || variant.stock < item.quantity) {
            throw new BadRequestException(
              `Không đủ hàng cho ${item.productName} - ${item.color}. Còn lại: ${variant?.stock || 0}`,
            );
          }
        }

        // Generate order code
        const orderCode = await this.generateOrderCode();

        // Create order
        const order = manager.create(OrderEntity, {
          orderCode,
          userId,
          recipientName: address.recipientName,
          phoneNumber: address.phoneNumber,
          street: address.street,
          ward: address.ward,
          district: address.district,
          city: address.city,
          notes: createDto.notes,
          totalItems,
          subtotal,
          discountAmount,
          discountCode: createDto.discountCode,
          shippingFee,
          totalAmount,
          paymentMethod: createDto.paymentMethod,
          orderStatus: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
        });

        const savedOrder = await manager.save(order);

        // Create order details
        const orderDetails = selectedItems.map((item) =>
          manager.create(OrderDetailEntity, {
            orderId: savedOrder.id,
            productId: item.productId,
            productName: item.productName,
            color: item.color,
            productImage: item.productImage,
            price: item.price,
            discount: item.discount,
            quantity: item.quantity,
            subtotal: item.subtotal,
          }),
        );

        await manager.save(orderDetails);

        // Load complete order
        const completeOrder = await manager.findOne(OrderEntity, {
          where: { id: savedOrder.id },
          relations: ['items'],
        });

        return { completeOrder };
      },
    );

    // 5. Post-transaction operations (OUTSIDE transaction)
    if (createDto.paymentMethod === PaymentMethod.COD) {
      // COD: Decrease stock immediately
      for (const item of selectedItems) {
        await this.productService.incrementSoldCount(
          item.productId,
          item.color,
          item.quantity,
        );

        // Remove from cart
        await this.cartService.removeCartItem(userId, item.id);
      }

      // Send confirmation email (async, don't block)
      this.sendOrderConfirmationEmail(completeOrder, userId).catch((error) => {
        this.logger.error('Failed to send COD confirmation email:', error);
      });

      return this.transformToResponse(completeOrder);
    } else if (createDto.paymentMethod === PaymentMethod.VNPAY) {
      // VNPay: Don't decrease stock yet, wait for payment
      // Don't remove cart items yet

      // Create payment URL
      const paymentUrl = await this.createVNPayPaymentUrl(completeOrder);

      // Schedule auto-cancel after 24h (async, don't block)
      this.orderQueueService
        .scheduleAutoCancelOrder(completeOrder.id, completeOrder.orderCode)
        .catch((error) => {
          this.logger.error('Failed to schedule auto-cancel:', error);
        });

      // Send confirmation email (async, don't block)
      this.sendOrderConfirmationEmail(completeOrder, userId).catch((error) => {
        this.logger.error('Failed to send VNPay confirmation email:', error);
      });

      return {
        paymentUrl,
        orderId: completeOrder.id,
      };
    }

    throw new BadRequestException('Payment method not supported yet');
  }

  private async createVNPayPaymentUrl(order: OrderEntity): Promise<string> {
    const { VNPayHelper } = await import('../../share/helper/vnpay.helper');

    const vnpayConfig = {
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
      vnp_Url:
        process.env.VNPAY_URL ||
        'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      vnp_ReturnUrl: `${process.env.FRONTEND_URL}/order/payment-callback`,
    };

    const vnpay = new VNPayHelper(vnpayConfig);

    const paymentUrl = vnpay.createPaymentUrl({
      orderId: order.id,
      amount: order.totalAmount,
      orderInfo: `Thanh toan don hang ${order.orderCode}`,
      orderType: 'billpayment',
      ipAddr: '127.0.0.1',
      locale: 'vn',
    });

    return paymentUrl;
  }

  /**
   * ✅ Handle VNPay callback - FIXED VERSION
   */
  async handleVNPayCallback(query: any): Promise<OrderResponseDto> {
    const { VNPayHelper } = await import('../../share/helper/vnpay.helper');

    const vnpay = new VNPayHelper({
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
      vnp_Url: process.env.VNPAY_URL!,
      vnp_ReturnUrl: `${process.env.FRONTEND_URL}/order/payment-callback`,
    });

    const verifyResult = vnpay.verifyReturnUrl(query);

    if (!verifyResult.isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    const orderId = verifyResult.data.orderId;

    // Transaction chỉ update DB
    const order = await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(OrderEntity, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) throw new NotFoundException('Order not found');

      const expectedAmount = Number(order.totalAmount);
      const paidAmount = verifyResult.data.amount;

      if (Math.abs(expectedAmount - paidAmount) > 1) {
        throw new BadRequestException('Payment amount mismatch');
      }

      // 🔥 PAYMENT FAILED - CHỈ CẬP NHẬT TRẠNG THÁI, KHÔNG HỦY ĐƠN
      if (query.vnp_ResponseCode !== '00') {
        // ✅ Chỉ đánh dấu payment failed, GIỮ NGUYÊN orderStatus = PENDING
        if (order.paymentStatus !== PaymentStatus.FAILED) {
          order.paymentStatus = PaymentStatus.FAILED;
          // ❌ KHÔNG set orderStatus = CANCELLED
          // ❌ KHÔNG set cancelledAt
          // ❌ KHÔNG set cancelReason
          await manager.save(order);
        }
        return order;
      }

      // Skip nếu đã paid rồi (idempotent)
      if (order.paymentStatus === PaymentStatus.PAID) {
        this.logger.log(`Order ${order.orderCode} already paid, skipping...`);
        return order;
      }

      // 🔥 PAYMENT SUCCESS
      order.paymentStatus = PaymentStatus.PAID;
      order.orderStatus = OrderStatus.CONFIRMED;
      order.paidAt = new Date();
      order.paymentTransactionId = verifyResult.data.transactionNo;

      await manager.save(order);
      return order;
    });

    // Load full relations
    const fullOrder = await this.orderRepository.findOne({
      where: { id: order.id },
      relations: ['items', 'user'],
    });

    // 🔥 GỬI EMAIL DỰA VÀO TRẠNG THÁI
    if (fullOrder.paymentStatus === PaymentStatus.PAID) {
      // ✅ PAYMENT SUCCESS

      // Cancel auto-cancel job (vì đã thanh toán)
      this.orderQueueService.cancelAutoCancelJob(orderId).catch(() => {});

      // Giảm stock
      for (const item of fullOrder.items) {
        await this.productService.incrementSoldCount(
          item.productId,
          item.color,
          item.quantity,
        );
      }

      // Xóa giỏ hàng
      const cart = await this.cartService.getCart(fullOrder.userId);
      for (const item of fullOrder.items) {
        const cartItem = cart.items.find(
          (ci) => ci.productId === item.productId && ci.color === item.color,
        );
        if (cartItem) {
          await this.cartService.removeCartItem(fullOrder.userId, cartItem.id);
        }
      }

      // 📧 GỬI EMAIL PAYMENT SUCCESS
      this.sendPaymentSuccessEmail(fullOrder).catch((error) => {
        this.logger.error('Failed to send payment success email:', error);
      });
    } else if (fullOrder.paymentStatus === PaymentStatus.FAILED) {
      // ✅ PAYMENT FAILED - CHỈ THÔNG BÁO, KHÔNG HỦY ĐƠN

      // ❌ KHÔNG cancel auto-cancel job (vẫn để tự động hủy sau 24h)
      // ❌ KHÔNG restore stock (chưa trừ stock)
      // ❌ KHÔNG xóa cart (user có thể thanh toán lại)

      // 📧 GỬI EMAIL PAYMENT FAILED (thông báo thanh toán thất bại)
      if (fullOrder.user?.email) {
        this.emailQueueService
          .addPaymentFailedEmailJob({
            email: fullOrder.user.email,
            orderCode: fullOrder.orderCode,
            cancelReason: `Thanh toán thất bại - Mã lỗi: ${query.vnp_ResponseCode}`,
            totalAmount: Number(fullOrder.totalAmount),
            cancelledAt: new Date(), // Chỉ để hiển thị thời gian failed
            isPaid: false,
            isAutoCancel: false,
          })
          .catch((error) => {
            this.logger.error('Failed to send payment failure email:', error);
          });
      }
    }

    return this.transformToResponse(fullOrder);
  }

  /**
   * Send order confirmation email helper
   */
  private async sendOrderConfirmationEmail(
    order: OrderEntity,
    userId: string,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user?.email) {
        this.logger.warn(`No email found for user ${userId}`);
        return;
      }

      const emailData = this.prepareOrderEmailData(order, user.email);
      await this.emailQueueService.addOrderConfirmationEmailJob(emailData);
    } catch (error) {
      this.logger.error('Failed to queue order confirmation email:', error);
    }
  }

  /**
   * ✅ NEW: Send payment success email (riêng biệt với order confirmation)
   */
  private async sendPaymentSuccessEmail(order: OrderEntity): Promise<void> {
    try {
      if (!order.user?.email) {
        this.logger.warn(`No email found for order ${order.orderCode}`);
        return;
      }

      const emailData = this.prepareOrderEmailData(order, order.user.email);

      // 🔥 Gọi service method MỚI cho payment success
      await this.emailService.sendPaymentSuccessEmail({
        ...emailData,
        transactionId: order.paymentTransactionId,
        paidAt: order.paidAt,
      });
    } catch (error) {
      this.logger.error('Failed to send payment success email:', error);
    }
  }

  async findUserOrders(
    userId: string,
    query: QueryOrderDto,
  ): Promise<{
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, orderStatus, paymentStatus } = query;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.userId = :userId', { userId });

    if (orderStatus) {
      queryBuilder.andWhere('order.orderStatus = :orderStatus', {
        orderStatus,
      });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus,
      });
    }

    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders.map((order) => this.transformToResponse(order)),
      total,
      page,
      limit,
    };
  }

  async findAll(query: QueryOrderDto) {
    const {
      page = 1,
      limit = 10,
      orderStatus,
      paymentStatus,
      paymentMethod,
      orderCode,
    } = query;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.user', 'user');

    if (orderStatus) {
      queryBuilder.andWhere('order.orderStatus = :orderStatus', {
        orderStatus,
      });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus,
      });
    }

    if (paymentMethod) {
      queryBuilder.andWhere('order.paymentMethod = :paymentMethod', {
        paymentMethod,
      });
    }

    if (orderCode) {
      queryBuilder.andWhere('order.orderCode LIKE :orderCode', {
        orderCode: `%${orderCode}%`,
      });
    }

    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders.map((order) => this.transformToResponse(order)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'user'],
    });

    if (!order) {
      throw new NotFoundException(ERROR_ORDER.ORDER_NOT_FOUND.MESSAGE);
    }

    return order;
  }

  /**
   * Update order status with transaction
   */
  async updateStatus(
    id: string,
    updateDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(OrderEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException(ERROR_ORDER.ORDER_NOT_FOUND.MESSAGE);
      }

      // Validate status transition
      const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.orderStatus];
      if (!allowedTransitions.includes(updateDto.status)) {
        throw new BadRequestException(
          ERROR_ORDER.INVALID_STATUS_TRANSITION.MESSAGE,
        );
      }

      order.orderStatus = updateDto.status;

      // Update timestamps
      if (updateDto.status === OrderStatus.SHIPPING) {
        order.shippedAt = new Date();
      } else if (updateDto.status === OrderStatus.DELIVERED) {
        order.deliveredAt = new Date();
        order.paymentStatus = PaymentStatus.PAID;
        order.paidAt = new Date();
      } else if (updateDto.status === OrderStatus.CANCELLED) {
        order.cancelledAt = new Date();
        order.cancelReason = updateDto.reason;

        // Cancel auto-cancel job
        this.orderQueueService.cancelAutoCancelJob(id).catch((error) => {
          this.logger.error('Failed to cancel auto-cancel job:', error);
        });

        // Restore stock if already paid
        if (order.paymentStatus === PaymentStatus.PAID) {
          for (const item of order.items) {
            await this.productService.updateVariantStock(
              item.productId,
              item.color,
              item.quantity,
            );
          }
        }

        // Send cancellation email
        if (order.user?.email) {
          this.emailQueueService
            .addOrderCancellationEmailJob({
              email: order.user.email,
              orderCode: order.orderCode,
              cancelReason: order.cancelReason,
              totalAmount: Number(order.totalAmount),
              cancelledAt: order.cancelledAt,
              isPaid: order.paymentStatus === PaymentStatus.PAID,
              isAutoCancel: false,
            })
            .catch((error) => {
              this.logger.error('Failed to send cancellation email:', error);
            });
        }
      }

      await manager.save(order);

      //load data sau khi update
      const fullOrder = await manager.findOne(OrderEntity, {
        where: { id },
        relations: ['items', 'user'],
      });

      //thêm của Dũng
      if (updateDto.status === OrderStatus.CANCELLED) {
        this.orderQueueService.cancelAutoCancelJob(id).catch(() => {});

        if (fullOrder.paymentStatus === PaymentStatus.PAID) {
          for (const item of fullOrder.items) {
            await this.productService.updateVariantStock(
              item.productId,
              item.color,
              item.quantity,
            );
          }
        }

        if (fullOrder.user?.email) {
          this.emailQueueService.addOrderCancellationEmailJob({
            email: fullOrder.user.email,
            orderCode: fullOrder.orderCode,
            cancelReason: fullOrder.cancelReason,
            totalAmount: Number(fullOrder.totalAmount),
            cancelledAt: fullOrder.cancelledAt,
            isPaid: fullOrder.paymentStatus === PaymentStatus.PAID,
            isAutoCancel: false,
          });
        }
      }

      return this.transformToResponse(order);
    });
  }

  async cancelOrder(
    id: string,
    userId: string,
    cancelDto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.findOne(id);

    if (order.userId !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    if (
      ![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.orderStatus)
    ) {
      throw new BadRequestException(ERROR_ORDER.CANNOT_CANCEL.MESSAGE);
    }

    return this.updateStatus(id, {
      status: OrderStatus.CANCELLED,
      reason: cancelDto.reason,
    });
  }

  async updateShipping(
    id: string,
    updateDto: UpdateShippingDto,
  ): Promise<OrderResponseDto> {
    const order = await this.findOne(id);

    if (updateDto.shippingProvider) {
      order.shippingProvider = updateDto.shippingProvider;
    }

    if (updateDto.trackingNumber) {
      order.trackingNumber = updateDto.trackingNumber;
    }

    await this.orderRepository.save(order);

    return this.transformToResponse(order);
  }

  private transformToResponse(order: OrderEntity): OrderResponseDto {
    const response = plainToInstance(OrderResponseDto, order, {
      excludeExtraneousValues: true,
    });

    response.expirationTime = this.calculateExpirationTime(order);

    return response;
  }
}
