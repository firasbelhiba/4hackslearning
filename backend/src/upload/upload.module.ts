import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { CloudinaryService } from './cloudinary.service';
import { VimeoService } from './vimeo.service';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [UploadService, CloudinaryService, VimeoService],
  exports: [UploadService, CloudinaryService, VimeoService],
})
export class UploadModule {}
