import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductResponseDto } from './product-response.dto';

export class ListProductResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  @Type(() => ProductResponseDto)
  data: ProductResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}
