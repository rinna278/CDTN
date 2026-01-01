import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  Max,
  MaxLength,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { ProductStatus, IProductImage } from '../product.constant';
import { Type } from 'class-transformer';

export class ProductImageDto implements IProductImage {
  @ApiProperty({ example: 'https://res.cloudinary.com/xxx/image.jpg' })
  @IsString()
  url: string;

  @ApiProperty({ example: 'products/image-id' })
  @IsString()
  publicId: string;
}

export class ProductVariantDto {
  @ApiProperty({ example: 'Đỏ', description: 'Tên màu' })
  @IsString()
  color: string;

  @ApiProperty({
    type: ProductImageDto,
    description: '1 ảnh đại diện cho màu này',
  })
  @ValidateNested()
  @Type(() => ProductImageDto)
  image: ProductImageDto;

  @ApiProperty({ example: 100, description: 'Số lượng tồn kho của màu này' })
  @IsNumber()
  @Min(0)
  stock: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Ecuador roses', description: 'Name of product' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'Fresh roses imported from Ecuador',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 500000, description: 'Price' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Discount (%), 0-100',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  discount?: number;

  @ApiPropertyOptional({
    example: 'Roses',
    description: 'Type or category of the product',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: [
      { url: 'https://example.com/image1.jpg', publicId: 'folder/id1' },
      { url: 'https://example.com/image2.jpg', publicId: 'folder/id2' },
    ],
    description: 'List of image objects with url and publicId',
    type: [Object],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  @IsOptional()
  images?: IProductImage[];

  @ApiPropertyOptional({
    example: ['Birthday', 'Graduation'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  occasions?: string[];

  @ApiProperty({
    type: [ProductVariantDto],
    description: 'Danh sách màu sắc, mỗi màu có ảnh và stock riêng',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];

  @ApiPropertyOptional({
    example: ProductStatus.ACTIVE,
    enum: ProductStatus,
    description: '1-Active, 0-Inactive, 2-Out of stock',
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  @Type(() => Number)
  status?: number;
}
