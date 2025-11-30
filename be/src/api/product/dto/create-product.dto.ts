import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  //Tên sản phẩm
  @ApiProperty({
    description: 'name',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value.trim())
  name: string;

  //Mô tả
  @ApiPropertyOptional({
    description: 'description',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  description: string;

  //Giá
  @ApiProperty({
    description: 'price',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price: number;

  //Trạng thái
  @ApiProperty({
    description: 'status',
  })
  @IsNotEmpty()
  @IsInt()
  status: number;

  //Số lượng tồn kho
  @ApiProperty({
    description: 'stock',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  stock: number;

}
