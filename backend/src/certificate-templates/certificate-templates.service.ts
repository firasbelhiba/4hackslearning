import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { UpdateCertificateTemplateDto } from './dto/update-certificate-template.dto';
import { OrganizationMemberRole } from '@prisma/client';

@Injectable()
export class CertificateTemplatesService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    organizationId: string,
    userId: string,
    dto: CreateCertificateTemplateDto,
  ) {
    // Verify user has access to this organization
    await this.organizationsService.verifyMemberAccess(organizationId, userId);

    // If this is set as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.certificateTemplate.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.certificateTemplate.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async findAllByOrganization(organizationId: string) {
    return this.prisma.certificateTemplate.findMany({
      where: { organizationId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const template = await this.prisma.certificateTemplate.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Certificate template not found');
    }

    return template;
  }

  async findDefaultByOrganization(organizationId: string) {
    const template = await this.prisma.certificateTemplate.findFirst({
      where: { organizationId, isDefault: true },
    });

    if (!template) {
      // Return the first template if no default is set
      return this.prisma.certificateTemplate.findFirst({
        where: { organizationId },
        orderBy: { createdAt: 'asc' },
      });
    }

    return template;
  }

  async update(id: string, userId: string, dto: UpdateCertificateTemplateDto) {
    const template = await this.findById(id);

    // Verify user has access to this organization
    await this.organizationsService.verifyMemberAccess(
      template.organizationId,
      userId,
    );

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.certificateTemplate.updateMany({
        where: { organizationId: template.organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.certificateTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const template = await this.findById(id);

    // Verify user has owner access to this organization
    await this.organizationsService.verifyMemberAccess(
      template.organizationId,
      userId,
      [OrganizationMemberRole.OWNER],
    );

    await this.prisma.certificateTemplate.delete({ where: { id } });
  }

  async setDefault(id: string, userId: string) {
    const template = await this.findById(id);

    // Verify user has access to this organization
    await this.organizationsService.verifyMemberAccess(
      template.organizationId,
      userId,
    );

    // Unset other defaults
    await this.prisma.certificateTemplate.updateMany({
      where: { organizationId: template.organizationId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this one as default
    return this.prisma.certificateTemplate.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
