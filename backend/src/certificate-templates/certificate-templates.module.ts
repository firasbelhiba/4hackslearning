import { Module } from '@nestjs/common';
import { CertificateTemplatesService } from './certificate-templates.service';
import { CertificateTemplatesController } from './certificate-templates.controller';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [OrganizationsModule],
  controllers: [CertificateTemplatesController],
  providers: [CertificateTemplatesService],
  exports: [CertificateTemplatesService],
})
export class CertificateTemplatesModule {}
