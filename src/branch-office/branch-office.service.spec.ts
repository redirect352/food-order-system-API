import { Test } from '@nestjs/testing';
import { BranchOfficeService } from './branch-office.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BranchOffice } from './branch-office.entity';

describe('BranchOffice Test suite', () => {
  let Service: BranchOfficeService;
  const mockUserRepository = {};
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BranchOfficeService,
        {
          provide: getRepositoryToken(BranchOffice),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    Service = module.get<BranchOfficeService>(BranchOfficeService);
  });

  it('should be defined', () => {
    expect(Service).toBeDefined();
  });
});
