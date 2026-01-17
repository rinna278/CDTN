import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum RevenueTimeframe {
  ALL_TIME = 'all_time',
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
}

export class QueryRevenueDto {
  @ApiPropertyOptional({
    description: 'Khung thời gian',
    enum: RevenueTimeframe,
    example: RevenueTimeframe.ALL_TIME,
  })
  @IsOptional()
  @IsEnum(RevenueTimeframe)
  timeframe?: RevenueTimeframe = RevenueTimeframe.ALL_TIME;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu (dùng cho timeframe=custom)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc (dùng cho timeframe=custom)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
