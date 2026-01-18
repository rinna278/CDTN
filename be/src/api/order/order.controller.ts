// order.controller.ts
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { API_CONFIG } from '../../configs/constant.config';
import { ParamIdBaseDto } from '../../share/common/dto/query-param.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { PermissionMetadata } from '../permission/permission.decorator';
import { PERMISSIONS } from '../permission/permission.constant';
import { PermissionGuard } from '../permission/permission.guard';
import { GetUser } from '../../share/decorator/get-user.decorator';
import { UserEntity } from '../user/user.entity';
import { OrderService } from './order.service';
import { OrderResponseDto } from './dto/order-response.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { RequestRefundDto } from './dto/request-refund.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { OrderStatus } from './order.constant';
import { QueryRevenueDto } from './dto/query-revenue.dto';
import { RevenueResponseDto } from './dto/revenue-response.dto';
import { QueryDashboardDto } from './dto/query-dashboard.dto';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Controller({
  version: [API_CONFIG.VERSION_V1],
  path: 'orders',
})
@ApiTags('Orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * VNPay callback endpoint - GET method
   * VNPay sẽ redirect user về URL này sau khi thanh toán
   */
  @ApiOperation({
    summary: 'VNPay callback (GET)',
    description: 'Frontend forward nguyên query params từ VNPay',
  })
  @ApiOkResponse({ type: OrderResponseDto })
  @Get('vnpay-callback')
  @HttpCode(HttpStatus.OK)
  async handleVNPayCallback(@Query() query: any) {
    console.log('📞 VNPay callback received (GET)');
    console.debug('Query params:', JSON.stringify(query, null, 2));

    return this.orderService.handleVNPayCallback(query);
  }

  // /**
  //  * VNPay callback endpoint - POST method
  //  * Dùng cho testing hoặc frontend call API
  //  */
  // @ApiOperation({
  //   summary: 'VNPay callback (POST)',
  //   description:
  //     'Frontend hoặc test tools gọi endpoint này với VNPay query params',
  // })
  // @ApiOkResponse({ type: OrderResponseDto })
  // @Post('vnpay-callback')
  // @HttpCode(HttpStatus.OK)
  // async handleVNPayCallbackPost(@Body() body: any) {
  //   console.log('📞 VNPay callback received (POST)');
  //   console.debug('Body params:', JSON.stringify(body, null, 2));

  //   try {
  //     const result = await this.orderService.handleVNPayCallback(body);
  //     console.log(`✅ Payment successful for order ${result.orderCode}`);
  //     return result;
  //   } catch (error) {
  //     console.error('❌ Payment callback error:', error.message);
  //     throw error;
  //   }
  // }
  // ========== USER ENDPOINTS ==========

  @ApiOperation({
    summary: 'Tạo đơn hàng từ giỏ hàng',
    description: 'COD: trả về order detail. Online payment: trả về payment URL',
  })
  @ApiOkResponse({
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createOrder(@Body() createDto: CreateOrderDto, @GetUser() user: UserEntity) {
    return this.orderService.createOrder(user.id, createDto);
  }

  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của user' })
  @ApiOkResponse({ type: [OrderResponseDto] })
  @Get('my-orders')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMyOrders(@Query() query: QueryOrderDto, @GetUser() user: UserEntity) {
    return this.orderService.findUserOrders(user.id, query);
  }

  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng' })
  @ApiOkResponse({ type: OrderResponseDto })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getOrder(
    @Param() param: ParamIdBaseDto,
    @GetUser() user: UserEntity,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.findOne(param.id);

    // User chỉ xem được order của mình
    if (!order || order.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return this.orderService['transformToResponse'](order);
  }

  @ApiOperation({ summary: 'Hủy đơn hàng' })
  @ApiOkResponse({ type: OrderResponseDto })
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  cancelOrder(
    @Param() param: ParamIdBaseDto,
    @Body() cancelDto: CancelOrderDto,
    @GetUser() user: UserEntity,
  ) {
    return this.orderService.cancelOrder(param.id, user.id, cancelDto);
  }

  /**
   * User yêu cầu hoàn tiền
   * Chỉ được yêu cầu trong vòng 72h sau khi nhận hàng
   */
  @ApiOperation({
    summary: 'Yêu cầu hoàn tiền',
    description:
      'Chỉ áp dụng cho đơn hàng đã giao (DELIVERED) trong vòng 72 giờ. Yêu cầu sẽ được admin xem xét.',
  })
  @ApiOkResponse({ type: OrderResponseDto })
  @Patch(':id/request-refund')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  requestRefund(
    @Param() param: ParamIdBaseDto,
    @Body() refundDto: RequestRefundDto,
    @GetUser() user: UserEntity,
  ) {
    return this.orderService.requestRefund(param.id, user.id, refundDto);
  }

  /**
   * ✅ Check if order can retry payment
   */
  @ApiOperation({
    summary: 'Kiểm tra đơn hàng có thể thanh toán lại không',
    description:
      'Trả về thông tin order có thể retry payment và thời gian còn lại',
  })
  @Get(':id/can-retry-payment')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async canRetryPayment(
    @Param() param: ParamIdBaseDto,
    @GetUser() user: UserEntity,
  ) {
    const order = await this.orderService.findOne(param.id);

    // Validate ownership
    if (order.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this order');
    }

    const canRetry = this.orderService.canRetryPayment(order);
    const expirationTime = this.orderService['calculateExpirationTime'](order);

    return {
      canRetry: canRetry.allowed,
      reason: canRetry.reason,
      orderCode: order.orderCode,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      expirationTime,
    };
  }

  /**
   * ✅ Retry payment for pending order
   */
  @ApiOperation({
    summary: 'Tạo link thanh toán mới cho đơn hàng',
    description:
      'User có thể tạo payment URL mới nếu đóng tab thanh toán hoặc thanh toán thất bại',
  })
  @Post(':id/retry-payment')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async retryPayment(
    @Param() param: ParamIdBaseDto,
    @GetUser() user: UserEntity,
  ): Promise<{ paymentUrl: string; orderId: string }> {
    return this.orderService.retryPayment(param.id, user.id);
  }

  // ========== ADMIN ENDPOINTS ==========

  @ApiOperation({ summary: '[ADMIN] Lấy tất cả đơn hàng' })
  @ApiOkResponse({ type: [OrderResponseDto] })
  @Get('admin/all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.ADMIN_CREATE)
  getAllOrders(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(query);
  }

  @ApiOperation({ summary: '[ADMIN] Lấy chi tiết đơn hàng' })
  @ApiOkResponse({ type: OrderResponseDto })
  @Get('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.ADMIN_CREATE)
  async getOrderAdmin(@Param() param: ParamIdBaseDto) {
    const order = await this.orderService.findOne(param.id);
    return this.orderService['transformToResponse'](order);
  }

  @ApiOperation({
    summary: '[ADMIN] Cập nhật trạng thái đơn hàng',
    description:
      'Chuyển trạng thái: pending → confirmed → processing → shipping → delivered',
  })
  @ApiOkResponse({ type: OrderResponseDto })
  @Patch('admin/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.ADMIN_CREATE)
  updateOrderStatus(
    @Param() param: ParamIdBaseDto,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(param.id, updateDto);
  }

  @ApiOperation({
    summary: '[ADMIN] Cập nhật thông tin vận chuyển',
    description: 'Cập nhật tracking number, shipping provider',
  })
  @ApiOkResponse({ type: OrderResponseDto })
  @Patch('admin/:id/shipping')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.ADMIN_CREATE)
  updateShipping(
    @Param() param: ParamIdBaseDto,
    @Body() updateDto: UpdateShippingDto,
  ) {
    return this.orderService.updateShipping(param.id, updateDto);
  }

  /**
   * Admin xử lý yêu cầu hoàn tiền
   */
  @ApiOperation({
    summary: '[ADMIN] Xử lý yêu cầu hoàn tiền',
    description:
      'Chấp nhận (approve) hoặc từ chối (reject) yêu cầu hoàn tiền từ khách hàng. Nếu approve, hệ thống sẽ tự động restore stock.',
  })
  @ApiOkResponse({ type: OrderResponseDto })
  @Patch('admin/:id/process-refund')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.ADMIN_CREATE)
  processRefund(
    @Param() param: ParamIdBaseDto,
    @Body() processDto: ProcessRefundDto,
  ) {
    return this.orderService.processRefund(param.id, processDto);
  }

  /**
   * [ADMIN] Lấy danh sách đơn hàng chờ hoàn tiền
   */
  @ApiOperation({ summary: '[ADMIN] Lấy danh sách đơn yêu cầu hoàn tiền' })
  @ApiOkResponse({ type: [OrderResponseDto] })
  @Get('admin/refund-requests')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.ADMIN_CREATE)
  getRefundRequests(@Query() query: QueryOrderDto) {
    return this.orderService.findAll({
      ...query,
      orderStatus: OrderStatus.REFUND_REQUESTED,
    });
  }

  @ApiOperation({
    summary: '[ADMIN] Lấy tổng doanh thu',
    description:
      'Thống kê doanh thu theo khung thời gian. Chỉ tính từ đơn hàng đã DELIVERED và đã qua 2 ngày (tránh trường hợp hoàn tiền trong 72h). Mặc định là tổng doanh thu từ trước tới giờ.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        totalRevenue: 15000000,
        totalOrders: 150,
        paidOrders: 120,
        pendingOrders: 20,
        cancelledOrders: 8,
        refundedOrders: 2,
        averageOrderValue: 125000,
        timeframe: 'all_time',
        revenueByPaymentMethod: {
          cod: 8000000,
          vnpay: 7000000,
          momo: 0,
          zalopay: 0,
          bank_transfer: 0,
        },
      },
    },
  })
  @Get('statistics/revenue')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.ADMIN_CREATE)
  async getTotalRevenue(
    @Query() query: QueryRevenueDto,
  ): Promise<RevenueResponseDto> {
    return this.orderService.getTotalRevenue(query);
  }

  @ApiOperation({
    summary: '[ADMIN] Lấy thống kê dashboard',
    description: `
    Trả về tất cả thống kê cho trang dashboard theo tháng/năm:
    - Doanh thu tháng được chọn + % so với tháng trước
    - Tổng đơn hàng tháng được chọn + % so với tháng trước
    - Giá trị TB đơn hàng + % so với tháng trước
    - Biểu đồ đơn hàng/doanh thu theo từng ngày trong tháng
    - Top 4 danh mục bán chạy nhất trong tháng
    
    Mặc định: tháng và năm hiện tại
    Lưu ý: Chỉ tính đơn hàng DELIVERED + đã qua 2 ngày
  `,
  })
  @ApiOkResponse({
    type: DashboardResponseDto,
    schema: {
      example: {
        month: 1,
        year: 2026,
        revenueStats: {
          currentMonth: 4800000,
          lastMonth: 4285714,
          percentageChange: 12,
        },
        orderStats: {
          currentMonth: 75,
          lastMonth: 69,
          percentageChange: 8,
        },
        averageOrderValue: {
          value: 64000,
          lastMonthValue: 62000,
          percentageChange: 3,
        },
        dailyOrderChart: [
          { date: '2026-01-01', orderCount: 3, revenue: 180000 },
          { date: '2026-01-02', orderCount: 5, revenue: 320000 },
        ],
        dailyRevenueChart: [
          { date: '2026-01-01', orderCount: 3, revenue: 180000 },
          { date: '2026-01-02', orderCount: 5, revenue: 320000 },
        ],
        topCategories: [
          {
            rank: 1,
            categoryName: 'Hoa Hồng Đỏ',
            soldCount: 245,
            revenue: 36750000,
          },
          {
            rank: 2,
            categoryName: 'Hoa Tulip Trắng',
            soldCount: 189,
            revenue: 22680000,
          },
          {
            rank: 3,
            categoryName: 'Hoa Cúc Vàng',
            soldCount: 156,
            revenue: 12480000,
          },
          {
            rank: 4,
            categoryName: 'Hoa Ly Trắng',
            soldCount: 98,
            revenue: 19600000,
          },
        ],
      },
    },
  })
  @Get('statistics/dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @PermissionMetadata(PERMISSIONS.ADMIN_CREATE)
  async getDashboardStats(
    @Query() query: QueryDashboardDto,
  ): Promise<DashboardResponseDto> {
    return this.orderService.getDashboardStats(query);
  }
}

