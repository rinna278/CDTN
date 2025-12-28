import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartDetailEntity } from './cart-detail.entity';
import { CreateCartDetailDto } from './dto/create-cart-detail.dto';
import { UpdateCartDetailDto } from './dto/update-cart-detail.dto';

@Injectable()
export class CartDetailService {
  constructor(
    @InjectRepository(CartDetailEntity)
    private cartDetailRepository: Repository<CartDetailEntity>,
  ) {}

  // Tạo mới chi tiết giỏ hàng
  async create(
    createCartDetailDto: CreateCartDetailDto,
  ): Promise<CartDetailEntity> {
    try {
      const cartDetail = this.cartDetailRepository.create(createCartDetailDto);
      return await this.cartDetailRepository.save(cartDetail);
    } catch (error) {
      throw new BadRequestException('Không thể tạo chi tiết giỏ hàng');
    }
  }

  // Lấy tất cả chi tiết giỏ hàng theo cartId
  async findByCartId(cartId: string): Promise<CartDetailEntity[]> {
    return await this.cartDetailRepository.find({
      where: { cartId },
      relations: ['product'],
    });
  }

  // Lấy chi tiết giỏ hàng theo ID
  async findOne(id: string): Promise<CartDetailEntity> {
    const cartDetail = await this.cartDetailRepository.findOne({
      where: { id },
      relations: ['product', 'cart'],
    });
    if (!cartDetail) {
      throw new NotFoundException(
        `Chi tiết giỏ hàng với ID ${id} không tồn tại`,
      );
    }
    return cartDetail;
  }

  // Cập nhật chi tiết giỏ hàng
  async update(
    id: string,
    updateCartDetailDto: UpdateCartDetailDto,
  ): Promise<CartDetailEntity> {
    await this.findOne(id);
    await this.cartDetailRepository.update(id, updateCartDetailDto);
    return await this.findOne(id);
  }

  // Xóa chi tiết giỏ hàng
  async remove(id: string): Promise<void> {
    const cartDetail = await this.findOne(id);
    await this.cartDetailRepository.remove(cartDetail);
  }

  // Xóa tất cả chi tiết của một giỏ hàng
  async removeByCartId(cartId: string): Promise<void> {
    await this.cartDetailRepository.delete({ cartId });
  }
}
