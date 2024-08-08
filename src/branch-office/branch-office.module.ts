import { Module } from '@nestjs/common';
import { BranchOfficeService } from './branch-office.service';
import { BranchOfficeController } from './branch-office.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchOffice } from './branch-office.entity';
import { IsBranchOfficeExistsConstraint } from './validators/branch-office-exists.validator';

@Module({
  imports: [TypeOrmModule.forFeature([BranchOffice])],
  controllers: [BranchOfficeController],
  providers: [BranchOfficeService, IsBranchOfficeExistsConstraint],
})
export class BranchOfficeModule {}
