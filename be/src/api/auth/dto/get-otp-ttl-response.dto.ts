import { ApiProperty } from '@nestjs/swagger';

export class GetOtpTtlResponseDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description:
      'Remaining time-to-live of OTP in seconds (0 if expired or not found)',
    example: 285,
  })
  ttl: number;

  @ApiProperty({
    description: 'Whether OTP is still active',
    example: true,
  })
  isActive: boolean;
}
