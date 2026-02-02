import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ThemePreference } from '@prisma/client';

export class UpdateAppearanceSettingsDto {
  @ApiProperty({ enum: ThemePreference, example: 'SYSTEM', required: false })
  @IsEnum(ThemePreference)
  @IsOptional()
  theme?: ThemePreference;

  @ApiProperty({ example: 'en', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  language?: string;
}
