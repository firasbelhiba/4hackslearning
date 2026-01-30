import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class LessonOrderItem {
  @ApiProperty({ description: 'Lesson ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'New order position (0-based)' })
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({ description: 'New module ID (for moving lessons between modules)', required: false })
  @IsString()
  @IsOptional()
  moduleId?: string;
}

export class ReorderLessonsDto {
  @ApiProperty({ description: 'Array of lesson IDs with their new order', type: [LessonOrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonOrderItem)
  lessons: LessonOrderItem[];
}
