import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId: string;
}

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Generate a signed upload URL for direct client-side uploads to Cloudinary
   * This allows uploading large videos directly from the browser without going through our server
   */
  generateSignedUploadParams(
    folder: string = 'videos',
    resourceType: 'video' | 'image' | 'raw' = 'video',
  ): CloudinarySignatureResponse {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `${folder}/${uuidv4()}`;

    const paramsToSign = {
      timestamp,
      folder,
      public_id: publicId,
      upload_preset: this.configService.get('CLOUDINARY_UPLOAD_PRESET') || undefined,
    };

    // Remove undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(paramsToSign).filter(([, v]) => v !== undefined),
    );

    const signature = cloudinary.utils.api_sign_request(
      filteredParams,
      this.configService.get('CLOUDINARY_API_SECRET') || '',
    );

    return {
      signature,
      timestamp,
      cloudName: this.configService.get('CLOUDINARY_CLOUD_NAME') || '',
      apiKey: this.configService.get('CLOUDINARY_API_KEY') || '',
      folder,
      publicId,
    };
  }

  /**
   * Upload a file directly from buffer (for smaller files or server-side processing)
   */
  async uploadFile(
    buffer: Buffer,
    options: {
      folder?: string;
      resourceType?: 'video' | 'image' | 'raw';
      publicId?: string;
    } = {},
  ): Promise<UploadApiResponse> {
    const { folder = 'uploads', resourceType = 'auto', publicId } = options;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          public_id: publicId || uuidv4(),
        },
        (error: any, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed with no result'));
          }
        },
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload a video from a URL
   */
  async uploadVideoFromUrl(
    url: string,
    folder: string = 'videos',
  ): Promise<UploadApiResponse> {
    return cloudinary.uploader.upload(url, {
      folder,
      resource_type: 'video',
      public_id: uuidv4(),
    });
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(
    publicId: string,
    resourceType: 'video' | 'image' | 'raw' = 'video',
  ): Promise<void> {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }

  /**
   * Get video details including duration, resolution, etc.
   */
  async getVideoDetails(publicId: string): Promise<any> {
    return cloudinary.api.resource(publicId, {
      resource_type: 'video',
      image_metadata: true,
    });
  }

  /**
   * Generate a streaming URL for a video
   */
  getVideoStreamUrl(publicId: string, options: any = {}): string {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      type: 'upload',
      ...options,
    });
  }

  /**
   * Generate HLS (adaptive streaming) URLs for a video
   */
  getAdaptiveStreamingUrls(publicId: string): {
    hls: string;
    dash: string;
    thumbnail: string;
  } {
    const baseUrl = cloudinary.url(publicId, {
      resource_type: 'video',
      type: 'upload',
    });

    return {
      hls: baseUrl.replace(/\.[^/.]+$/, '.m3u8'),
      dash: baseUrl.replace(/\.[^/.]+$/, '.mpd'),
      thumbnail: cloudinary.url(publicId, {
        resource_type: 'video',
        type: 'upload',
        format: 'jpg',
        transformation: [
          { width: 640, height: 360, crop: 'fill' },
          { start_offset: '0' },
        ],
      }),
    };
  }

  /**
   * Validate video file type and size
   */
  validateVideoFile(
    file: Express.Multer.File,
    maxSizeMB: number = 500,
  ): void {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid video type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `Video size exceeds limit. Max size: ${maxSizeMB}MB`,
      );
    }
  }
}
