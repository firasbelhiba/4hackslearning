import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('course/:courseId')
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  @ApiResponse({ status: 409, description: 'Already enrolled' })
  async enroll(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.enroll(userId, courseId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all enrolled courses' })
  @ApiResponse({ status: 200, description: 'List of enrollments' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.enrollmentsService.findUserEnrollments(userId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get enrollment for a specific course' })
  @ApiResponse({ status: 200, description: 'Enrollment found' })
  @ApiResponse({ status: 404, description: 'Not enrolled' })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.findEnrollment(userId, courseId);
  }

  @Get('course/:courseId/check')
  @ApiOperation({ summary: 'Check if enrolled in a course' })
  @ApiResponse({ status: 200, description: 'Enrollment status' })
  async checkEnrollment(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    const isEnrolled = await this.enrollmentsService.isEnrolled(
      userId,
      courseId,
    );
    return { isEnrolled };
  }

  @Patch(':enrollmentId/lessons/:lessonId/progress')
  @ApiOperation({ summary: 'Update lesson progress' })
  @ApiResponse({ status: 200, description: 'Progress updated' })
  async updateProgress(
    @CurrentUser('id') userId: string,
    @Param('enrollmentId') enrollmentId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.enrollmentsService.updateLessonProgress(
      userId,
      enrollmentId,
      lessonId,
      dto,
    );
  }

  @Get(':enrollmentId/lessons/:lessonId/progress')
  @ApiOperation({ summary: 'Get lesson progress' })
  @ApiResponse({ status: 200, description: 'Lesson progress' })
  async getProgress(
    @Param('enrollmentId') enrollmentId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.enrollmentsService.getLessonProgress(enrollmentId, lessonId);
  }

  @Delete('course/:courseId')
  @ApiOperation({ summary: 'Unenroll from a course' })
  @ApiResponse({ status: 200, description: 'Unenrolled successfully' })
  async unenroll(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    await this.enrollmentsService.unenroll(userId, courseId);
    return { message: 'Unenrolled successfully' };
  }
}
