import { Controller } from '@nestjs/common';
import { BranchOfficeService } from './branch-office.service';

@Controller('branch-office')
export class BranchOfficeController {
  constructor(private readonly branchOfficeService: BranchOfficeService) {}
}
