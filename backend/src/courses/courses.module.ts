import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { OrganizationCoursesController } from './organization-courses.controller';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [OrganizationsModule],
  controllers: [CoursesController, OrganizationCoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
