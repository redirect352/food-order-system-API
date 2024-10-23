import { Test } from '@nestjs/testing';
import { BranchOfficeController } from './branch-office.controller';
import { BranchOfficeService } from './branch-office.service';
import { CreateBranchOfficeDto } from './dto/create-branch-office.dto';
import { InsertResult } from 'typeorm';

describe('BranchOfficeController', () => {
  let branchOfficeController: BranchOfficeController;
  const mockBranchOfficeService = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createBranchOffice: jest.fn(async (_dto: CreateBranchOfficeDto) => ({
      ...new InsertResult(),
      identifiers: [Date.now()],
    })),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [BranchOfficeController],
      providers: [BranchOfficeService],
    })
      .overrideProvider(BranchOfficeService)
      .useValue(mockBranchOfficeService)
      .compile();

    branchOfficeController = module.get<BranchOfficeController>(
      BranchOfficeController,
    );
  });

  it('should be defined', () => {
    expect(branchOfficeController).toBeDefined();
  });

  describe('create office', () => {
    it('it should create office', async () => {
      const createBranchOfficeDto = {
        name: 'офис',
        isCanteen: false,
        servingCanteenId: 1,
        address: 'address',
      };
      expect(
        await branchOfficeController.createOffice(createBranchOfficeDto),
      ).toEqual(expect.any(Number));
      expect(mockBranchOfficeService.createBranchOffice).toHaveBeenCalledWith(
        createBranchOfficeDto,
      );
    });
  });
});
