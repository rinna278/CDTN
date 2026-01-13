// cart.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../product/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartResponseDto, CartItemResponseDto } from './dto/cart-response.dto';
import { plainToInstance } from 'class-transformer';
import { CartEntity } from './cart.entity';
import { CartDetailEntity } from '../cart-detail/cart-detail.entity';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartDetailEntity)
    private readonly cartDetailRepository: Repository<CartDetailEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async getOrCreateCart(userId: string): Promise<CartEntity> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        totalItems: 0,
        totalPrice: 0,
      });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    return this.transformCartToResponse(cart);
  }

  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    const { productId, color, quantity } = addToCartDto;

    // Validate product tồn tại
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Tìm variant theo màu
    const variant = product.variants.find((v) => v.color === color);

    if (!variant) {
      throw new NotFoundException(
        `Color "${color}" not available for this product`,
      );
    }

    // Kiểm tra stock của variant
    if (variant.stock < quantity) {
      throw new BadRequestException(
        `Not enough stock for color "${color}". Available: ${variant.stock}`,
      );
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(userId);

    // Kiểm tra đã có product + color này trong cart chưa
    let cartDetail = cart.items?.find(
      (item) => item.productId === productId && item.color === color,
    );

    if (cartDetail) {
      // Update existing cart item
      const newQuantity = cartDetail.quantity + quantity;

      if (variant.stock < newQuantity) {
        throw new BadRequestException(
          `Not enough stock for color "${color}". Available: ${variant.stock}, Current in cart: ${cartDetail.quantity}`,
        );
      }

      cartDetail.quantity = newQuantity;
      cartDetail.subtotal = this.calculateSubtotal(
        product.price,
        product.discount,
        newQuantity,
      );
      await this.cartDetailRepository.save(cartDetail);
    } else {
      // Create new cart item
      cartDetail = this.cartDetailRepository.create({
        cartId: cart.id,
        productId: product.id,
        color: color,
        quantity,
        price: Number(product.price),
        discount: product.discount,
        subtotal: this.calculateSubtotal(
          product.price,
          product.discount,
          quantity,
        ),
      });

      await this.cartDetailRepository.save(cartDetail);
    }

    // Update cart totals
    await this.updateCartTotals(cart.id);

    // Fetch updated cart
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });

    return this.transformCartToResponse(updatedCart);
  }

  async updateCartItem(
    userId: string,
    cartDetailId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);

    const cartDetail = await this.cartDetailRepository.findOne({
      where: { id: cartDetailId, cartId: cart.id },
      relations: ['product'],
    });

    if (!cartDetail) {
      throw new NotFoundException('Cart item not found');
    }

    // Tìm variant theo màu
    const variant = cartDetail.product.variants.find(
      (v) => v.color === cartDetail.color,
    );

    if (!variant) {
      throw new NotFoundException(
        `Color "${cartDetail.color}" no longer available`,
      );
    }

    // Validate stock
    if (variant.stock < updateDto.quantity) {
      throw new BadRequestException(
        `Not enough stock for color "${cartDetail.color}". Available: ${variant.stock}`,
      );
    }

    cartDetail.quantity = updateDto.quantity;
    cartDetail.subtotal = this.calculateSubtotal(
      cartDetail.product.price,
      cartDetail.product.discount,
      updateDto.quantity,
    );

    await this.cartDetailRepository.save(cartDetail);

    // Update cart totals
    await this.updateCartTotals(cart.id);

    // Fetch updated cart
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });

    return this.transformCartToResponse(updatedCart);
  }

  async removeCartItem(userId: string, cartDetailId: string): Promise<boolean> {
    const cart = await this.getOrCreateCart(userId);

    const cartDetail = await this.cartDetailRepository.findOne({
      where: { id: cartDetailId, cartId: cart.id },
    });

    if (!cartDetail) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartDetailRepository.remove(cartDetail);

    // Update cart totals
    await this.updateCartTotals(cart.id);

    return true;
  }

  async clearCart(userId: string): Promise<boolean> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        totalItems: 0,
        totalPrice: 0,
      });
      await this.cartRepository.save(cart);
      return true;
    }

    await this.cartDetailRepository.delete({ cartId: cart.id });

    cart.totalItems = 0;
    cart.totalPrice = 0;

    await this.cartRepository.save(cart);

    return true;
  }

  // Helper methods
  private calculateSubtotal(
    price: number,
    discount: number,
    quantity: number,
  ): number {
    const priceNum = Number(price);
    const discountAmount = (priceNum * discount) / 100;
    const finalPrice = priceNum - discountAmount;
    return Number((finalPrice * quantity).toFixed(2));
  }

  private async updateCartTotals(cartId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) return;

    const totalItems =
      cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const totalPrice =
      cart.items?.reduce((sum, item) => sum + Number(item.subtotal), 0) || 0;

    await this.cartRepository.update(cartId, {
      totalItems,
      totalPrice: Number(totalPrice.toFixed(2)),
    });
  }

  // private async updateCartTotals(cartId: string): Promise<void> {
  //   // ✅ Calculate totals trực tiếp từ DB
  //   const result = await this.cartDetailRepository
  //     .createQueryBuilder('item')
  //     .select('SUM(item.quantity)', 'totalItems')
  //     .addSelect('SUM(item.subtotal)', 'totalPrice')
  //     .where('item.cartId = :cartId', { cartId })
  //     .getRawOne();

  //   await this.cartRepository.update(cartId, {
  //     totalItems: parseInt(result.totalItems) || 0,
  //     totalPrice: parseFloat(result.totalPrice) || 0,
  //   });
  // }

  private transformCartToResponse(cart: CartEntity): CartResponseDto {
    const items: CartItemResponseDto[] =
      cart.items?.map((item) => {
        // Tìm variant tương ứng để lấy ảnh đúng màu
        const variant = item.product?.variants?.find(
          (v) => v.color === item.color,
        );

        const itemResponse = plainToInstance(CartItemResponseDto, {
          id: item.id,
          productId: item.productId,
          productName: item.product?.name || '',
          color: item.color,
          productImage: variant?.image?.url || '', // Lấy ảnh theo màu
          quantity: item.quantity,
          price: Number(item.price),
          discount: item.discount,
          subtotal: Number(item.subtotal),
          stock: variant?.stock || 0, // Stock theo màu
        });
        return itemResponse;
      }) || [];

    return plainToInstance(CartResponseDto, {
      id: cart.id,
      userId: cart.userId,
      status: cart.status,
      totalItems: cart.totalItems,
      totalPrice: Number(cart.totalPrice),
      items,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    });
  }
}
