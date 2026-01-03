// order.controller.ts
import {
  Body,
  Controller,
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

@Controller({
  version: [API_CONFIG.VERSION_V1],
  path: 'orders',
})
@ApiTags('Orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

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
    if (order.userId !== user.id) {
      throw new Error('Unauthorized');
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

  @ApiOperation({
    summary: 'VNPay payment callback',
    description: 'Endpoint để VNPay callback sau khi thanh toán',
  })
  @Get('payment/vnpay-callback')
  @HttpCode(HttpStatus.OK)
  async vnpayCallback(@Query() query: any) {
    return this.orderService.handleVNPayCallback(query);
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
}
