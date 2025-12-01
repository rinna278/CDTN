import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStockDto {
  @ApiProperty({
    example: 50,
  })
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}
