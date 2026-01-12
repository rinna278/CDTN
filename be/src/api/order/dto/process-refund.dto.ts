import { IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RefundAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class ProcessRefundDto {
  @ApiProperty({
    description: 'Hành động: approve (chấp nhận) hoặc reject (từ chối)',
    enum: RefundAction,
    example: RefundAction.APPROVE,
  })
  @IsEnum(RefundAction, { message: 'Action phải là approve hoặc reject' })
  action: RefundAction;

  @ApiProperty({
    description: 'Ghi chú từ admin',
    example: 'Đã hoàn tiền qua VNPay vào tài khoản',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Ghi chú không được quá 500 ký tự' })
  adminNote?: string;
}
