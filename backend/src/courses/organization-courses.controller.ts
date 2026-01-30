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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('organization-courses')
@Controller('organizations/:organizationId/courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a course for an organization' })
  @ApiResponse({ status: 201, description: 'Course created' })
  async create(
    @Param('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCourseDto,
  ) {
    return this.coursesService.createForOrganization(organizationId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses for an organization' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  async findAll(
    @Param('organizationId') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('isPublished') isPublished?: string,
  ) {
    const skip = (page - 1) * limit;
    const publishedFilter =
      isPublished === 'true' ? true : isPublished === 'false' ? false : undefined;

    const { courses, total } = await this.coursesService.findByOrganization(
      organizationId,
      {
        skip,
        take: limit,
        isPublished: publishedFilter,
      },
    );

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

  @Get(':courseId')
  @ApiOperation({ summary: 'Get a specific course' })
  @ApiResponse({ status: 200, description: 'Course found' })
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
  ) {
    // Verify user has access to this organization
    await this.coursesService.verifyOrganizationAccess(courseId, userId);
    return this.coursesService.findById(courseId);
  }

  @Patch(':courseId')
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated' })
  async update(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.updateForOrganization(courseId, userId, dto);
  }

  @Delete(':courseId')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  async remove(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.coursesService.deleteForOrganization(courseId, userId);
    return { message: 'Course deleted successfully' };
  }

  // Module endpoints for organization courses
  @Post(':courseId/modules')
  @ApiOperation({ summary: 'Add a module to a course' })
  async createModule(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateModuleDto,
  ) {
    await this.coursesService.verifyOrganizationAccess(courseId, userId);
    return this.coursesService.createModule(courseId, dto);
  }

  @Patch(':courseId/modules/:moduleId')
  @ApiOperation({ summary: 'Update a module' })
  async updateModule(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: Partial<CreateModuleDto>,
  ) {
    await this.coursesService.verifyOrganizationAccess(courseId, userId);
    return this.coursesService.updateModule(moduleId, dto);
  }

  @Delete(':courseId/modules/:moduleId')
  @ApiOperation({ summary: 'Delete a module' })
  async deleteModule(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.coursesService.verifyOrganizationAccess(courseId, userId);
    await this.coursesService.deleteModule(moduleId);
    return { message: 'Module deleted successfully' };
  }

  // Lesson endpoints for organization courses
  @Post(':courseId/modules/:moduleId/lessons')
  @ApiOperation({ summary: 'Add a lesson to a module' })
  async createLesson(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLessonDto,
  ) {
    await this.coursesService.verifyOrganizationAccess(courseId, userId);
    return this.coursesService.createLesson(moduleId, dto);
  }

  @Patch(':courseId/lessons/:lessonId')
  @ApiOperation({ summary: 'Update a lesson' })
  async updateLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: Partial<CreateLessonDto>,
  ) {
    await this.coursesService.verifyOrganizationAccess(courseId, userId);
    return this.coursesService.updateLesson(lessonId, dto);
  }

  @Delete(':courseId/lessons/:lessonId')
  @ApiOperation({ summary: 'Delete a lesson' })
  async deleteLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.coursesService.verifyOrganizationAccess(courseId, userId);
    await this.coursesService.deleteLesson(lessonId);
    return { message: 'Lesson deleted successfully' };
  }
}
