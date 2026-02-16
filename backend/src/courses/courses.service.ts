import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CourseFiltersDto } from './dto/course-filters.dto';
import { ReorderModulesDto } from './dto/reorder-modules.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(instructorId: string, dto: CreateCourseDto) {
    const existingCourse = await this.prisma.course.findUnique({
      where: { slug: dto.slug },
    });

    if (existingCourse) {
      throw new ConflictException('Course with this slug already exists');
    }

    return this.prisma.course.create({
      data: {
        ...dto,
        instructorId,
      },
      include: {
        instructor: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async findAll(filters: CourseFiltersDto & { skip?: number; take?: number }) {
    const {
      search,
      category,
      level,
      tags,
      isFree,
      isPublished = true,
      skip = 0,
      take = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: any = { isPublished };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (typeof isFree === 'boolean') {
      where.isFree = isFree;
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          instructor: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { enrollments: true, modules: true },
          },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return { courses, total };
  }

  async findBySlug(slugOrId: string, byId = false) {
    const course = await this.prisma.course.findUnique({
      where: byId ? { id: slugOrId } : { slug: slugOrId },
      include: {
        instructor: {
          select: { id: true, name: true, avatar: true, bio: true },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: { resources: true },
            },
            quiz: {
              select: { id: true, title: true, passingScore: true, timeLimit: true },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
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
            quiz: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: string, dto: UpdateCourseDto) {
    await this.findById(id);

    if (dto.slug) {
      const existingCourse = await this.prisma.course.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });

      if (existingCourse) {
        throw new ConflictException('Course with this slug already exists');
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: {
        instructor: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.course.delete({ where: { id } });
  }

  // Module operations
  async createModule(courseId: string, dto: CreateModuleDto) {
    await this.findById(courseId);

    // Auto-calculate order if not provided
    let order = dto.order;
    if (order === undefined) {
      const lastModule = await this.prisma.module.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
      });
      order = lastModule ? lastModule.order + 1 : 0;
    }

    return this.prisma.module.create({
      data: {
        title: dto.title,
        description: dto.description,
        order,
        courseId,
      },
      include: {
        lessons: true,
        quiz: true,
      },
    });
  }

  async updateModule(moduleId: string, dto: Partial<CreateModuleDto>) {
    return this.prisma.module.update({
      where: { id: moduleId },
      data: dto,
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async deleteModule(moduleId: string) {
    await this.prisma.module.delete({ where: { id: moduleId } });
  }

  /**
   * Reorder modules within a course (drag-drop support)
   */
  async reorderModules(courseId: string, dto: ReorderModulesDto) {
    await this.findById(courseId);

    // Update all module orders in a transaction
    const updates = dto.modules.map((item) =>
      this.prisma.module.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );

    await this.prisma.$transaction(updates);

    // Return updated course with modules
    return this.findById(courseId);
  }

  // Lesson operations
  async createLesson(moduleId: string, dto: CreateLessonDto) {
    // Auto-calculate order if not provided
    let order = dto.order;
    if (order === undefined) {
      const lastLesson = await this.prisma.lesson.findFirst({
        where: { moduleId },
        orderBy: { order: 'desc' },
      });
      order = lastLesson ? lastLesson.order + 1 : 0;
    }

    return this.prisma.lesson.create({
      data: {
        title: dto.title,
        description: dto.description,
        content: dto.content,
        videoUrl: dto.videoUrl,
        videoDuration: dto.videoDuration,
        vimeoVideoId: dto.vimeoVideoId,
        order,
        moduleId,
      },
      include: { resources: true },
    });
  }

  async findLessonById(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        resources: {
          orderBy: { order: 'asc' },
        },
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: { id: true, title: true, organizationId: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async updateLesson(lessonId: string, dto: Partial<CreateLessonDto>) {
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: dto,
      include: { resources: true },
    });
  }

  async deleteLesson(lessonId: string) {
    await this.prisma.lesson.delete({ where: { id: lessonId } });
  }

  /**
   * Reorder lessons within a module or move between modules (drag-drop support)
   */
  async reorderLessons(courseId: string, dto: ReorderLessonsDto) {
    await this.findById(courseId);

    // Update all lesson orders (and optionally moduleId) in a transaction
    const updates = dto.lessons.map((item) => {
      const data: any = { order: item.order };
      if (item.moduleId) {
        data.moduleId = item.moduleId;
      }
      return this.prisma.lesson.update({
        where: { id: item.id },
        data,
      });
    });

    await this.prisma.$transaction(updates);

    // Return updated course with modules and lessons
    return this.findById(courseId);
  }

  // Resource operations
  async createResource(lessonId: string, dto: { title: string; type: string; url: string; fileSize?: number; isDownloadable?: boolean }) {
    // Auto-calculate order
    const lastResource = await this.prisma.resource.findFirst({
      where: { lessonId },
      orderBy: { order: 'desc' },
    });
    const order = lastResource ? lastResource.order + 1 : 0;

    return this.prisma.resource.create({
      data: {
        ...dto,
        order,
        lessonId,
      } as any,
    });
  }

  async updateResource(resourceId: string, dto: Partial<{ title: string; type: string; url: string; fileSize?: number; isDownloadable?: boolean }>) {
    return this.prisma.resource.update({
      where: { id: resourceId },
      data: dto as any,
    });
  }

  async deleteResource(resourceId: string) {
    await this.prisma.resource.delete({ where: { id: resourceId } });
  }

  async getCategories() {
    const categories = await this.prisma.course.groupBy({
      by: ['category'],
      _count: { category: true },
      where: { isPublished: true },
    });

    return categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    }));
  }

  async getTags() {
    const courses = await this.prisma.course.findMany({
      where: { isPublished: true },
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
    courses.forEach((course) => {
      course.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts).map(([name, count]) => ({ name, count }));
  }

  // ==========================================
  // Organization-based course methods
  // ==========================================

  /**
   * Create a course for an organization (organizer portal)
   */
  async createForOrganization(
    organizationId: string,
    userId: string,
    dto: CreateCourseDto,
  ) {
    // Verify user has access to this organization
    await this.organizationsService.verifyMemberAccess(organizationId, userId);

    const existingCourse = await this.prisma.course.findUnique({
      where: { slug: dto.slug },
    });

    if (existingCourse) {
      throw new ConflictException('Course with this slug already exists');
    }

    return this.prisma.course.create({
      data: {
        ...dto,
        instructorId: userId,
        organizationId,
      },
      include: {
        instructor: {
          select: { id: true, name: true, avatar: true },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  /**
   * Get all courses for an organization
   */
  async findByOrganization(
    organizationId: string,
    filters: { skip?: number; take?: number; isPublished?: boolean } = {},
  ) {
    const { skip = 0, take = 50, isPublished } = filters;

    const where: any = { organizationId };
    if (typeof isPublished === 'boolean') {
      where.isPublished = isPublished;
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { enrollments: true, modules: true },
          },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return { courses, total };
  }

  /**
   * Update a course (with organization access check)
   */
  async updateForOrganization(
    courseId: string,
    userId: string,
    dto: UpdateCourseDto,
  ) {
    const course = await this.findById(courseId);

    if (!course.organizationId) {
      throw new ForbiddenException('This course is not part of an organization');
    }

    // Verify user has access to this organization
    await this.organizationsService.verifyMemberAccess(
      course.organizationId,
      userId,
    );

    if (dto.slug) {
      const existingCourse = await this.prisma.course.findFirst({
        where: { slug: dto.slug, id: { not: courseId } },
      });

      if (existingCourse) {
        throw new ConflictException('Course with this slug already exists');
      }
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: dto,
      include: {
        instructor: {
          select: { id: true, name: true, avatar: true },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  /**
   * Delete a course (with organization access check)
   */
  async deleteForOrganization(courseId: string, userId: string) {
    const course = await this.findById(courseId);

    if (!course.organizationId) {
      throw new ForbiddenException('This course is not part of an organization');
    }

    // Verify user has access to this organization
    await this.organizationsService.verifyMemberAccess(
      course.organizationId,
      userId,
    );

    await this.prisma.course.delete({ where: { id: courseId } });
  }

  /**
   * Verify user has access to a course's organization
   */
  async verifyOrganizationAccess(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { organizationId: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.organizationId) {
      throw new ForbiddenException('This course is not part of an organization');
    }

    return this.organizationsService.verifyMemberAccess(
      course.organizationId,
      userId,
    );
  }
}
