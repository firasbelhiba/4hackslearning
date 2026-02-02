import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCertificateSettingsDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  certificateDisplayName?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  linkedinAutoShare?: boolean;
}
