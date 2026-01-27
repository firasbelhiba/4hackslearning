import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsUrl, MinLength, MaxLength, Min } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'What is DeFi?' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Understanding the basics of decentralized finance' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '# Introduction to DeFi\n\nDeFi stands for...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({ example: 600, description: 'Video duration in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  videoDuration?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  order: number;
}
