import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UploadService } from './upload.service';
import { CloudinaryService, CloudinarySignatureResponse } from './cloudinary.service';
import { VimeoService } from './vimeo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/zip'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
@ApiBearerAuth()
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly vimeoService: VimeoService,
  ) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an image' })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    this.uploadService.validateFile(file, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE);
    return this.uploadService.uploadFile(file, 'images');
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a video' })
  @ApiResponse({ status: 201, description: 'Video uploaded successfully' })
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    this.uploadService.validateFile(file, ALLOWED_VIDEO_TYPES, MAX_FILE_SIZE);
    return this.uploadService.uploadFile(file, 'videos');
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a document' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    this.uploadService.validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE);
    return this.uploadService.uploadFile(file, 'documents');
  }

  @Post('presigned')
  @ApiOperation({ summary: 'Get a presigned URL for direct upload' })
  @ApiResponse({ status: 201, description: 'Presigned URL generated' })
  async getPresignedUrl(
    @Body() body: { filename: string; contentType: string; folder?: string },
  ) {
    return this.uploadService.getPresignedUploadUrl(
      body.filename,
      body.contentType,
      body.folder || 'uploads',
    );
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('key') key: string) {
    await this.uploadService.deleteFile(key);
    return { message: 'File deleted successfully' };
  }

  // Cloudinary endpoints for video uploads (organizer portal)
  @Post('cloudinary/video/signature')
  @ApiOperation({
    summary: 'Get signed params for direct Cloudinary video upload',
  })
  @ApiResponse({
    status: 201,
    description: 'Signed upload params generated',
    schema: {
      type: 'object',
      properties: {
        signature: { type: 'string' },
        timestamp: { type: 'number' },
        cloudName: { type: 'string' },
        apiKey: { type: 'string' },
        folder: { type: 'string' },
        publicId: { type: 'string' },
      },
    },
  })
  async getCloudinaryVideoSignature(
    @Body() body: { folder?: string },
  ) {
    return this.cloudinaryService.generateSignedUploadParams(
      body.folder || 'videos',
      'video',
    );
  }

  @Post('cloudinary/image/signature')
  @ApiOperation({
    summary: 'Get signed params for direct Cloudinary image upload',
  })
  @ApiResponse({ status: 201, description: 'Signed upload params generated' })
  async getCloudinaryImageSignature(
    @Body() body: { folder?: string },
  ) {
    return this.cloudinaryService.generateSignedUploadParams(
      body.folder || 'images',
      'image',
    );
  }

  @Delete('cloudinary/:publicId')
  @ApiOperation({ summary: 'Delete a file from Cloudinary' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteCloudinaryFile(
    @Param('publicId') publicId: string,
    @Body() body: { resourceType?: 'video' | 'image' | 'raw' },
  ) {
    await this.cloudinaryService.deleteFile(
      publicId,
      body.resourceType || 'video',
    );
    return { message: 'File deleted successfully' };
  }

  // Vimeo endpoints for video uploads (organizer portal)
  @Post('vimeo/video/upload-ticket')
  @ApiOperation({
    summary: 'Create a Vimeo upload ticket for resumable uploads',
  })
  @ApiResponse({
    status: 201,
    description: 'Upload ticket created',
    schema: {
      type: 'object',
      properties: {
        uploadLink: { type: 'string' },
        videoUri: { type: 'string' },
        videoId: { type: 'string' },
      },
    },
  })
  async createVimeoUploadTicket(
    @Body() body: { fileSize: number; fileName: string; description?: string },
  ) {
    return this.vimeoService.createUploadTicket(
      body.fileSize,
      body.fileName,
      body.description,
    );
  }

  @Get('vimeo/video/:videoId')
  @ApiOperation({ summary: 'Get Vimeo video details' })
  @ApiResponse({
    status: 200,
    description: 'Video details retrieved',
  })
  async getVimeoVideoDetails(@Param('videoId') videoId: string) {
    return this.vimeoService.getVideoDetails(videoId);
  }

  @Get('vimeo/video/:videoId/status')
  @ApiOperation({ summary: 'Check if Vimeo video is ready for playback' })
  @ApiResponse({
    status: 200,
    description: 'Video status',
    schema: {
      type: 'object',
      properties: {
        ready: { type: 'boolean' },
      },
    },
  })
  async checkVimeoVideoStatus(@Param('videoId') videoId: string) {
    const ready = await this.vimeoService.isVideoReady(videoId);
    return { ready };
  }

  @Delete('vimeo/video/:videoId')
  @ApiOperation({ summary: 'Delete a video from Vimeo' })
  @ApiResponse({ status: 200, description: 'Video deleted successfully' })
  async deleteVimeoVideo(@Param('videoId') videoId: string) {
    await this.vimeoService.deleteVideo(videoId);
    return { message: 'Video deleted successfully' };
  }
}
