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
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { UpdateCertificateSettingsDto } from './dto/update-certificate-settings.dto';
import { UpdateAppearanceSettingsDto } from './dto/update-appearance-settings.dto';
import { UpdatePrivacySettingsDto, Enable2FADto, Disable2FADto } from './dto/update-privacy-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(@Query() pagination: PaginationDto) {
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const { users, total } = await this.usersService.findAll({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user dashboard stats' })
  @ApiResponse({ status: 200, description: 'User dashboard stats' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.usersService.getStats(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(userId, dto);
    return this.usersService.excludePassword(user);
  }

  @Post('me/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    const success = await this.usersService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
    if (!success) {
      throw new BadRequestException('Current password is incorrect');
    }
    return { message: 'Password changed successfully' };
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload avatar image' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Validate file
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    this.uploadService.validateFile(file, allowedMimeTypes, maxSize);

    // Upload to R2
    const result = await this.uploadService.uploadFile(file, 'avatars');

    // Update user avatar
    const user = await this.usersService.update(userId, { avatar: result.url });

    return {
      avatar: result.url,
      user: this.usersService.excludePassword(user),
    };
  }

  @Get('me/notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences' })
  async getNotifications(@CurrentUser('id') userId: string) {
    return this.usersService.getNotificationPreferences(userId);
  }

  @Patch('me/notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated' })
  async updateNotifications(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateNotificationsDto,
  ) {
    return this.usersService.updateNotificationPreferences(userId, dto);
  }

  @Get('me/certificate-settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get certificate settings' })
  @ApiResponse({ status: 200, description: 'Certificate settings' })
  async getCertificateSettings(@CurrentUser('id') userId: string) {
    return this.usersService.getCertificateSettings(userId);
  }

  @Patch('me/certificate-settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update certificate settings' })
  @ApiResponse({ status: 200, description: 'Certificate settings updated' })
  async updateCertificateSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCertificateSettingsDto,
  ) {
    return this.usersService.updateCertificateSettings(userId, dto);
  }

  @Get('me/appearance-settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get appearance settings' })
  @ApiResponse({ status: 200, description: 'Appearance settings' })
  async getAppearanceSettings(@CurrentUser('id') userId: string) {
    return this.usersService.getAppearanceSettings(userId);
  }

  @Patch('me/appearance-settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update appearance settings' })
  @ApiResponse({ status: 200, description: 'Appearance settings updated' })
  async updateAppearanceSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAppearanceSettingsDto,
  ) {
    return this.usersService.updateAppearanceSettings(userId, dto);
  }

  // Privacy & Security Settings
  @Get('me/privacy-settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get privacy settings' })
  @ApiResponse({ status: 200, description: 'Privacy settings' })
  async getPrivacySettings(@CurrentUser('id') userId: string) {
    return this.usersService.getPrivacySettings(userId);
  }

  @Patch('me/privacy-settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update privacy settings' })
  @ApiResponse({ status: 200, description: 'Privacy settings updated' })
  async updatePrivacySettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePrivacySettingsDto,
  ) {
    return this.usersService.updatePrivacySettings(userId, dto);
  }

  // 2FA Endpoints
  @Post('me/2fa/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  @ApiResponse({ status: 200, description: '2FA secret and QR code generated' })
  async generate2FA(@CurrentUser('id') userId: string) {
    return this.usersService.generate2FASecret(userId);
  }

  @Post('me/2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA' })
  @ApiResponse({ status: 200, description: '2FA enabled' })
  async enable2FA(
    @CurrentUser('id') userId: string,
    @Body() dto: Enable2FADto,
  ) {
    return this.usersService.enable2FA(userId, dto.code);
  }

  @Post('me/2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: 200, description: '2FA disabled' })
  async disable2FA(
    @CurrentUser('id') userId: string,
    @Body() dto: Disable2FADto,
  ) {
    return this.usersService.disable2FA(userId, dto.code);
  }

  // Session Management
  @Get('me/sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions' })
  @ApiResponse({ status: 200, description: 'List of active sessions' })
  async getSessions(@CurrentUser('id') userId: string) {
    return this.usersService.getSessions(userId);
  }

  @Delete('me/sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked' })
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.usersService.revokeSession(userId, sessionId);
  }

  @Delete('me/sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all other sessions' })
  @ApiResponse({ status: 200, description: 'All other sessions revoked' })
  async revokeAllSessions(@CurrentUser('id') userId: string) {
    return this.usersService.revokeAllOtherSessions(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return this.usersService.excludePassword(user!);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return this.usersService.excludePassword(user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async remove(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }
}
