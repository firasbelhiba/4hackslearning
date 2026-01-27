import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({ example: 120, description: 'Watched time in seconds' })
  @IsInt()
  @Min(0)
  watchedSeconds: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
