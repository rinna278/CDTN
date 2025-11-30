// src/modules/product/product.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
// import { ProductEntity } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  status?: number;
  inStock?: boolean;
}

@Injectable()
export class ProductService {
  // constructor(
  //   // @InjectRepository(ProductEntity)
  //   private readonly productRepository: Repository<ProductEntity>,
  // ) {}

  /**
   * Tạo sản phẩm mới
   */
  // async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
  //   try {
  //     // Kiểm tra tên sản phẩm đã tồn tại chưa
  //     const existingProduct = await this.productRepository.findOne({
  //       where: { name: createProductDto.name },
  //     });

  //     if (existingProduct) {
  //       throw new BadRequestException('Tên sản phẩm đã tồn tại');
  //     }

  //     const product = this.productRepository.create(createProductDto);
  //     return await this.productRepository.save(product);
  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw new BadRequestException('Không thể tạo sản phẩm');
  //   }
  // }

  /**
   * Lấy tất cả sản phẩm
   */
  // async findAll(): Promise<ProductEntity[]> {
  //   try {
  //     return await this.productRepository.find({
  //       relations: ['discount'],
  //       order: {
  //         createdAt: 'DESC',
  //       },
  //     });
  //   } catch (error) {
  //     throw new BadRequestException('Không thể lấy danh sách sản phẩm');
  //   }
  // }

  /**
   * Lấy chi tiết sản phẩm theo ID
   */
  // async findOne(id: number): Promise<ProductEntity> {
  //   try {
  //     const product = await this.productRepository.findOne({
  //       where: { id },
  //       relations: ['discount', 'orderDetails', 'cartDetails'],
  //     });

  //     if (!product) {
  //       throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}`);
  //     }

  //     return product;
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     throw new BadRequestException('Không thể lấy thông tin sản phẩm');
  //   }
  // }

  /**
   * Cập nhật sản phẩm
   */
  // async update(
  //   id: number,
  //   updateProductDto: UpdateProductDto,
  // ): Promise<ProductEntity> {
  //   try {
  //     const product = await this.findOne(id);

  //     // Kiểm tra tên sản phẩm mới có trùng với sản phẩm khác không
  //     if (updateProductDto.name && updateProductDto.name !== product.name) {
  //       const existingProduct = await this.productRepository.findOne({
  //         where: { name: updateProductDto.name },
  //       });

  //       if (existingProduct) {
  //         throw new BadRequestException('Tên sản phẩm đã tồn tại');
  //       }
  //     }

  //     // Merge và save
  //     Object.assign(product, updateProductDto);
  //     return await this.productRepository.save(product);
  //   } catch (error) {
  //     if (
  //       error instanceof NotFoundException ||
  //       error instanceof BadRequestException
  //     ) {
  //       throw error;
  //     }
  //     throw new BadRequestException('Không thể cập nhật sản phẩm');
  //   }
  // }

  /**
   * Xóa sản phẩm (soft delete)
   */
  // async delete(id: number): Promise<{ message: string }> {
  //   try {
  //     const product = await this.findOne(id);

  //     // Kiểm tra xem sản phẩm có đang được sử dụng trong đơn hàng không
  //     if (product.orderDetails && product.orderDetails.length > 0) {
  //       throw new BadRequestException(
  //         'Không thể xóa sản phẩm đang có trong đơn hàng',
  //       );
  //     }

  //     await this.productRepository.softDelete(id);
  //     return { message: `Đã xóa sản phẩm với ID ${id}` };
  //   } catch (error) {
  //     if (
  //       error instanceof NotFoundException ||
  //       error instanceof BadRequestException
  //     ) {
  //       throw error;
  //     }
  //     throw new BadRequestException('Không thể xóa sản phẩm');
  //   }
  // }

  /**
   * Tìm kiếm sản phẩm theo tên
   */
  // async search(keyword: string): Promise<ProductEntity[]> {
  //   try {
  //     if (!keyword || keyword.trim() === '') {
  //       throw new BadRequestException('Từ khóa tìm kiếm không được để trống');
  //     }

  //     return await this.productRepository.find({
  //       where: [
  //         { name: Like(`%${keyword}%`) },
  //         { description: Like(`%${keyword}%`) },
  //       ],
  //       relations: ['discount'],
  //       order: {
  //         createdAt: 'DESC',
  //       },
  //     });
  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw new BadRequestException('Không thể tìm kiếm sản phẩm');
  //   }
  // }

  /**
   * Lọc sản phẩm theo điều kiện
   */
  // async filter(options: FilterOptions): Promise<ProductEntity[]> {
  //   try {
  //     const { minPrice, maxPrice, status, inStock } = options;
  //     const whereConditions: any = {};

  //     // Lọc theo giá
  //     if (minPrice !== undefined && maxPrice !== undefined) {
  //       whereConditions.price = Between(minPrice, maxPrice);
  //     } else if (minPrice !== undefined) {
  //       whereConditions.price = MoreThanOrEqual(minPrice);
  //     } else if (maxPrice !== undefined) {
  //       whereConditions.price = LessThanOrEqual(maxPrice);
  //     }

  //     // Lọc theo trạng thái
  //     if (status !== undefined) {
  //       whereConditions.status = status;
  //     }

  //     // Lọc theo tồn kho
  //     if (inStock !== undefined) {
  //       if (inStock === true) {
  //         whereConditions.stock = MoreThanOrEqual(1);
  //       } else {
  //         whereConditions.stock = 0;
  //       }
  //     }

  //     return await this.productRepository.find({
  //       where: whereConditions,
  //       relations: ['discount'],
  //       order: {
  //         createdAt: 'DESC',
  //       },
  //     });
  //   } catch (error) {
  //     throw new BadRequestException('Không thể lọc sản phẩm');
  //   }
  // }

  /**
   * Kiểm tra sản phẩm còn đủ hàng không
   */
  // async checkStock(id: number, quantity: number): Promise<boolean> {
  //   const product = await this.findOne(id);
  //   return product.stock >= quantity;
  // }

  /**
   * Giảm số lượng tồn kho
   */
  // async decreaseStock(id: number, quantity: number): Promise<ProductEntity> {
  //   const product = await this.findOne(id);

  //   if (product.stock < quantity) {
  //     throw new BadRequestException('Số lượng sản phẩm không đủ');
  //   }

  //   product.stock -= quantity;
  //   return await this.productRepository.save(product);
  // }

  /**
   * Tăng số lượng tồn kho
   */
//   async increaseStock(id: number, quantity: number): Promise<ProductEntity> {
//     const product = await this.findOne(id);
//     product.stock += quantity;
//     return await this.productRepository.save(product);
//   }
// }
}