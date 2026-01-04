// order.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { OrderEmailData } from '../email/email.service';
import { UserEntity } from '../user/user.entity';
// import { VNPayHelper } from 'src/share/helper/vnpay.helper';

@Injectable()
export class OrderService {
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

  /**
   * Tính thời gian còn lại trước khi order hết hạn
   * Order hết hạn sau 24 giờ kể từ lúc tạo (nếu chưa thanh toán)
   */
  private calculateExpirationTime(order: OrderEntity) {
    // Chỉ tính hết hạn cho order PENDING chưa thanh toán
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

  // Generate order code: ORD-20240101-0001
  private async generateOrderCode(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    const lastOrder = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.orderCode LIKE :pattern', { pattern: `ORD-${dateStr}-%` })
      .orderBy('order.createdAt', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderCode.split('-').pop());
      sequence = lastSequence + 1;
    }

    return `ORD-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }

  // Tính shipping fee (có thể custom logic)
  private calculateShippingFee(city: string, totalAmount: number): number {
    // Logic đơn giản: free ship nếu > 500k, không thì 30k
    if (totalAmount >= 500000) return 0;

    // Phí ship theo thành phố (có thể lấy từ config/database)
    const shippingRates = {
      'Hồ Chí Minh': 30000,
      'Hà Nội': 30000,
      'Đà Nẵng': 35000,
    };

    return shippingRates[city] || 40000; // Default 40k cho tỉnh xa
  }

  // Tạo đơn hàng
  async createOrder(
    userId: string,
    createDto: CreateOrderDto,
  ): Promise<OrderResponseDto | { paymentUrl: string; orderId: string }> {
    // 1. Lấy cart
    const cart = await this.cartService.getCart(userId);

    const checkedItems = cart.items?.filter((item) => item.isChecked) || [];

    if (checkedItems.length === 0) {
      throw new BadRequestException(
        'Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng',
      );
    }

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException(ERROR_ORDER.CART_EMPTY.MESSAGE);
    }

    // 2. Lấy địa chỉ
    const address = await this.addressService.findOne(
      createDto.addressId,
      userId,
    );

    // 3. Validate stock cho tất cả items
    for (const item of cart.items) {
      const variant = await this.productService.getVariantByColor(
        item.productId,
        item.color,
      );

      if (variant.stock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for ${item.productName} - ${item.color}. Available: ${variant.stock}`,
        );
      }
    }

    // 4. Tính toán
    const subtotal = checkedItems.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );
    const totalItems = checkedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const discountAmount = 0;
    const shippingFee = this.calculateShippingFee(address.city, subtotal);
    const totalAmount = subtotal - discountAmount + shippingFee;

    // 5. Generate order code
    const orderCode = await this.generateOrderCode();

    // 6. Tạo order
    const order = this.orderRepository.create({
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

    // 7. Save order trước (để có orderId)
    const savedOrder = await this.orderRepository.save(order);

    // 8. Tạo order details với orderId
    const orderDetails = checkedItems.map((item) =>
      this.orderDetailRepository.create({
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

    // 9. Save order details
    await this.orderDetailRepository.save(orderDetails);

    // 10. Load lại order với items
    const completeOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['items'],
    });

    // 11. Xử lý theo payment method
    if (createDto.paymentMethod === PaymentMethod.COD) {
      for (const item of checkedItems) {
        await this.productService.incrementSoldCount(
          item.productId,
          item.color,
          item.quantity,
        );

        // Xóa item khỏi cart
        await this.cartService.removeCartItem(userId, item.id);
      }

      // TODO: Send email confirmation
      try {
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        const emailData = this.prepareOrderEmailData(completeOrder, user.email);
        await this.emailQueueService.addOrderConfirmationEmailJob(emailData);
      } catch (error) {
        console.error('Failed to queue order confirmation email:', error);
        // Don't block order creation if email fails
      }

      return this.transformToResponse(completeOrder);
    } else if (createDto.paymentMethod === PaymentMethod.VNPAY) {
      // VNPay: Tạo payment URL, chưa giảm stock
      const paymentUrl = await this.createVNPayPaymentUrl(completeOrder);

      // SCHEDULE AUTO-CANCEL AFTER 24H (THÊM MỚI)
      try {
        await this.orderQueueService.scheduleAutoCancelOrder(
          completeOrder.id,
          completeOrder.orderCode,
        );
      } catch (error) {
        console.error('Failed to schedule auto-cancel job:', error);
        // Don't block order creation
      }

      // GỬI EMAIL VỚI CẢNH BÁO 24H (THÊM MỚI)
      try {
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        const emailData = this.prepareOrderEmailData(completeOrder, user.email);
        await this.emailQueueService.addOrderConfirmationEmailJob(emailData);
      } catch (error) {
        console.error('Failed to queue order confirmation email:', error);
      }

      return {
        paymentUrl,
        orderId: completeOrder.id,
      };
    }

    // Các payment method khác...
    throw new BadRequestException('Payment method not supported yet');
  }

  // Tạo VNPay payment URL
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
      ipAddr: '127.0.0.1', // TODO: Get from request
      locale: 'vn',
    });

    return paymentUrl;
  }

  // Xử lý VNPay callback
  async handleVNPayCallback(query: any): Promise<OrderResponseDto> {
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
    const verifyResult = vnpay.verifyReturnUrl(query);

    if (!verifyResult.isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    const orderId = verifyResult.data.orderId;
    const order = await this.findOne(orderId);

    if (query.vnp_ResponseCode === '00') {
      // Payment thành công
      order.paymentStatus = PaymentStatus.PAID;
      order.orderStatus = OrderStatus.CONFIRMED;
      order.paidAt = new Date();
      order.paymentTransactionId = verifyResult.data.transactionNo;

      await this.orderRepository.save(order);

      try {
        await this.orderQueueService.cancelAutoCancelJob(orderId);
      } catch (error) {
        console.error('Failed to cancel auto-cancel job:', error);
      }
      // Giảm stock
      for (const item of order.items) {
        await this.productService.incrementSoldCount(
          item.productId,
          item.color,
          item.quantity,
        );
      }

      // Clear cart
      const cart = await this.cartService.getCart(order.userId);
      for (const orderItem of order.items) {
        const cartItem = cart.items.find(
          (ci) =>
            ci.productId === orderItem.productId &&
            ci.color === orderItem.color,
        );
        if (cartItem) {
          await this.cartService.removeCartItem(order.userId, cartItem.id);
        }
      }

      try {
        const user = await this.userRepository.findOne({
          where: { id: order.userId },
        });
        const emailData = this.prepareOrderEmailData(order, user.email);
        await this.emailQueueService.addOrderConfirmationEmailJob(emailData);
      } catch (error) {
        console.error('Failed to queue payment confirmation email:', error);
      }

      return this.transformToResponse(order);
    } else {
      // Payment thất bại
      order.paymentStatus = PaymentStatus.FAILED;
      await this.orderRepository.save(order);

      throw new BadRequestException(`Payment failed: ${verifyResult.message}`);
    }
  }

  // Lấy danh sách orders của user
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

  // Lấy tất cả orders (Admin)
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

  // Lấy order detail
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

  // Update order status (Admin)
  async updateStatus(
    id: string,
    updateDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.findOne(id);

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
      order.paymentStatus = PaymentStatus.PAID; // Auto mark as paid when delivered (for COD)
      order.paidAt = new Date();
    } else if (updateDto.status === OrderStatus.CANCELLED) {
      order.cancelledAt = new Date();
      order.cancelReason = updateDto.reason;

      try {
        await this.orderQueueService.cancelAutoCancelJob(id);
      } catch (error) {
        console.error('Failed to cancel auto-cancel job:', error);
      }

      // Hoàn stock nếu đã giảm
      if (order.paymentStatus === PaymentStatus.PAID) {
        for (const item of order.items) {
          await this.productService.updateVariantStock(
            item.productId,
            item.color,
            item.quantity, // Cộng lại
          );
        }
      }
    }

    await this.orderRepository.save(order);

    return this.transformToResponse(order);
  }

  // Cancel order (User)
  async cancelOrder(
    id: string,
    userId: string,
    cancelDto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.findOne(id);

    // Chỉ user sở hữu mới được cancel
    if (order.userId !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    // Chỉ cancel được khi PENDING hoặc CONFIRMED
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

  // Update shipping info (Admin)
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

  // Transform to response DTO
  private transformToResponse(order: OrderEntity): OrderResponseDto {
    const response = plainToInstance(OrderResponseDto, order, {
      excludeExtraneousValues: true,
    });

    // Thêm thông tin thời gian hết hạn
    response.expirationTime = this.calculateExpirationTime(order);

    return response;
  }
}
