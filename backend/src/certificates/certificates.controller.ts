import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all user certificates' })
  @ApiResponse({ status: 200, description: 'List of certificates' })
  async findUserCertificates(@CurrentUser('id') userId: string) {
    return this.certificatesService.findUserCertificates(userId);
  }

  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify a certificate by code (public)' })
  @ApiResponse({ status: 200, description: 'Certificate verification result' })
  async verify(@Param('code') code: string) {
    return this.certificatesService.verify(code);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get certificate by ID' })
  @ApiResponse({ status: 200, description: 'Certificate found' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  async findOne(@Param('id') id: string) {
    return this.certificatesService.findById(id);
  }
}
