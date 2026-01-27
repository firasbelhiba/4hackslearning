import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CourseFiltersDto } from './dto/course-filters.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

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

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
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

    return this.prisma.module.create({
      data: {
        ...dto,
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
    });
  }

  async deleteModule(moduleId: string) {
    await this.prisma.module.delete({ where: { id: moduleId } });
  }

  // Lesson operations
  async createLesson(moduleId: string, dto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: {
        ...dto,
        moduleId,
      },
      include: { resources: true },
    });
  }

  async updateLesson(lessonId: string, dto: Partial<CreateLessonDto>) {
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: dto,
    });
  }

  async deleteLesson(lessonId: string) {
    await this.prisma.lesson.delete({ where: { id: lessonId } });
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
}
