import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleCheckItemDto {
  @ApiProperty({
    description: 'Trạng thái check item',
    example: true,
  })
  @IsBoolean()
  isChecked: boolean;
}
