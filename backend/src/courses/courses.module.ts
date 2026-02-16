import { Module, forwardRef } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { OrganizationCoursesController } from './organization-courses.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [OrganizationsModule, forwardRef(() => EnrollmentsModule)],
  controllers: [CoursesController, OrganizationCoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
