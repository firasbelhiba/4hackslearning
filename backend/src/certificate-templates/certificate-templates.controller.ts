import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CertificateTemplatesService } from './certificate-templates.service';
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { UpdateCertificateTemplateDto } from './dto/update-certificate-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('certificate-templates')
@Controller('organizations/:organizationId/certificate-templates')
export class CertificateTemplatesController {
  constructor(
    private readonly certificateTemplatesService: CertificateTemplatesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a certificate template for an organization' })
  @ApiResponse({ status: 201, description: 'Template created' })
  async create(
    @Param('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCertificateTemplateDto,
  ) {
    return this.certificateTemplatesService.create(organizationId, userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all certificate templates for an organization' })
  @ApiResponse({ status: 200, description: 'List of templates' })
  async findAll(@Param('organizationId') organizationId: string) {
    return this.certificateTemplatesService.findAllByOrganization(organizationId);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get the default certificate template for an organization' })
  @ApiResponse({ status: 200, description: 'Default template' })
  async findDefault(@Param('organizationId') organizationId: string) {
    return this.certificateTemplatesService.findDefaultByOrganization(
      organizationId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a certificate template by ID' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findById(@Param('id') id: string) {
    return this.certificateTemplatesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a certificate template' })
  @ApiResponse({ status: 200, description: 'Template updated' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCertificateTemplateDto,
  ) {
    return this.certificateTemplatesService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a certificate template' })
  @ApiResponse({ status: 200, description: 'Template deleted' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.certificateTemplatesService.delete(id, userId);
    return { message: 'Certificate template deleted successfully' };
  }

  @Post(':id/set-default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set a certificate template as default' })
  @ApiResponse({ status: 200, description: 'Template set as default' })
  async setDefault(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.certificateTemplatesService.setDefault(id, userId);
  }
}
