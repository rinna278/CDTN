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
import { ProductSearchResponseDto } from './dto/product-search-response.dto';

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
        '(product.name ILIKE :search OR product.description ILIKE :search)',
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
    if (variant.stock < 0) variant.stock = 0;
    product.variants[variantIndex] = variant;

    // ✅ TÍNH LẠI TOTALSTOCK (SUM TẤT CẢ VARIANTS)
    product.totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

    // ✅ CẬP NHẬT STATUS DựA TRÊN TOTALSTOCK
    if (product.totalStock === 0) {
      product.status = ProductStatus.OUT_OF_STOCK;
    } else if (product.status === ProductStatus.OUT_OF_STOCK) {
      // Nếu đang out of stock mà có hàng trở lại → chuyển về ACTIVE
      product.status = ProductStatus.ACTIVE;
    }

    return await this.productRepository.save(product);
  }

  // dùng để **release reservedStock** khi order bị cancel (chưa thanh toán)
  async releaseReservedStock(
    productId: string,
    color: string,
    quantity: number,
  ): Promise<ProductEntity> {
    const product = await this.findOne(productId);

    const variantIndex = product.variants.findIndex((v) => v.color === color);
    if (variantIndex === -1) {
      throw new NotFoundException(
        `Variant with color "${color}" not found in product`,
      );
    }

    const variant = product.variants[variantIndex];

    // Ensure reservedStock exists
    if (typeof variant.reservedStock !== 'number') variant.reservedStock = 0;

    variant.reservedStock = Math.max(0, variant.reservedStock - quantity);

    product.variants[variantIndex] = variant;

    // ✅ NOTE: reservedStock KHÔNG ẢNH HƯỞNG totalStock
    // totalStock = sum of actual stock (variant.stock)
    // Nhưng vẫn phải tính lại để đảm bảo consistency
    product.totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

    // ✅ CẬP NHẬT STATUS (dựa trên stock thật, không phải reserved)
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

  async getHomepageProducts() {
    // 1. Lấy hoa giảm đến 30% (10 cái gần 30% nhất)
    const discountProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.discount > 0')
      .andWhere('product.discount <= 30')
      .orderBy('product.discount', 'DESC')
      .take(10)
      .getMany();

    // 2. Lấy sản phẩm mới (trong vòng 1 tuần)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.createdAt >= :oneWeekAgo', { oneWeekAgo })
      .orderBy('product.createdAt', 'DESC')
      .take(10)
      .getMany();

    return {
      discountProducts,
      newProducts,
    };
  }

  /**
   * Lấy gợi ý tìm kiếm cho autocomplete
   */
  async getSearchSuggestions(
    query: string,
    limit: number = 5,
  ): Promise<Array<{ id: string; name: string; category: string }>> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const products = await this.productRepository
      .createQueryBuilder('product')
      .select(['product.id', 'product.name', 'product.category'])
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.deletedAt IS NULL')
      .andWhere('product.name LIKE :query', { query: `%${query}%` })
      .orderBy('product.soldCount', 'DESC') // Ưu tiên sản phẩm bán chạy
      .take(limit)
      .getMany();

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
    }));
  }

  /**
   * Tìm kiếm nâng cao với highlight
   */
  async advancedSearch(query: QueryProductDto) {
    const result = await this.findAll(query);

    // Chuyển đổi sang DTO
    const data = result.data.map(
      (product) => new ProductSearchResponseDto(product, query.search),
    );

    return {
      ...result,
      data, // Override data với DTO mới
    };
  }

  /**
   * Helper: Highlight text dựa trên search term
   */
  private highlightText(text: string, searchTerm: string): string {
    if (!text || !searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Tìm kiếm fuzzy (tìm kiếm gần đúng)
   */
  async fuzzySearch(
    searchTerm: string,
    limit: number = 10,
  ): Promise<ProductEntity[]> {
    // Tách search term thành các từ
    const keywords = searchTerm.trim().split(/\s+/);

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.deletedAt IS NULL');

    // Tìm kiếm với mỗi keyword
    keywords.forEach((keyword, index) => {
      queryBuilder.andWhere(
        `(product.name LIKE :keyword${index} OR product.description LIKE :keyword${index})`,
        { [`keyword${index}`]: `%${keyword}%` },
      );
    });

    return await queryBuilder
      .orderBy('product.soldCount', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Tìm kiếm theo từ khóa phổ biến
   */
  async getPopularSearchTerms(limit: number = 10): Promise<string[]> {
    // Lấy các từ trong tên sản phẩm bán chạy
    const products = await this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
      order: { soldCount: 'DESC' },
      take: 50,
    });

    const wordsCount = new Map<string, number>();

    products.forEach((product) => {
      const words = product.name.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        if (word.length > 2) {
          // Bỏ qua từ quá ngắn
          wordsCount.set(word, (wordsCount.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(wordsCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  /**
   * Tìm kiếm với typo tolerance (chấp nhận lỗi chính tả)
   * Sử dụng SOUNDEX hoặc Levenshtein distance nếu MySQL hỗ trợ
   */
  async searchWithTypoTolerance(
    searchTerm: string,
    limit: number = 10,
  ): Promise<ProductEntity[]> {
    // Cách đơn giản: tìm kiếm với các biến thể phổ biến
    const variations = [
      searchTerm,
      searchTerm.replace(/ô/g, 'o'),
      searchTerm.replace(/ơ/g, 'o'),
      searchTerm.replace(/ư/g, 'u'),
      // Thêm các biến thể khác tùy nhu cầu
    ];

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.deletedAt IS NULL');

    const conditions = variations
      .map((_, index) => `product.name LIKE :variation${index}`)
      .join(' OR ');

    const params = variations.reduce(
      (acc, variation, index) => {
        acc[`variation${index}`] = `%${variation}%`;
        return acc;
      },
      {} as Record<string, string>,
    );

    queryBuilder.andWhere(`(${conditions})`, params);

    return await queryBuilder
      .orderBy('product.soldCount', 'DESC')
      .take(limit)
      .getMany();
  }
}
