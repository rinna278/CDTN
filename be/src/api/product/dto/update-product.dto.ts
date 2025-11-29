// src/modules/product/dto/update-product.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'description',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  description?: string;

  @ApiPropertyOptional({
    description: 'price',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'status',
  })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({
    description: 'stock',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
