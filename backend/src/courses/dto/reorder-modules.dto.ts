import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ModuleOrderItem {
  @ApiProperty({ description: 'Module ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'New order position (0-based)' })
  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderModulesDto {
  @ApiProperty({ description: 'Array of module IDs with their new order', type: [ModuleOrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleOrderItem)
  modules: ModuleOrderItem[];
}
