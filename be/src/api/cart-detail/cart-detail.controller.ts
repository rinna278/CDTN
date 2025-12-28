import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartDetailService } from './cart-detail.service';
import { CreateCartDetailDto } from './dto/create-cart-detail.dto';
import { UpdateCartDetailDto } from './dto/update-cart-detail.dto';

@Controller('cart-details')
export class CartDetailController {
  constructor(private readonly cartDetailService: CartDetailService) {}

  // Tạo mới chi tiết giỏ hàng
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCartDetailDto: CreateCartDetailDto) {
    return await this.cartDetailService.create(createCartDetailDto);
  }

  // Lấy chi tiết giỏ hàng theo ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.cartDetailService.findOne(id);
  }

  // Lấy tất cả chi tiết của một giỏ hàng
  @Get('cart/:cartId')
  async findByCartId(@Param('cartId') cartId: string) {
    return await this.cartDetailService.findByCartId(cartId);
  }

  // Cập nhật chi tiết giỏ hàng
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCartDetailDto: UpdateCartDetailDto,
  ) {
    return await this.cartDetailService.update(id, updateCartDetailDto);
  }

  // Xóa chi tiết giỏ hàng
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.cartDetailService.remove(id);
  }
}
