import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdatePrivacySettingsDto {
  @ApiProperty({ example: 'public', required: false, enum: ['public', 'private'] })
  @IsString()
  @IsIn(['public', 'private'])
  @IsOptional()
  profileVisibility?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  showOnLeaderboard?: boolean;
}

export class Enable2FADto {
  @ApiProperty({ example: '123456', description: 'TOTP code from authenticator app' })
  @IsString()
  code: string;
}

export class Disable2FADto {
  @ApiProperty({ example: '123456', description: 'TOTP code to verify' })
  @IsString()
  code: string;
}
