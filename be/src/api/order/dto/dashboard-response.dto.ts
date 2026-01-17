import { ApiProperty } from '@nestjs/swagger';

export class RevenueStatsDto {
  @ApiProperty({ example: 4800000 })
  currentMonth: number;

  @ApiProperty({ example: 4285714 })
  lastMonth: number;

  @ApiProperty({ example: 12 })
  percentageChange: number;
}

export class OrderStatsDto {
  @ApiProperty({ example: 75 })
  currentMonth: number;

  @ApiProperty({ example: 69 })
  lastMonth: number;

  @ApiProperty({ example: 8 })
  percentageChange: number;
}

export class AverageOrderValueDto {
  @ApiProperty({ example: 64000 })
  value: number;

  @ApiProperty({ example: 62000 })
  lastMonthValue: number;

  @ApiProperty({ example: 3 })
  percentageChange: number;
}

export class DailyChartDataDto {
  @ApiProperty({ example: '2026-01-01' })
  date: string;

  @ApiProperty({ example: 15 })
  orderCount: number;

  @ApiProperty({ example: 1500000 })
  revenue: number;
}

export class TopCategoryDto {
  @ApiProperty({ example: 1 })
  rank: number;

  @ApiProperty({ example: 'Hoa Hồng' })
  categoryName: string;

  @ApiProperty({ example: 245 })
  soldCount: number;

  @ApiProperty({ example: 36750000 })
  revenue: number;
}

export class DashboardResponseDto {
  @ApiProperty({ example: 1 })
  month: number;

  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ type: RevenueStatsDto })
  revenueStats: RevenueStatsDto;

  @ApiProperty({ type: OrderStatsDto })
  orderStats: OrderStatsDto;

  @ApiProperty({ type: AverageOrderValueDto })
  averageOrderValue: AverageOrderValueDto;

  @ApiProperty({ type: [DailyChartDataDto] })
  dailyOrderChart: DailyChartDataDto[];

  @ApiProperty({ type: [DailyChartDataDto] })
  dailyRevenueChart: DailyChartDataDto[];

  @ApiProperty({ type: [TopCategoryDto] })
  topCategories: TopCategoryDto[];
}
