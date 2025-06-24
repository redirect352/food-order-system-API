import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CryptoModule } from '../lib/helpers/crypto/crypto.module';
import { DatabaseModule } from '../database/database.module';
import { EmployeeModule } from '../employee/employee.module';
import { BranchOfficeModule } from '../branch-office/branch-office.module';

@Module({
  imports: [
    CryptoModule,
    DatabaseModule,
    EmployeeModule,
    forwardRef(() => BranchOfficeModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
