import { forwardRef, Module } from '@nestjs/common';
import { BranchOfficeService } from './branch-office.service';
import { BranchOfficeController } from './branch-office.controller';
import { IsBranchOfficeExistsConstraint } from './validators/branch-office-exists.validator';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => UserModule)],
  controllers: [BranchOfficeController],
  providers: [BranchOfficeService, IsBranchOfficeExistsConstraint],
  exports: [BranchOfficeService],
})
export class BranchOfficeModule {}
