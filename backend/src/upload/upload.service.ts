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

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('S3_REGION') || 'auto',
      endpoint: this.configService.get('S3_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY') || '',
      },
    });

    this.bucketName = this.configService.get('S3_BUCKET_NAME') || '4hacks-learning';
    this.publicUrl = this.configService.get('S3_PUBLIC_URL') || '';
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const url = this.publicUrl
      ? `${this.publicUrl}/${key}`
      : `https://${this.bucketName}.s3.amazonaws.com/${key}`;

    return { url, key };
  }

  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder: string = 'uploads',
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    const fileExtension = filename.split('.').pop();
    const key = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    const fileUrl = this.publicUrl
      ? `${this.publicUrl}/${key}`
      : `https://${this.bucketName}.s3.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl, key };
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  validateFile(
    file: Express.Multer.File,
    allowedTypes: string[],
    maxSize: number,
  ): void {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit. Max size: ${maxSize / (1024 * 1024)}MB`,
      );
    }
  }
}
