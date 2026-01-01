import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStockDto {
  @ApiProperty({
    example: 'Đỏ',
    description: 'Màu cần cập nhật stock',
  })
  @IsString()
  color: string;

  @ApiProperty({
    example: 50,
  })
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}
