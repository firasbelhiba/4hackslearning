import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { OrganizationMemberRole } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateOrganizationDto) {
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existingOrg) {
      throw new ConflictException('Organization with this slug already exists');
    }

    // Create organization and add the creator as owner
    return this.prisma.organization.create({
      data: {
        ...dto,
        members: {
          create: {
            userId: ownerId,
            role: OrganizationMemberRole.OWNER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { courses: true, certificateTemplates: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        _count: {
          select: { members: true, courses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        courses: {
          include: {
            instructor: {
              select: { id: true, name: true, avatar: true },
            },
            _count: {
              select: { enrollments: true },
            },
          },
        },
        certificateTemplates: true,
        _count: {
          select: { members: true, courses: true },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findById(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { members: true, courses: true, certificateTemplates: true },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findByUserId(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            _count: {
              select: { members: true, courses: true },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.organization,
      role: m.role,
    }));
  }

  async update(id: string, userId: string, dto: UpdateOrganizationDto) {
    await this.verifyMemberAccess(id, userId, [OrganizationMemberRole.OWNER]);

    if (dto.slug) {
      const existingOrg = await this.prisma.organization.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });

      if (existingOrg) {
        throw new ConflictException('Organization with this slug already exists');
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: dto,
      include: {
        _count: {
          select: { members: true, courses: true },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.verifyMemberAccess(id, userId, [OrganizationMemberRole.OWNER]);
    await this.prisma.organization.delete({ where: { id } });
  }

  // Member management
  async addMember(organizationId: string, userId: string, dto: AddMemberDto) {
    await this.verifyMemberAccess(organizationId, userId, [
      OrganizationMemberRole.OWNER,
    ]);

    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: dto.userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this organization');
    }

    return this.prisma.organizationMember.create({
      data: {
        organizationId,
        userId: dto.userId,
        role: dto.role || OrganizationMemberRole.MEMBER,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  async removeMember(organizationId: string, userId: string, memberId: string) {
    await this.verifyMemberAccess(organizationId, userId, [
      OrganizationMemberRole.OWNER,
    ]);

    // Prevent removing the last owner
    if (memberId === userId) {
      const ownerCount = await this.prisma.organizationMember.count({
        where: {
          organizationId,
          role: OrganizationMemberRole.OWNER,
        },
      });

      if (ownerCount <= 1) {
        throw new ForbiddenException(
          'Cannot remove the last owner. Transfer ownership first.',
        );
      }
    }

    await this.prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId: memberId,
        },
      },
    });
  }

  async updateMemberRole(
    organizationId: string,
    userId: string,
    memberId: string,
    role: OrganizationMemberRole,
  ) {
    await this.verifyMemberAccess(organizationId, userId, [
      OrganizationMemberRole.OWNER,
    ]);

    // If demoting an owner, ensure there's at least one other owner
    if (role === OrganizationMemberRole.MEMBER) {
      const member = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: memberId,
          },
        },
      });

      if (member?.role === OrganizationMemberRole.OWNER) {
        const ownerCount = await this.prisma.organizationMember.count({
          where: {
            organizationId,
            role: OrganizationMemberRole.OWNER,
          },
        });

        if (ownerCount <= 1) {
          throw new ForbiddenException(
            'Cannot demote the last owner. Promote another member first.',
          );
        }
      }
    }

    return this.prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId: memberId,
        },
      },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  // Helper to verify user has access to organization
  async verifyMemberAccess(
    organizationId: string,
    userId: string,
    allowedRoles?: OrganizationMemberRole[],
  ) {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (allowedRoles && !allowedRoles.includes(member.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return member;
  }

  // Get user's role in an organization
  async getUserRole(organizationId: string, userId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    return member?.role || null;
  }
}
