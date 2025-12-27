import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { API_CONFIG } from '../../configs/constant.config';
import { GetUser } from '../../share/decorator/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { ParamIdBaseDto } from '../../share/common/dto/query-param.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller({
  version: [API_CONFIG.VERSION_V1],
  path: 'cart',
})
@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // @ApiOkResponse(CART_SWAGGER_RESPONSE.GET_SUCCESS)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getCart(@GetUser('id') userId: string): Promise<CartResponseDto> {
    return this.cartService.getCart(userId);
  }

  // @ApiOkResponse(CART_SWAGGER_RESPONSE.ADD_ITEM_SUCCESS)
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  async addToCart(
    @GetUser('id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  // @ApiOkResponse(CART_SWAGGER_RESPONSE.UPDATE_ITEM_SUCCESS)
  @Patch('items/:id')
  @HttpCode(HttpStatus.OK)
  async updateCartItem(
    @GetUser('id') userId: string,
    @Param() param: ParamIdBaseDto,
    @Body() updateDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateCartItem(userId, param.id, updateDto);
  }

  // @ApiOkResponse(CART_SWAGGER_RESPONSE.REMOVE_ITEM_SUCCESS)
  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCartItem(
    @GetUser('id') userId: string,
    @Param() param: ParamIdBaseDto,
  ): Promise<boolean> {
    return this.cartService.removeCartItem(userId, param.id);
  }

  // @ApiOkResponse(CART_SWAGGER_RESPONSE.CLEAR_CART_SUCCESS)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@GetUser('id') userId: string): Promise<boolean> {
    return this.cartService.clearCart(userId);
  }
}
