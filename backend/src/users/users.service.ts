import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          bio: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });
  }

  async getStats(userId: string) {
    const [enrollments, certificates] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: true,
          lessonProgress: true,
        },
      }),
      this.prisma.certificate.count({ where: { userId } }),
    ]);

    const completedCourses = enrollments.filter(
      (e) => e.status === 'COMPLETED',
    ).length;
    const inProgressCourses = enrollments.filter(
      (e) => e.status === 'ACTIVE',
    ).length;

    const totalWatchTime = enrollments.reduce((acc, enrollment) => {
      return (
        acc +
        enrollment.lessonProgress.reduce((sum, lp) => sum + lp.watchedSeconds, 0)
      );
    }, 0);

    return {
      totalCourses: enrollments.length,
      completedCourses,
      inProgressCourses,
      totalCertificates: certificates,
      totalWatchTime,
    };
  }

  excludePassword(user: User) {
    const { password, refreshToken, ...result } = user;
    return result;
  }
}
