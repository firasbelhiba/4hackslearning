import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { Prisma } from '@prisma/client';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async create(moduleId: string, dto: CreateQuizDto) {
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { moduleId },
    });

    if (existingQuiz) {
      throw new BadRequestException('Module already has a quiz');
    }

    return this.prisma.quiz.create({
      data: {
        ...dto,
        moduleId,
      },
      include: { questions: true },
    });
  }

  async findById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        module: {
          include: { course: true },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async findByModuleId(moduleId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { moduleId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async update(id: string, dto: Partial<CreateQuizDto>) {
    await this.findById(id);

    return this.prisma.quiz.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.quiz.delete({ where: { id } });
  }

  // Question operations
  async createQuestion(quizId: string, dto: CreateQuestionDto) {
    await this.findById(quizId);

    return this.prisma.question.create({
      data: {
        text: dto.text,
        type: dto.type,
        options: dto.options as unknown as Prisma.InputJsonValue,
        explanation: dto.explanation,
        points: dto.points,
        order: dto.order,
        quizId,
      },
    });
  }

  async updateQuestion(questionId: string, dto: Partial<CreateQuestionDto>) {
    const updateData: Prisma.QuestionUpdateInput = {};
    if (dto.text) updateData.text = dto.text;
    if (dto.type) updateData.type = dto.type;
    if (dto.options) updateData.options = dto.options as unknown as Prisma.InputJsonValue;
    if (dto.explanation !== undefined) updateData.explanation = dto.explanation;
    if (dto.points) updateData.points = dto.points;
    if (dto.order) updateData.order = dto.order;

    return this.prisma.question.update({
      where: { id: questionId },
      data: updateData,
    });
  }

  async deleteQuestion(questionId: string) {
    await this.prisma.question.delete({ where: { id: questionId } });
  }

  // Quiz submission
  async submitQuiz(userId: string, quizId: string, dto: SubmitQuizDto) {
    const quiz = await this.findById(quizId);

    // Calculate score
    let score = 0;
    let maxScore = 0;
    const answers = dto.answers.map((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (!question) {
        throw new BadRequestException(`Question ${answer.questionId} not found`);
      }

      maxScore += question.points;

      const options = question.options as unknown as QuestionOption[];
      const correctOptions = options.filter((o) => o.isCorrect).map((o) => o.id);

      let isCorrect = false;

      if (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE') {
        isCorrect = correctOptions.includes(answer.answer as string);
      } else if (question.type === 'MULTIPLE_CHOICE') {
        const userAnswers = answer.answer as string[];
        isCorrect =
          userAnswers.length === correctOptions.length &&
          userAnswers.every((a) => correctOptions.includes(a));
      }

      if (isCorrect) {
        score += question.points;
      }

      return {
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        points: isCorrect ? question.points : 0,
      };
    });

    const percentage = (score / maxScore) * 100;
    const passed = percentage >= quiz.passingScore;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        maxScore,
        percentage,
        passed,
        answers,
        completedAt: new Date(),
      },
    });

    return {
      ...attempt,
      quiz: {
        title: quiz.title,
        passingScore: quiz.passingScore,
      },
    };
  }

  async getUserAttempts(userId: string, quizId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getBestAttempt(userId: string, quizId: string) {
    return this.prisma.quizAttempt.findFirst({
      where: { userId, quizId },
      orderBy: { percentage: 'desc' },
    });
  }

  // Get quiz for student (without correct answers)
  async getQuizForStudent(quizId: string) {
    const quiz = await this.findById(quizId);

    return {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: (q.options as unknown as QuestionOption[]).map(({ id, text }) => ({
          id,
          text,
        })),
      })),
    };
  }
}
