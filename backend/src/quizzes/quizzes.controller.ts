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
import { UserRole } from '@prisma/client';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post('module/:moduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a quiz for a module' })
  @ApiResponse({ status: 201, description: 'Quiz created' })
  async create(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateQuizDto,
  ) {
    return this.quizzesService.create(moduleId, dto);
  }

  @Get('module/:moduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get quiz by module ID (admin only)' })
  @ApiResponse({ status: 200, description: 'Quiz found' })
  async findByModule(@Param('moduleId') moduleId: string) {
    return this.quizzesService.findByModuleId(moduleId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get quiz by ID (for students, without answers)' })
  @ApiResponse({ status: 200, description: 'Quiz found' })
  async findOne(@Param('id') id: string) {
    return this.quizzesService.getQuizForStudent(id);
  }

  @Get(':id/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get quiz by ID with answers (admin only)' })
  @ApiResponse({ status: 200, description: 'Quiz found' })
  async findOneAdmin(@Param('id') id: string) {
    return this.quizzesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz updated' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateQuizDto>) {
    return this.quizzesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz deleted' })
  async remove(@Param('id') id: string) {
    await this.quizzesService.delete(id);
    return { message: 'Quiz deleted successfully' };
  }

  // Question endpoints
  @Post(':quizId/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a question to a quiz' })
  async createQuestion(
    @Param('quizId') quizId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizzesService.createQuestion(quizId, dto);
  }

  @Patch('questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a question' })
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() dto: Partial<CreateQuestionDto>,
  ) {
    return this.quizzesService.updateQuestion(questionId, dto);
  }

  @Delete('questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a question' })
  async deleteQuestion(@Param('questionId') questionId: string) {
    await this.quizzesService.deleteQuestion(questionId);
    return { message: 'Question deleted successfully' };
  }

  // Submission endpoints
  @Post(':quizId/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit quiz answers' })
  @ApiResponse({ status: 201, description: 'Quiz submitted and graded' })
  async submitQuiz(
    @CurrentUser('id') userId: string,
    @Param('quizId') quizId: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizzesService.submitQuiz(userId, quizId, dto);
  }

  @Get(':quizId/attempts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user attempts for a quiz' })
  async getAttempts(
    @CurrentUser('id') userId: string,
    @Param('quizId') quizId: string,
  ) {
    return this.quizzesService.getUserAttempts(userId, quizId);
  }

  @Get(':quizId/best-attempt')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get best attempt for a quiz' })
  async getBestAttempt(
    @CurrentUser('id') userId: string,
    @Param('quizId') quizId: string,
  ) {
    return this.quizzesService.getBestAttempt(userId, quizId);
  }
}
