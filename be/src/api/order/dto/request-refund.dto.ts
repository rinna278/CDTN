import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestRefundDto {
  @ApiProperty({
    description: 'Lý do hoàn tiền',
    example: 'Sản phẩm bị lỗi, không đúng mô tả',
  })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập lý do hoàn tiền' })
  @MaxLength(500, { message: 'Lý do không được quá 500 ký tự' })
  reason: string;

  @ApiProperty({
    description: 'Mô tả chi tiết (optional)',
    example: 'Hoa bị héo, màu không đúng như hình',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Mô tả không được quá 1000 ký tự' })
  description?: string;
}
