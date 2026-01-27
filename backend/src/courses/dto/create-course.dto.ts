import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { CourseLevel } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to DeFi' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'introduction-to-defi' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  slug: string;

  @ApiProperty({ example: 'Learn the fundamentals of decentralized finance...' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'Master DeFi concepts and build your first protocol' })
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  shortDescription: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.jpg' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ enum: CourseLevel, default: CourseLevel.BEGINNER })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({ example: 'DeFi' })
  @IsString()
  category: string;

  @ApiProperty({ example: ['DeFi', 'Ethereum', 'Smart Contracts'] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
