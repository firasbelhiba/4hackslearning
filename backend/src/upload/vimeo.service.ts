import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Vimeo from '@vimeo/vimeo';

export interface VimeoUploadResponse {
  uri: string;
  videoId: string;
  link: string;
  playerEmbedUrl: string;
  status: string;
}

export interface VimeoVideoDetails {
  uri: string;
  name: string;
  description: string;
  duration: number;
  width: number;
  height: number;
  status: string;
  link: string;
  playerEmbedUrl: string;
  pictures: {
    sizes: Array<{
      width: number;
      height: number;
      link: string;
    }>;
  };
}

export interface VimeoUploadTicket {
  uploadLink: string;
  videoUri: string;
  videoId: string;
}

@Injectable()
export class VimeoService {
  private client: any;
  private readonly logger = new Logger(VimeoService.name);

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get('VIMEO_CLIENT_ID');
    const clientSecret = this.configService.get('VIMEO_CLIENT_SECRET');
    const accessToken = this.configService.get('VIMEO_ACCESS_TOKEN');

    if (clientId && clientSecret && accessToken) {
      this.client = new Vimeo.Vimeo(clientId, clientSecret, accessToken);
    } else {
      this.logger.warn('Vimeo credentials not configured');
    }
  }

  /**
   * Create an upload ticket for tus resumable uploads (client-side upload)
   * This is the recommended approach for large video files
   */
  async createUploadTicket(
    fileSize: number,
    fileName: string,
    description?: string,
  ): Promise<VimeoUploadTicket> {
    if (!this.client) {
      throw new BadRequestException('Vimeo service not configured');
    }

    return new Promise((resolve, reject) => {
      this.client.request(
        {
          method: 'POST',
          path: '/me/videos',
          query: {
            upload: {
              approach: 'tus',
              size: fileSize,
            },
            name: fileName,
            description: description || '',
            privacy: {
              view: 'anybody',
              embed: 'public',
            },
          },
        },
        (error: any, body: any) => {
          if (error) {
            this.logger.error('Failed to create upload ticket', error);
            reject(new BadRequestException('Failed to create Vimeo upload ticket'));
            return;
          }

          const videoUri = body.uri;
          const videoId = videoUri.split('/').pop();

          resolve({
            uploadLink: body.upload.upload_link,
            videoUri: videoUri,
            videoId: videoId,
          });
        },
      );
    });
  }

  /**
   * Upload a video from buffer (for smaller files or server-side processing)
   */
  async uploadVideo(
    filePath: string,
    name: string,
    description?: string,
  ): Promise<VimeoUploadResponse> {
    if (!this.client) {
      throw new BadRequestException('Vimeo service not configured');
    }

    return new Promise((resolve, reject) => {
      this.client.upload(
        filePath,
        {
          name: name,
          description: description || '',
          privacy: {
            view: 'anybody',
            embed: 'public',
          },
        },
        (uri: string) => {
          // Upload complete, get video details
          this.client.request(uri, (error: any, body: any) => {
            if (error) {
              reject(error);
              return;
            }

            const videoId = uri.split('/').pop();
            resolve({
              uri: uri,
              videoId: videoId || '',
              link: body.link,
              playerEmbedUrl: body.player_embed_url,
              status: body.status,
            });
          });
        },
        (bytesUploaded: number, bytesTotal: number) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          this.logger.log(`Upload progress: ${percentage}%`);
        },
        (error: any) => {
          this.logger.error('Upload failed', error);
          reject(new BadRequestException('Video upload failed'));
        },
      );
    });
  }

  /**
   * Get video details by URI or ID
   */
  async getVideoDetails(videoIdOrUri: string): Promise<VimeoVideoDetails> {
    if (!this.client) {
      throw new BadRequestException('Vimeo service not configured');
    }

    const uri = videoIdOrUri.startsWith('/videos/')
      ? videoIdOrUri
      : `/videos/${videoIdOrUri}`;

    return new Promise((resolve, reject) => {
      this.client.request(
        {
          method: 'GET',
          path: uri,
        },
        (error: any, body: any) => {
          if (error) {
            this.logger.error('Failed to get video details', error);
            reject(new BadRequestException('Failed to get video details'));
            return;
          }

          resolve({
            uri: body.uri,
            name: body.name,
            description: body.description || '',
            duration: body.duration,
            width: body.width,
            height: body.height,
            status: body.status,
            link: body.link,
            playerEmbedUrl: body.player_embed_url,
            pictures: body.pictures,
          });
        },
      );
    });
  }

  /**
   * Delete a video from Vimeo
   */
  async deleteVideo(videoIdOrUri: string): Promise<void> {
    if (!this.client) {
      throw new BadRequestException('Vimeo service not configured');
    }

    const uri = videoIdOrUri.startsWith('/videos/')
      ? videoIdOrUri
      : `/videos/${videoIdOrUri}`;

    return new Promise((resolve, reject) => {
      this.client.request(
        {
          method: 'DELETE',
          path: uri,
        },
        (error: any) => {
          if (error) {
            this.logger.error('Failed to delete video', error);
            reject(new BadRequestException('Failed to delete video'));
            return;
          }
          resolve();
        },
      );
    });
  }

  /**
   * Get the embed URL for a video
   */
  getEmbedUrl(videoId: string, options: { autoplay?: boolean; loop?: boolean } = {}): string {
    let url = `https://player.vimeo.com/video/${videoId}`;
    const params: string[] = [];

    if (options.autoplay) {
      params.push('autoplay=1');
    }
    if (options.loop) {
      params.push('loop=1');
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return url;
  }

  /**
   * Get thumbnail URL for a video
   */
  async getThumbnailUrl(videoId: string, width: number = 640): Promise<string> {
    const details = await this.getVideoDetails(videoId);

    if (details.pictures && details.pictures.sizes && details.pictures.sizes.length > 0) {
      // Find the closest size to requested width
      const sortedSizes = [...details.pictures.sizes].sort(
        (a, b) => Math.abs(a.width - width) - Math.abs(b.width - width),
      );
      return sortedSizes[0].link;
    }

    return '';
  }

  /**
   * Check if video has finished processing
   */
  async isVideoReady(videoId: string): Promise<boolean> {
    const details = await this.getVideoDetails(videoId);
    return details.status === 'available';
  }

  /**
   * Validate video file type
   */
  validateVideoFile(file: Express.Multer.File, maxSizeMB: number = 500): void {
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
    ];

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
