import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCertificateTemplateDto {
  @ApiProperty({ example: 'Default Certificate' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      accentColor: '#D6FF25',
      logoPosition: 'top-center',
      borderStyle: 'double',
      fontFamily: 'Outfit',
    },
    description: 'JSON configuration for certificate template design',
  })
  @IsObject()
  templateConfig: Record<string, any>;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
