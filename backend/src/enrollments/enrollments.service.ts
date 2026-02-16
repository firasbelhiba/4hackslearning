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

  async findCourseEnrollments(courseId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        lessonProgress: {
          select: {
            lessonId: true,
            completed: true,
            completedAt: true,
            watchedSeconds: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Get certificates for all enrolled users in this course
    const certificates = await this.prisma.certificate.findMany({
      where: { courseId },
      select: {
        id: true,
        userId: true,
        uniqueCode: true,
        issuedAt: true,
        pdfUrl: true,
      },
    });

    // Map certificates to enrollments
    const certificateMap = new Map(
      certificates.map((cert) => [cert.userId, cert]),
    );

    return enrollments.map((enrollment) => ({
      ...enrollment,
      certificate: certificateMap.get(enrollment.userId) || null,
    }));
  }

  async getCourseAnalytics(courseId: string) {
    // Get course with lesson count
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
            quiz: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const totalLessons = course.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0,
    );
    const totalQuizzes = course.modules.filter((m) => m.quiz).length;

    // Get enrollment stats
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      select: {
        id: true,
        progress: true,
        status: true,
        enrolledAt: true,
        completedAt: true,
      },
    });

    const totalEnrollments = enrollments.length;
    const completedCount = enrollments.filter((e) => e.status === 'COMPLETED').length;
    const inProgressCount = enrollments.filter(
      (e) => e.status === 'ACTIVE' && e.progress > 0,
    ).length;
    const notStartedCount = enrollments.filter(
      (e) => e.status === 'ACTIVE' && e.progress === 0,
    ).length;

    // Calculate average progress
    const avgProgress =
      totalEnrollments > 0
        ? enrollments.reduce((acc, e) => acc + e.progress, 0) / totalEnrollments
        : 0;

    // Get certificate count
    const certificateCount = await this.prisma.certificate.count({
      where: { courseId },
    });

    // Get recent enrollments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEnrollments = enrollments.filter(
      (e) => new Date(e.enrolledAt) >= thirtyDaysAgo,
    ).length;

    // Get completion rate
    const completionRate =
      totalEnrollments > 0 ? (completedCount / totalEnrollments) * 100 : 0;

    return {
      totalEnrollments,
      completedCount,
      inProgressCount,
      notStartedCount,
      certificateCount,
      avgProgress: Math.round(avgProgress * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      recentEnrollments,
      totalLessons,
      totalQuizzes,
    };
  }
}
