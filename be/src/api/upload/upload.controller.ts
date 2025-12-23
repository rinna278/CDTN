import {
  Controller,
  Post,
  Delete,
  Get,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import {
  UploadResponseDto,
  UploadedImageDto,
  SignedUploadParamsDto,
} from './dto/upload.dto';
import { API_CONFIG } from '../../configs/constant.config';

@Controller({
  version: [API_CONFIG.VERSION_V1],
  path: 'upload',
})
@ApiTags('Upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload single image to Cloudinary' })
  @ApiOkResponse({
    type: UploadedImageDto,
    description: 'Image uploaded successfully',
  })
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const result = await this.uploadService.uploadImage(file, 'products');
    return result;
  }

  /**
   * Upload multiple images
   */
  @Post('images')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload multiple images to Cloudinary (max 10)' })
  @ApiOkResponse({
    type: UploadResponseDto,
    description: 'Images uploaded successfully',
  })
  async uploadImages(@UploadedFiles() files: any[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    const images = await this.uploadService.uploadImages(files, 'products');
    return {
      images,
      count: images.length,
    };
  }

  /**
   * Delete image by public ID
   */
  @Delete('image/:publicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete image from Cloudinary' })
  @ApiOkResponse({ description: 'Image deleted successfully' })
  async deleteImage(@Body('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }
    await this.uploadService.deleteImage(publicId);
    return { message: 'Image deleted successfully' };
  }

  /**
   * Delete multiple images
   */
  @Delete('images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete multiple images from Cloudinary' })
  @ApiOkResponse({ description: 'Images deleted successfully' })
  async deleteImages(@Body('publicIds') publicIds: string[]) {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('Public IDs are required');
    }
    await this.uploadService.deleteImages(publicIds);
    return { message: 'Images deleted successfully', count: publicIds.length };
  }

  /**
   * Get signed parameters for client-side upload
   * Client can use these to upload directly to Cloudinary without backend
   */
  @Get('sign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get signed upload parameters for client-side upload',
  })
  @ApiOkResponse({
    type: SignedUploadParamsDto,
    description: 'Signed parameters retrieved successfully',
  })
  getSignedParams() {
    return this.uploadService.getSignedUploadParams();
  }
}
