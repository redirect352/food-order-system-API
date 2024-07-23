import { Module } from '@nestjs/common';
import { EmailBuilderService } from './email-builder.service';

@Module({
  providers: [EmailBuilderService],
  exports: [EmailBuilderService],
})
export class EmailBuilderModule {}
