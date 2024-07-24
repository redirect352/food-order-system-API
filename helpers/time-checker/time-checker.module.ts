import { Module } from '@nestjs/common';
import { TimeCheckerService } from './time-checker.service';

@Module({
  providers: [TimeCheckerService],
  exports: [TimeCheckerService],
})
export class TimeCheckerModule {}
