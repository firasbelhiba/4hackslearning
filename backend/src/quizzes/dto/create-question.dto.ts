import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  ValidateNested,
  MinLength,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';

class QuestionOptionDto {
  @ApiProperty({ example: 'opt1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Decentralized Finance' })
  @IsString()
  @MinLength(1)
  text: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'What does DeFi stand for?' })
  @IsString()
  @MinLength(3)
  text: string;

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ type: [QuestionOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[];

  @ApiPropertyOptional({ example: 'DeFi stands for Decentralized Finance...' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  points: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  order: number;
}
