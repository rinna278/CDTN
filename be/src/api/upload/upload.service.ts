import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadedImage {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload image from file buffer
   * @param file - uploaded file with buffer
   * @param folder - folder path in Cloudinary (e.g., 'products', 'users')
   * @returns uploaded image metadata
   */
  async uploadImage(
    file: any,
    folder: string = 'uploads',
  ): Promise<UploadedImage> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          max_file_size: 5242880, // 5MB
        },
        (error: any, result: any) => {
          if (error) {
            reject(new BadRequestException(`Upload failed: ${error.message}`));
          } else {
            resolve({
              publicId: result.public_id,
              url: result.url,
              secureUrl: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
            });
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Upload multiple images
   * @param files - array of uploaded files
   * @param folder - folder path in Cloudinary
   * @returns array of uploaded image metadata
   */
  async uploadImages(
    files: any[],
    folder: string = 'uploads',
  ): Promise<UploadedImage[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files allowed per request');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - public_id of the image
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(new BadRequestException(`Delete failed: ${error.message}`));
        } else if (result.result === 'ok') {
          resolve();
        } else {
          reject(
            new BadRequestException(`Failed to delete image: ${result.result}`),
          );
        }
      });
    });
  }

  /**
   * Delete multiple images
   * @param publicIds - array of public_ids
   */
  async deleteImages(publicIds: string[]): Promise<void> {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('No public IDs provided');
    }

    const deletePromises = publicIds.map((id) => this.deleteImage(id));
    await Promise.all(deletePromises);
  }

  /**
   * Get signed upload parameters for client-side upload
   * Useful for frontend direct upload without backend intermediary
   */
  getSignedUploadParams() {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: 'uploads',
        resource_type: 'auto',
      },
      this.configService.get('CLOUDINARY_API_SECRET'),
    );

    return {
      cloudName: this.configService.get('CLOUDINARY_NAME'),
      apiKey: this.configService.get('CLOUDINARY_API_KEY'),
      timestamp,
      signature,
      folder: 'uploads',
    };
  }
}
