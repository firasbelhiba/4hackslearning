import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateQuizDto {
  @ApiProperty({ example: 'Module 1 Quiz' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Test your knowledge of DeFi basics' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 70, default: 70 })
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore: number;

  @ApiPropertyOptional({ example: 30, description: 'Time limit in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(180)
  timeLimit?: number;
}
