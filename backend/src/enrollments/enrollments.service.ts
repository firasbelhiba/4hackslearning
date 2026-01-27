import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private certificatesService: CertificatesService,
  ) {}

  async enroll(userId: string, courseId: string) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.isPublished) {
      throw new BadRequestException('Course is not published');
    }

    // Check if already enrolled
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existing) {
      throw new ConflictException('Already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    // Initialize lesson progress for all lessons
    const lessons = enrollment.course.modules.flatMap((m) => m.lessons);
    if (lessons.length > 0) {
      await this.prisma.lessonProgress.createMany({
        data: lessons.map((lesson) => ({
          enrollmentId: enrollment.id,
          lessonId: lesson.id,
        })),
      });
    }

    return enrollment;
  }

  async findUserEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, name: true, avatar: true },
            },
            _count: {
              select: { modules: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async findEnrollment(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, name: true, avatar: true },
            },
            modules: {
              orderBy: { order: 'asc' },
              include: {
                lessons: {
                  orderBy: { order: 'asc' },
                  include: { resources: true },
                },
                quiz: {
                  select: {
                    id: true,
                    title: true,
                    passingScore: true,
                    timeLimit: true,
                  },
                },
              },
            },
          },
        },
        lessonProgress: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async updateLessonProgress(
    userId: string,
    enrollmentId: string,
    lessonId: string,
    dto: UpdateProgressDto,
  ) {
    // Verify enrollment belongs to user
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Update lesson progress
    const lessonProgress = await this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId, lessonId },
      },
      update: {
        watchedSeconds: dto.watchedSeconds,
        completed: dto.completed,
        completedAt: dto.completed ? new Date() : null,
      },
      create: {
        enrollmentId,
        lessonId,
        watchedSeconds: dto.watchedSeconds,
        completed: dto.completed,
        completedAt: dto.completed ? new Date() : null,
      },
    });

    // Recalculate course progress
    const allLessons = enrollment.course.modules.flatMap((m) => m.lessons);
    const completedLessons = await this.prisma.lessonProgress.count({
      where: { enrollmentId, completed: true },
    });

    const progress =
      allLessons.length > 0 ? (completedLessons / allLessons.length) * 100 : 0;

    // Check if course is completed
    const isCompleted = progress === 100;

    await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Auto-generate certificate if completed
    if (isCompleted) {
      const existingCert = await this.prisma.certificate.findUnique({
        where: {
          userId_courseId: { userId, courseId: enrollment.courseId },
        },
      });

      if (!existingCert) {
        await this.certificatesService.create(userId, enrollment.courseId);
      }
    }

    return lessonProgress;
  }

  async getLessonProgress(enrollmentId: string, lessonId: string) {
    return this.prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: { enrollmentId, lessonId },
      },
    });
  }

  async unenroll(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.prisma.enrollment.delete({
      where: { id: enrollment.id },
    });
  }

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    return !!enrollment;
  }
}
