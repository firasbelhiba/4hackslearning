import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

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

  async getAdminStats() {
    const [totalUsers, totalCourses, totalEnrollments, totalCertificates] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.course.count(),
        this.prisma.enrollment.count(),
        this.prisma.certificate.count(),
      ]);

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalCertificates,
    };
  }

  excludePassword(user: User) {
    const { password, refreshToken, ...result } = user;
    return result;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return false;
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return true;
  }

  async getNotificationPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailCourseUpdates: true,
        emailNewCourses: true,
        emailCompletionReminders: true,
        emailCertificates: true,
        emailMarketing: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateNotificationPreferences(
    userId: string,
    data: {
      emailCourseUpdates?: boolean;
      emailNewCourses?: boolean;
      emailCompletionReminders?: boolean;
      emailCertificates?: boolean;
      emailMarketing?: boolean;
    },
  ) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        emailCourseUpdates: true,
        emailNewCourses: true,
        emailCompletionReminders: true,
        emailCertificates: true,
        emailMarketing: true,
      },
    });
  }

  async getCertificateSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        certificateDisplayName: true,
        linkedinAutoShare: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      certificateDisplayName: user.certificateDisplayName || user.name,
      linkedinAutoShare: user.linkedinAutoShare,
    };
  }

  async updateCertificateSettings(
    userId: string,
    data: {
      certificateDisplayName?: string;
      linkedinAutoShare?: boolean;
    },
  ) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        certificateDisplayName: true,
        linkedinAutoShare: true,
      },
    });
  }

  async getAppearanceSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        theme: true,
        language: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateAppearanceSettings(
    userId: string,
    data: {
      theme?: 'LIGHT' | 'DARK' | 'SYSTEM';
      language?: string;
    },
  ) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        theme: true,
        language: true,
      },
    });
  }

  // Privacy & Security Settings
  async getPrivacySettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        profileVisibility: true,
        showOnLeaderboard: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updatePrivacySettings(
    userId: string,
    data: {
      profileVisibility?: string;
      showOnLeaderboard?: boolean;
    },
  ) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        profileVisibility: true,
        showOnLeaderboard: true,
      },
    });
  }

  // 2FA Methods
  async generate2FASecret(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    const secret = speakeasy.generateSecret({
      name: `4HACKS Learning (${user.email})`,
      issuer: '4HACKS Learning',
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    // Store secret temporarily (will be confirmed when user verifies)
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    return {
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
    };
  }

  async enable2FA(userId: string, code: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('Please generate a 2FA secret first');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { message: '2FA enabled successfully' };
  }

  async disable2FA(userId: string, code: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return { message: '2FA disabled successfully' };
  }

  // Session Management
  async getSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        browser: true,
        os: true,
        ipAddress: true,
        location: true,
        isCurrentSession: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });
  }

  async createSession(
    userId: string,
    sessionData: {
      deviceName?: string;
      deviceType?: string;
      browser?: string;
      os?: string;
      ipAddress?: string;
      location?: string;
    },
    expiresIn: number = 7 * 24 * 60 * 60 * 1000, // 7 days
  ) {
    const expiresAt = new Date(Date.now() + expiresIn);

    return this.prisma.userSession.create({
      data: {
        userId,
        ...sessionData,
        isCurrentSession: true,
        expiresAt,
      },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.userSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.userSession.delete({
      where: { id: sessionId },
    });

    return { message: 'Session revoked successfully' };
  }

  async revokeAllOtherSessions(userId: string, currentSessionId?: string) {
    await this.prisma.userSession.deleteMany({
      where: {
        userId,
        ...(currentSessionId ? { id: { not: currentSessionId } } : {}),
      },
    });

    return { message: 'All other sessions revoked successfully' };
  }
}
