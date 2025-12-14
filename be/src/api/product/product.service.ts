// product.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { BaseService } from '../../share/database/base.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ProductStatus } from './product.constant';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductService extends BaseService<ProductEntity> {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {
    super(productRepository);
  }

  async createProduct(
    createDto: CreateProductDto,
    userId: string,
  ): Promise<ProductEntity> {
    // Kiểm tra discount hợp lệ
    if (
      createDto.discount &&
      (createDto.discount < 0 || createDto.discount > 100)
    ) {
      throw new BadRequestException('Discount must be between 0 and 100');
    }

    const product = this.productRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.productRepository.save(product);
  }

  async findAll(query: QueryProductDto) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      color,
      occasion,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      minPrice,
      maxPrice,
    } = query;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Filter by status (nếu không truyền status thì lấy tất cả)
    if (status !== undefined) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    // Search by name or description
    if (search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by category
    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    // Filter by color
    if (color) {
      queryBuilder.andWhere('product.color = :color', { color });
    }

    // Filter by occasion - tìm trong JSON array
    if (occasion) {
      queryBuilder.andWhere(
        "JSON_SEARCH(product.occasions, 'one', :occasion) IS NOT NULL",
        { occasion },
      );
    }

    // Filter by price range
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Sorting
    const allowedSortFields = ['price', 'createdAt', 'soldCount', 'name'];
    const sortColumn = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';
    queryBuilder.orderBy(
      `product.${sortColumn}`,
      (sortOrder as 'ASC' | 'DESC') || 'DESC',
    );

    // Pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async get(id: string): Promise<ProductEntity> {
    return this.findOne(id);
  }

  async updateProduct(
    id: string,
    updateDto: UpdateProductDto,
    userId: string,
  ): Promise<boolean> {
    const product = await this.findOne(id);

    // Kiểm tra discount hợp lệ
    if (
      updateDto.discount !== undefined &&
      (updateDto.discount < 0 || updateDto.discount > 100)
    ) {
      throw new BadRequestException('Discount must be between 0 and 100');
    }

    // Nếu cập nhật stock = 0 thì tự động chuyển status thành OUT_OF_STOCK
    if (updateDto.stock === 0) {
      updateDto.status = ProductStatus.OUT_OF_STOCK;
    }

    // Nếu cập nhật stock > 0 và status đang là OUT_OF_STOCK thì chuyển về ACTIVE
    if (
      updateDto.stock &&
      updateDto.stock > 0 &&
      product.status === ProductStatus.OUT_OF_STOCK
    ) {
      updateDto.status = ProductStatus.ACTIVE;
    }

    const result = await this.productRepository.update(id, {
      ...updateDto,
      updatedBy: userId,
    });

    // Return true if rows were affected
    return (result?.affected ?? 0) > 0;
  }

  async remove(id: string): Promise<boolean> {
    await this.findOne(id); // Verify product exists
    await this.productRepository.softDelete(id);
    return true;
  }

  async updateStock(
    id: string,
    updateStockDto: UpdateStockDto,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);
    const { quantity } = updateStockDto;

    // Kiểm tra nếu giảm stock thì không được vượt quá số lượng hiện có
    if (quantity < 0 && Math.abs(quantity) > product.stock) {
      throw new BadRequestException(
        `Not enough stock. Current stock: ${product.stock}, requested: ${Math.abs(quantity)}`,
      );
    }

    // Cập nhật stock
    product.stock += quantity;

    // Auto update status based on stock
    if (product.stock === 0) {
      product.status = ProductStatus.OUT_OF_STOCK;
    } else if (
      product.stock > 0 &&
      product.status === ProductStatus.OUT_OF_STOCK
    ) {
      product.status = ProductStatus.ACTIVE;
    }

    return await this.productRepository.save(product);
  }

  async incrementSoldCount(id: string, quantity: number): Promise<void> {
    await this.productRepository.increment({ id }, 'soldCount', quantity);

    // Verify product exists and update stock
    await this.findOne(id);
    await this.updateStock(id, { quantity: -quantity });
  }

  // Lấy danh sách sản phẩm bán chạy
  async getBestSellers(limit: number = 10): Promise<ProductEntity[]> {
    return await this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
      order: { soldCount: 'DESC' },
      take: limit,
    });
  }

  // Lấy danh sách sản phẩm mới nhất
  async getLatestProducts(limit: number = 10): Promise<ProductEntity[]> {
    return await this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Lấy danh sách sản phẩm giảm giá
  async getDiscountProducts(limit: number = 10): Promise<ProductEntity[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    return await queryBuilder
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.discount > 0')
      .orderBy('product.discount', 'DESC')
      .take(limit)
      .getMany();
  }

  // Lấy danh sách categories
  async getCategories(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.category IS NOT NULL')
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .getRawMany();

    return result.map((item) => item.category);
  }

  // Lấy danh sách colors
  async getColors(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.color', 'color')
      .where('product.color IS NOT NULL')
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .getRawMany();

    return result.map((item) => item.color);
  }

  // Lấy sản phẩm liên quan (cùng category hoặc occasion)
  async getRelatedProducts(
    id: string,
    limit: number = 6,
  ): Promise<ProductEntity[]> {
    const product = await this.findOne(id);

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder
      .where('product.id != :id', { id })
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere(
        '(product.category = :category OR JSON_OVERLAPS(product.occasions, :occasions))',
        {
          category: product.category,
          occasions: JSON.stringify(product.occasions || []),
        },
      )
      .orderBy('RAND()')
      .take(limit);

    return await queryBuilder.getMany();
  }
}
