// order.service.ts - PRODUCTION READY VERSION - FIXED
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
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
import {
  AdminRefundNotificationData,
  EmailQueueService,
  RefundRequestedEmailData,
} from '../queue/email-queue.service';
import { OrderQueueService } from '../queue/order-queue.service';
import { EmailService, OrderEmailData } from '../email/email.service';
import { UserEntity } from '../user/user.entity';
import { RequestRefundDto } from './dto/request-refund.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';

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

          // const variant = product.variants.find((v) => v.color === item.color);

          // if (!variant || variant.stock < item.quantity) {
          //   throw new BadRequestException(
          //     `Không đủ hàng cho ${item.productName} - ${item.color}. Còn lại: ${variant?.stock || 0}`,
          //   );
          // }
          if (!product) {
            throw new BadRequestException(
              `Sản phẩm không tồn tại: ${item.productName}`,
            );
          }

          const variant = product.variants.find((v) => v.color === item.color);
          if (!variant) {
            throw new BadRequestException(
              `Không tồn tại màu ${item.color} cho ${item.productName}`,
            );
          }

          // ensure reservedStock field exists
          if (typeof variant.reservedStock !== 'number') {
            variant.reservedStock = 0;
          }

          const available = (variant.stock || 0) - (variant.reservedStock || 0);

          if (available < item.quantity) {
            throw new BadRequestException(
              `Không đủ hàng cho ${item.productName} - ${item.color}. Còn lại: ${available}`,
            );
          }

          // RESERVE: tăng reservedStock, KHÔNG trừ stock thật
          variant.reservedStock += item.quantity;

          // assign back and persist product
          product.variants = [...product.variants];
          await manager.save(product);
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
          stockReserved: true,
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
        // COD: DON'T decrease stock here (we already reserved)
        // await this.productService.incrementSoldCount(
        //   item.productId,
        //   item.color,
        //   item.quantity,
        // );

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

  async commitOrderPayment(orderId: string): Promise<OrderEntity> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Load & lock order
      const order = await manager.findOne(OrderEntity, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // 2. Idempotency
      if (order.paymentStatus === PaymentStatus.PAID) {
        return order;
      }
      const items = await manager.find(OrderDetailEntity, {
        where: { orderId },
      });

      // 3. Commit stock
      for (const item of items) {
        const product = await manager.findOne(
          this.productService['productRepository'].target,
          {
            where: { id: item.productId },
            lock: { mode: 'pessimistic_write' },
          },
        );

        if (!product) {
          throw new BadRequestException(
            `Sản phẩm không tồn tại: ${item.productName}`,
          );
        }

        const variant = product.variants.find((v) => v.color === item.color);
        if (!variant) {
          throw new BadRequestException(
            `Không tồn tại màu ${item.color} cho ${item.productName}`,
          );
        }

        // default values
        variant.stock ??= 0;
        variant.reservedStock ??= 0;

        if (variant.reservedStock < item.quantity) {
          this.logger.warn(
            `reservedStock < quantity | product=${product.id}, color=${item.color}`,
          );
        }

        // TRỪ STOCK THẬT
        variant.stock = Math.max(0, variant.stock - item.quantity);

        // RELEASE RESERVE
        variant.reservedStock = Math.max(
          0,
          variant.reservedStock - item.quantity,
        );

        product.variants = [...product.variants];
        await manager.save(product);
      }

      // 4. Update order status
      order.paymentStatus = PaymentStatus.PAID;
      order.orderStatus = OrderStatus.CONFIRMED;
      order.paidAt = new Date();

      await manager.save(order);
      order.items = items;

      return order;
    });
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
    const responseCode = query.vnp_ResponseCode;

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
          await manager.save(order);
        }
        return order;
      }

      // Skip nếu đã paid rồi (idempotent)
      if (order.paymentStatus === PaymentStatus.PAID) {
        this.logger.log(`Order ${order.orderCode} already paid, skipping...`);
        return order;
      }

      // Chỉ lưu transaction info, commit stock làm chỗ khác
      order.paymentTransactionId = verifyResult.data.transactionNo;
      await manager.save(order);

      return order;
    });

    // 3. Reload full order
    const fullOrder = await this.orderRepository.findOne({
      where: { id: order.id },
      relations: ['items', 'user'],
    });

    if (!fullOrder) {
      throw new NotFoundException('Order not found after callback');
    }

    // 4. XỬ LÝ THEO TRẠNG THÁI
    if (responseCode === '00') {
      // 🔥 PAYMENT SUCCESS

      // Commit stock + update orderStatus/paymentStatus
      await this.commitOrderPayment(fullOrder.id);

      const paidOrder = await this.orderRepository.findOne({
        where: { id: fullOrder.id },
        relations: ['items', 'user'],
      });

      if (!paidOrder || !paidOrder.items) {
        throw new InternalServerErrorException('Paid order data invalid');
      }
      // Cancel auto-cancel job
      this.orderQueueService.cancelAutoCancelJob(orderId).catch(() => {});

      // Xóa cart items
      const cart = await this.cartService.getCart(paidOrder.userId);
      for (const item of paidOrder.items) {
        const cartItem = cart.items.find(
          (ci) => ci.productId === item.productId && ci.color === item.color,
        );
        if (cartItem) {
          await this.cartService.removeCartItem(paidOrder.userId, cartItem.id);
        }
      }

      // Gửi email thanh toán thành công
      this.sendPaymentSuccessEmail(paidOrder).catch((error) => {
        this.logger.error('Failed to send payment success email:', error);
      });

      return this.transformToResponse(paidOrder);
    }

    // 🔥 PAYMENT FAILED
    if (responseCode !== '00') {
      // Không cancel auto-cancel
      // Không release stock (auto-cancel sẽ làm)
      // Không xóa cart

      if (fullOrder.user?.email) {
        this.emailQueueService
          .addPaymentFailedEmailJob({
            email: fullOrder.user.email,
            orderCode: fullOrder.orderCode,
            cancelReason: `Thanh toán thất bại - Mã lỗi: ${responseCode}`,
            totalAmount: Number(fullOrder.totalAmount),
            cancelledAt: new Date(),
            isPaid: false,
            isAutoCancel: false,
          })
          .catch((error) => {
            this.logger.error('Failed to send payment failure email:', error);
          });
      }

      return this.transformToResponse(fullOrder);
    }

    // fallback (không bao giờ vào)
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
   * ✅ FIXED: Handle stock commit for COD orders
   */
  /**
   * Update order status with transaction
   * ✅ FIXED: Properly restore stock when cancelling orders
   */
  async updateStatus(
    id: string,
    updateDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      // 🔒 Bước 1: Lock order trước (KHÔNG load relations)
      const order = await manager.findOne(OrderEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException(ERROR_ORDER.ORDER_NOT_FOUND.MESSAGE);
      }

      // ✅ Bước 2: Load relations SAU khi đã lock
      const fullOrder = await manager.findOne(OrderEntity, {
        where: { id },
        relations: ['items', 'user'],
      });

      // Merge data
      Object.assign(order, {
        items: fullOrder.items,
        user: fullOrder.user,
      });

      // 🔥 LƯU LẠI TRẠNG THÁI CŨ TRƯỚC KHI THAY ĐỔI (QUAN TRỌNG!)
      const oldOrderStatus = order.orderStatus;
      const oldPaymentStatus = order.paymentStatus;

      // Validate status transition
      const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.orderStatus];
      if (!allowedTransitions.includes(updateDto.status)) {
        throw new BadRequestException(
          ERROR_ORDER.INVALID_STATUS_TRANSITION.MESSAGE,
        );
      }

      // Cập nhật trạng thái mới
      order.orderStatus = updateDto.status;

      // 🔥 XỬ LÝ THEO TỪNG TRẠNG THÁI
      if (updateDto.status === OrderStatus.CONFIRMED) {
        // ✅ KHI XÁC NHẬN ĐƠN COD → COMMIT STOCK
        if (
          order.paymentMethod === PaymentMethod.COD &&
          oldPaymentStatus === PaymentStatus.PENDING
        ) {
          // Trừ stock thật + release reserved stock
          for (const item of order.items) {
            const product = await manager.findOne(
              this.productService['productRepository'].target,
              {
                where: { id: item.productId },
                lock: { mode: 'pessimistic_write' },
              },
            );

            if (!product) {
              throw new BadRequestException(
                `Sản phẩm không tồn tại: ${item.productName}`,
              );
            }

            const variant = product.variants.find(
              (v) => v.color === item.color,
            );
            if (!variant) {
              throw new BadRequestException(
                `Không tồn tại màu ${item.color} cho ${item.productName}`,
              );
            }

            // Default values
            variant.stock ??= 0;
            variant.reservedStock ??= 0;

            // TRỪ STOCK THẬT
            variant.stock = Math.max(0, variant.stock - item.quantity);

            // RELEASE RESERVE
            variant.reservedStock = Math.max(
              0,
              variant.reservedStock - item.quantity,
            );

            product.variants = [...product.variants];
            await manager.save(product);
          }

          this.logger.log(
            `✅ Stock committed for COD order ${order.orderCode} (CONFIRMED)`,
          );
        }
      } else if (updateDto.status === OrderStatus.SHIPPING) {
        order.shippedAt = new Date();
      } else if (updateDto.status === OrderStatus.DELIVERED) {
        order.deliveredAt = new Date();

        // ✅ ĐÃ GIAO HÀNG → ĐÁNH DẤU ĐÃ THANH TOÁN (CHỈ CHO COD)
        if (order.paymentMethod === PaymentMethod.COD) {
          order.paymentStatus = PaymentStatus.PAID;
          order.paidAt = new Date();
        }
      } else if (updateDto.status === OrderStatus.CANCELLED) {
        order.cancelledAt = new Date();
        order.cancelReason = updateDto.reason;

        // Cancel auto-cancel job
        this.orderQueueService.cancelAutoCancelJob(id).catch((error) => {
          this.logger.error('Failed to cancel auto-cancel job:', error);
        });

        // 🔥 CHECK ĐIỀU KIỆN RESTORE STOCK - DÙNG TRẠNG THÁI CŨ!
        const shouldRestoreStock =
          oldPaymentStatus === PaymentStatus.PAID ||
          (order.paymentMethod === PaymentMethod.COD &&
            oldOrderStatus === OrderStatus.CONFIRMED);

        this.logger.log(`🔍 [CANCEL ORDER] ${order.orderCode}:
        - Payment Method: ${order.paymentMethod}
        - Old Order Status: ${oldOrderStatus}
        - Old Payment Status: ${oldPaymentStatus}
        - Should Restore Stock: ${shouldRestoreStock}
      `);

        // 🔥 LUÔN RELEASE RESERVED STOCK CHO MỌI ĐƠN
        for (const item of order.items) {
          this.logger.log(
            `📦 Releasing reserved stock: ${item.productName} - ${item.color} x${item.quantity}`,
          );
          await this.productService.releaseReservedStock(
            item.productId,
            item.color,
            item.quantity,
          );
        }

        // ✅ RESTORE STOCK THẬT NẾU ĐÃ TRỪ STOCK (đã thanh toán hoặc đã confirm COD)
        if (shouldRestoreStock) {
          this.logger.log(`✅ [RESTORING STOCK] for order ${order.orderCode}`);

          for (const item of order.items) {
            this.logger.log(
              `📈 Restoring stock: ${item.productName} - ${item.color} x${item.quantity}`,
            );

            await this.productService.updateVariantStock(
              item.productId,
              item.color,
              item.quantity, // Cộng lại số lượng
            );
          }

          this.logger.log(
            `✅ Stock restored successfully for order ${order.orderCode}`,
          );
        } else {
          this.logger.log(
            `⏭️  [SKIP RESTORE] Order ${order.orderCode} - Stock was not deducted yet (only reserved)`,
          );
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
              isPaid: oldPaymentStatus === PaymentStatus.PAID,
              isAutoCancel: false,
            })
            .catch((error) => {
              this.logger.error('Failed to send cancellation email:', error);
            });
        }
      }

      await manager.save(order);

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

    if (
      order.orderStatus === OrderStatus.DELIVERED &&
      order.paymentStatus === PaymentStatus.PAID &&
      !order.refundRequestedAt
    ) {
      const refundWindowMs = ORDER_CONST.REFUND_WINDOW_HOURS * 60 * 60 * 1000;
      const now = new Date();
      const deliveredTime = order.deliveredAt.getTime();
      const timeSinceDelivery = now.getTime() - deliveredTime;
      const remainingMs = refundWindowMs - timeSinceDelivery;

      response.refundWindowRemaining = Math.max(
        0,
        Math.floor(remainingMs / 1000),
      );
    }

    return response;
  }

  /**
   * ✅ User request refund
   */
  async requestRefund(
    orderId: string,
    userId: string,
    refundDto: RequestRefundDto,
  ): Promise<OrderResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      // 🔒 Lock order
      const order = await manager.findOne(OrderEntity, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException(ERROR_ORDER.ORDER_NOT_FOUND.MESSAGE);
      }

      // Load relations
      const fullOrder = await manager.findOne(OrderEntity, {
        where: { id: orderId },
        relations: ['items', 'user'],
      });

      Object.assign(order, {
        items: fullOrder.items,
        user: fullOrder.user,
      });

      // ✅ Validate ownership
      if (order.userId !== userId) {
        throw new BadRequestException(
          'Bạn chỉ có thể yêu cầu hoàn tiền đơn hàng của mình',
        );
      }

      // ✅ Validate status - chỉ cho phép DELIVERED
      if (order.orderStatus !== OrderStatus.DELIVERED) {
        throw new BadRequestException(
          'Chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã giao hàng thành công',
        );
      }

      // ✅ Validate payment status
      if (order.paymentStatus !== PaymentStatus.PAID) {
        throw new BadRequestException(
          'Đơn hàng chưa được thanh toán, không thể hoàn tiền',
        );
      }

      // ✅ Check if already requested
      if (order.refundRequestedAt) {
        throw new BadRequestException(
          'Bạn đã yêu cầu hoàn tiền cho đơn hàng này rồi',
        );
      }

      // ✅ Check refund window (72 hours)
      const refundWindowMs = ORDER_CONST.REFUND_WINDOW_HOURS * 60 * 60 * 1000;
      const now = new Date();
      const deliveredTime = order.deliveredAt.getTime();
      const timeSinceDelivery = now.getTime() - deliveredTime;

      if (timeSinceDelivery > refundWindowMs) {
        const hoursOver = Math.floor(
          (timeSinceDelivery - refundWindowMs) / (1000 * 60 * 60),
        );
        throw new BadRequestException(
          `Đã quá thời hạn yêu cầu hoàn tiền. Bạn chỉ có thể yêu cầu trong vòng ${ORDER_CONST.REFUND_WINDOW_HOURS}h sau khi nhận hàng (đã quá ${hoursOver}h)`,
        );
      }

      // ✅ Update order
      order.orderStatus = OrderStatus.REFUND_REQUESTED;
      order.refundReason = refundDto.reason;
      order.refundDescription = refundDto.description;
      order.refundRequestedAt = new Date();

      await manager.save(order);

      this.logger.log(
        `Refund requested for order ${order.orderCode} by user ${userId}`,
      );

      // 📧 Send email to user (confirmation)
      if (order.user?.email) {
        // ✅ Tạo data object với type RefundRequestedEmailData
        const emailData: RefundRequestedEmailData = {
          email: order.user.email,
          orderCode: order.orderCode,
          refundReason: order.refundReason,
          refundDescription: order.refundDescription,
          totalAmount: Number(order.totalAmount),
          requestedAt: order.refundRequestedAt,
        };

        this.emailQueueService
          .addRefundRequestedEmailJob(emailData)
          .catch((error) => {
            this.logger.error('Failed to send refund request email:', error);
          });
      }

      // 📧 Send notification to admin
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        // ✅ Tạo data object với type AdminRefundNotificationData
        const adminEmailData: AdminRefundNotificationData = {
          adminEmail,
          orderCode: order.orderCode,
          userName: order.recipientName,
          userEmail: order.user?.email || 'N/A',
          refundReason: order.refundReason,
          refundDescription: order.refundDescription,
          totalAmount: Number(order.totalAmount),
          orderId: order.id,
        };

        this.emailQueueService
          .addAdminRefundNotificationJob(adminEmailData)
          .catch((error) => {
            this.logger.error(
              'Failed to send admin refund notification:',
              error,
            );
          });
      }

      return this.transformToResponse(order);
    });
  }

  /**
   * ✅ Admin process refund (approve/reject)
   */
  async processRefund(
    orderId: string,
    processDto: ProcessRefundDto,
  ): Promise<OrderResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      // 🔒 Lock order
      const order = await manager.findOne(OrderEntity, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException(ERROR_ORDER.ORDER_NOT_FOUND.MESSAGE);
      }

      // Load relations
      const fullOrder = await manager.findOne(OrderEntity, {
        where: { id: orderId },
        relations: ['items', 'user'],
      });

      Object.assign(order, {
        items: fullOrder.items,
        user: fullOrder.user,
      });

      // ✅ Validate status
      if (order.orderStatus !== OrderStatus.REFUND_REQUESTED) {
        throw new BadRequestException(
          `Đơn hàng không trong trạng thái chờ hoàn tiền. Trạng thái hiện tại: ${order.orderStatus}`,
        );
      }

      if (processDto.action === 'approve') {
        // ✅ APPROVE REFUND
        order.orderStatus = OrderStatus.REFUNDED;
        order.paymentStatus = PaymentStatus.REFUNDED;
        order.refundedAt = new Date();
        order.adminRefundNote =
          processDto.adminNote || 'Yêu cầu hoàn tiền được chấp nhận';

        // 📦 Restore stock (trả lại hàng vào kho)
        for (const item of order.items) {
          await this.productService.updateVariantStock(
            item.productId,
            item.color,
            item.quantity, // Cộng lại số lượng
          );
        }

        await manager.save(order);

        this.logger.log(`Refund approved for order ${order.orderCode}`);

        // 📧 Send refund success email to user
        if (order.user?.email) {
          this.emailQueueService
            .addRefundApprovedEmailJob({
              email: order.user.email,
              orderCode: order.orderCode,
              totalAmount: Number(order.totalAmount),
              refundedAt: order.refundedAt,
              adminNote: order.adminRefundNote,
              paymentMethod: order.paymentMethod,
            })
            .catch((error) => {
              this.logger.error('Failed to send refund approved email:', error);
            });
        }
      } else {
        // ✅ REJECT REFUND
        order.orderStatus = OrderStatus.DELIVERED; // Trở về trạng thái delivered
        order.adminRefundNote =
          processDto.adminNote || 'Yêu cầu hoàn tiền bị từ chối';

        await manager.save(order);

        this.logger.log(`Refund rejected for order ${order.orderCode}`);

        // 📧 Send refund rejected email to user
        if (order.user?.email) {
          this.emailQueueService
            .addRefundRejectedEmailJob({
              email: order.user.email,
              orderCode: order.orderCode,
              totalAmount: Number(order.totalAmount),
              rejectedReason:
                processDto.adminNote || 'Không đủ điều kiện hoàn tiền',
              rejectedAt: new Date(),
            })
            .catch((error) => {
              this.logger.error('Failed to send refund rejected email:', error);
            });
        }
      }

      return this.transformToResponse(order);
    });
  }
}
