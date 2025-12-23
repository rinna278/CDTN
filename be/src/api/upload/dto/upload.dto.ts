import { ApiProperty } from '@nestjs/swagger';

export class UploadedImageDto {
  @ApiProperty({ example: 'uploads/abc123' })
  publicId: string;

  @ApiProperty({ example: 'http://res.cloudinary.com/...' })
  url: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  secureUrl: string;

  @ApiProperty({ example: 1200 })
  width: number;

  @ApiProperty({ example: 800 })
  height: number;

  @ApiProperty({ example: 'jpg' })
  format: string;
}

export class UploadResponseDto {
  @ApiProperty({ type: [UploadedImageDto] })
  images: UploadedImageDto[];

  @ApiProperty({ example: 1 })
  count: number;
}

export class DeleteImageDto {
  @ApiProperty({ example: 'uploads/abc123' })
  publicId: string;
}

export class SignedUploadParamsDto {
  @ApiProperty({ example: 'dzkcuepgz' })
  cloudName: string;

  @ApiProperty({ example: '837136822987532' })
  apiKey: string;

  @ApiProperty({ example: 1703348400 })
  timestamp: number;

  @ApiProperty({ example: 'abc123signature...' })
  signature: string;

  @ApiProperty({ example: 'uploads' })
  folder: string;
}
