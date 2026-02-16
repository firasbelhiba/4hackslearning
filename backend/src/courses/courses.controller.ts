import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CourseFiltersDto } from './dto/course-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created' })
  async create(
    @CurrentUser('id') instructorId: string,
    @Body() dto: CreateCourseDto,
  ) {
    return this.coursesService.create(instructorId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published courses' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  async findAll(@Query() filters: CourseFiltersDto) {
    const { page = 1, limit = 12, ...rest } = filters;
    const skip = (page - 1) * limit;

    const { courses, total } = await this.coursesService.findAll({
      ...rest,
      skip,
      take: limit,
    });

    return {
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all course categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories() {
    return this.coursesService.getCategories();
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all course tags' })
  @ApiResponse({ status: 200, description: 'List of tags' })
  async getTags() {
    return this.coursesService.getTags();
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findById(@Param('id') id: string) {
    return this.coursesService.findBySlug(id, true);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get course by slug' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  async remove(@Param('id') id: string) {
    await this.coursesService.delete(id);
    return { message: 'Course deleted successfully' };
  }

  // Module endpoints
  @Post(':courseId/modules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a module to a course' })
  async createModule(
    @Param('courseId') courseId: string,
    @Body() dto: CreateModuleDto,
  ) {
    return this.coursesService.createModule(courseId, dto);
  }

  @Patch('modules/:moduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a module' })
  async updateModule(
    @Param('moduleId') moduleId: string,
    @Body() dto: Partial<CreateModuleDto>,
  ) {
    return this.coursesService.updateModule(moduleId, dto);
  }

  @Delete('modules/:moduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a module' })
  async deleteModule(@Param('moduleId') moduleId: string) {
    await this.coursesService.deleteModule(moduleId);
    return { message: 'Module deleted successfully' };
  }

  // Lesson endpoints
  @Post('modules/:moduleId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a lesson to a module' })
  async createLesson(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.coursesService.createLesson(moduleId, dto);
  }

  @Patch('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a lesson' })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: Partial<CreateLessonDto>,
  ) {
    return this.coursesService.updateLesson(lessonId, dto);
  }

  @Delete('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a lesson' })
  async deleteLesson(@Param('lessonId') lessonId: string) {
    await this.coursesService.deleteLesson(lessonId);
    return { message: 'Lesson deleted successfully' };
  }
}
