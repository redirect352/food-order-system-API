import { Module } from '@nestjs/common';
import { BranchOfficeService } from './branch-office.service';
import { BranchOfficeController } from './branch-office.controller';
import { IsBranchOfficeExistsConstraint } from './validators/branch-office-exists.validator';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BranchOfficeController],
  providers: [BranchOfficeService, IsBranchOfficeExistsConstraint],
  exports: [BranchOfficeService],
})
export class BranchOfficeModule {}
