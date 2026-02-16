import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MinLength, MaxLength, Min } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ example: 'Getting Started with DeFi' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Introduction to decentralized finance concepts' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
