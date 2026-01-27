import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  private generateUniqueCode(): string {
    const code = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
    return `4H${code}`;
  }

  async create(userId: string, courseId: string) {
    const uniqueCode = this.generateUniqueCode();

    return this.prisma.certificate.create({
      data: {
        uniqueCode,
        userId,
        courseId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });
  }

  async findUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            level: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async findByCode(code: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { uniqueCode: code },
      include: {
        user: {
          select: { id: true, name: true },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            level: true,
            instructor: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async findById(id: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            level: true,
            instructor: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async verify(code: string) {
    try {
      const certificate = await this.findByCode(code);
      return {
        valid: true,
        certificate: {
          uniqueCode: certificate.uniqueCode,
          recipientName: certificate.user.name,
          courseName: certificate.course.title,
          courseLevel: certificate.course.level,
          issuedAt: certificate.issuedAt,
          instructorName: certificate.course.instructor.name,
        },
      };
    } catch {
      return {
        valid: false,
        certificate: null,
      };
    }
  }

  async updatePdfUrl(id: string, pdfUrl: string) {
    return this.prisma.certificate.update({
      where: { id },
      data: { pdfUrl },
    });
  }

  async delete(id: string) {
    const certificate = await this.findById(id);
    await this.prisma.certificate.delete({ where: { id: certificate.id } });
  }
}
