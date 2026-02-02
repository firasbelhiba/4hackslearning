import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;
  private isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    // Support both R2_ and S3_ prefixed environment variables
    const endpoint = this.configService.get<string>('S3_ENDPOINT') ||
                     this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID') ||
                        this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY') ||
                            this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') ||
                      this.configService.get<string>('R2_BUCKET_NAME') || '4hacks-uploads';
    this.publicUrl = this.configService.get<string>('S3_PUBLIC_URL') ||
                     this.configService.get<string>('R2_PUBLIC_URL') || '';
    const region = this.configService.get<string>('S3_REGION') || 'auto';

    // Only initialize S3 client if credentials are provided
    if (endpoint && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: region,
        endpoint: endpoint,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
      });
      this.isConfigured = true;
    }
  }

  validateFile(
    file: Express.Multer.File,
    allowedMimeTypes: string[],
    maxSize: number,
  ): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`,
      );
    }
  }

  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder: string = 'uploads',
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    if (!this.isConfigured) {
      throw new BadRequestException('R2 storage is not configured');
    }

    const fileExtension = filename.split('.').pop();
    const key = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return {
      uploadUrl,
      fileUrl: `${this.publicUrl}/${key}`,
      key,
    };
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'avatars',
  ): Promise<{ url: string; key: string }> {
    if (!this.isConfigured) {
      throw new BadRequestException('R2 storage is not configured');
    }

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      // Return the public URL and key
      return {
        url: `${this.publicUrl}/${fileName}`,
        key: fileName,
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl || !fileUrl.startsWith(this.publicUrl)) {
      return;
    }

    const key = fileUrl.replace(`${this.publicUrl}/`, '');

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('R2 delete error:', error);
      // Don't throw, just log the error
    }
  }
}
