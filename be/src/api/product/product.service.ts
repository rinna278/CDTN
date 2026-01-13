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
    if (
      createDto.discount &&
      (createDto.discount < 0 || createDto.discount > 100)
    ) {
      throw new BadRequestException('Discount must be between 0 and 100');
    }

    // Validate ít nhất phải có 1 variant
    if (!createDto.variants || createDto.variants.length === 0) {
      throw new BadRequestException('Product must have at least one variant');
    }

    // Tính tổng stock từ các variants
    const totalStock = createDto.variants.reduce(
      (sum, variant) => sum + variant.stock,
      0,
    );

    const product = this.productRepository.create({
      ...createDto,
      totalStock,
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
      occasions,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      minPrice,
      maxPrice,
    } = query;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .andWhere('product.deletedAt IS NULL');
    if (status !== undefined) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    // Filter by color - check trong variants
    if (color) {
      queryBuilder.andWhere(
        `JSON_SEARCH(product.variants, 'one', :color, NULL, '$[*].color') IS NOT NULL`,
        { color },
      );
    }

    // Sửa đoạn này trong product.service.ts
    if (occasions && occasions.length > 0) {
      const occasionConditions = occasions
        .map((_, index) => `product.occasions LIKE :occasion${index}`)
        .join(' OR ');

      const params = occasions.reduce(
        (acc, occasion, index) => {
          // Tìm kiếm chuỗi "birthday" nằm trong dấu nháy kép để chính xác
          acc[`occasion${index}`] = `%"${occasion}"%`;
          return acc;
        },
        {} as Record<string, string>,
      );

      queryBuilder.andWhere(`(${occasionConditions})`, params);
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    const allowedSortFields = ['price', 'createdAt', 'soldCount', 'name'];
    const sortColumn = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';
    queryBuilder.orderBy(
      `product.${sortColumn}`,
      (sortOrder as 'ASC' | 'DESC') || 'DESC',
    );

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
    await this.findOne(id);

    if (
      updateDto.discount !== undefined &&
      (updateDto.discount < 0 || updateDto.discount > 100)
    ) {
      throw new BadRequestException('Discount must be between 0 and 100');
    }

    // Nếu update variants, tính lại totalStock
    let totalStock: number | undefined;
    if (updateDto.variants) {
      totalStock = updateDto.variants.reduce(
        (sum, variant) => sum + variant.stock,
        0,
      );
    }

    const result = await this.productRepository.update(id, {
      ...updateDto,
      ...(totalStock !== undefined && { totalStock }),
      updatedBy: userId,
    });

    return (result?.affected ?? 0) > 0;
  }

  async remove(id: string): Promise<boolean> {
    await this.findOne(id);
    await this.productRepository.softDelete(id);
    return true;
  }

  // Cập nhật stock cho một variant cụ thể
  async updateVariantStock(
    productId: string,
    color: string,
    quantity: number, // số lượng thay đổi (+ hoặc -)
  ): Promise<ProductEntity> {
    const product = await this.findOne(productId);

    const variantIndex = product.variants.findIndex((v) => v.color === color);

    if (variantIndex === -1) {
      throw new NotFoundException(
        `Variant with color "${color}" not found in product`,
      );
    }

    const variant = product.variants[variantIndex];

    // Kiểm tra nếu giảm stock
    if (quantity < 0 && Math.abs(quantity) > variant.stock) {
      throw new BadRequestException(
        `Not enough stock for color "${color}". Current stock: ${variant.stock}, requested: ${Math.abs(quantity)}`,
      );
    }

    // Cập nhật stock
    variant.stock += quantity;
    product.variants[variantIndex] = variant;

    // Tính lại totalStock
    product.totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

    // Kiểm tra nếu tất cả variants hết hàng
    if (product.totalStock === 0) {
      product.status = ProductStatus.OUT_OF_STOCK;
    } else if (product.status === ProductStatus.OUT_OF_STOCK) {
      product.status = ProductStatus.ACTIVE;
    }

    return await this.productRepository.save(product);
  }

  // Tăng sold count và giảm stock
  async incrementSoldCount(
    id: string,
    color: string,
    quantity: number,
  ): Promise<void> {
    await this.productRepository.increment({ id }, 'soldCount', quantity);
    await this.updateVariantStock(id, color, -quantity);
  }

  // Lấy danh sách màu có sẵn (còn stock > 0)
  async getAvailableColors(productId: string): Promise<string[]> {
    const product = await this.findOne(productId);
    return product.variants.filter((v) => v.stock > 0).map((v) => v.color);
  }

  // Lấy variant cụ thể theo màu
  async getVariantByColor(productId: string, color: string) {
    const product = await this.findOne(productId);
    const variant = product.variants.find((v) => v.color === color);

    if (!variant) {
      throw new NotFoundException(`Variant with color "${color}" not found`);
    }

    return variant;
  }

  // Lấy tổng stock của tất cả variants
  getTotalStock(product: ProductEntity): number {
    return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  }

  async getBestSellers(limit: number = 10): Promise<ProductEntity[]> {
    return await this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
      order: { soldCount: 'DESC' },
      take: limit,
    });
  }

  async getLatestProducts(limit: number = 10): Promise<ProductEntity[]> {
    return await this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getDiscountProducts(limit: number = 10): Promise<ProductEntity[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    return await queryBuilder
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.discount > 0')
      .orderBy('product.discount', 'DESC')
      .take(limit)
      .getMany();
  }

  async getCategories(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.category IS NOT NULL')
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .getRawMany();

    return result.map((item) => item.category);
  }

  // Lấy tất cả màu có sẵn (từ tất cả products)
  async getColors(): Promise<string[]> {
    const products = await this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
    });

    const colorsSet = new Set<string>();
    products.forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.stock > 0) {
          colorsSet.add(variant.color);
        }
      });
    });

    return Array.from(colorsSet);
  }

  async getRelatedProducts(
    id: string,
    limit: number = 6,
  ): Promise<ProductEntity[]> {
    const product = await this.findOne(id);

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder
      .where('product.id != :id', { id })
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.category = :category', { category: product.category })
      .orderBy('RAND()')
      .take(limit);

    return await queryBuilder.getMany();
  }
}
