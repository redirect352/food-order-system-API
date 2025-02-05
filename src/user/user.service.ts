import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CryptoService } from 'src/lib/helpers/crypto/crypto.service';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { PrismaService } from '../database/prisma.service';
import { Prisma, PrismaClient, user } from '@prisma/client';
import { EmployeeService } from '../employee/employee.service';
import { BranchOfficeService } from '../branch-office/branch-office.service';

@Injectable()
export class UserService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly prismaService: PrismaService,
    private readonly employeeService: EmployeeService,
    private readonly branchOfficeService: BranchOfficeService,
  ) {}
  private readonly logger = new Logger(UserService.name);

  async getUserFullInfo(
    where: Prisma.userWhereUniqueInput,
    prismaClient: PrismaClient = this.prismaService,
  ) {
    const user = await prismaClient.user.findUnique({
      where,
      select: { id: true, email: true, employeeId: true },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
    const employee = await this.employeeService.findEmployeeById(
      user.employeeId,
    );
    const office = await this.branchOfficeService.getBranchOfficeById(
      employee.officeId,
    );
    return {
      user,
      employee,
      office,
    };
  }
  async getUserAuthData(where: { login?: string; email?: string }) {
    const user = await this.prismaService.user.findFirst({ where });
    if (user) {
      const employee = await this.employeeService.findEmployeeById(
        user.employeeId,
      );
      return { user, active: employee.active };
    }
    return null;
  }
  async findByLogin(login: string) {
    return await this.prismaService.user.findUnique({ where: { login } });
  }
  async findById(id: number) {
    return await this.prismaService.user.findUnique({ where: { id } });
  }
  async findUserServingCanteen(
    id: number,
    prismaClient: PrismaClient = this.prismaService,
  ): Promise<number> {
    const userData = await this.getUserFullInfo({ id }, prismaClient);
    if (!userData) throw new NotFoundException();
    return userData.office.servingCanteenId;
  }
  async getUserOffice(
    id: number,
    prismaClient: PrismaClient = this.prismaService,
  ) {
    const userData = await this.getUserFullInfo({ id }, prismaClient);
    if (!userData) throw new NotFoundException();
    return userData.office;
  }

  async updateUserById(
    id: number,
    updatedUser: Prisma.XOR<
      Prisma.userUpdateInput,
      Prisma.userUncheckedUpdateInput
    >,
  ) {
    return await this.prismaService.user.update({
      where: { id },
      data: updatedUser,
    });
  }
  async updateUserByEmail(
    email,
    updatedUser: Prisma.XOR<
      Prisma.userUpdateInput,
      Prisma.userUncheckedUpdateInput
    >,
  ) {
    return await this.prismaService.user.update({
      where: { email },
      data: updatedUser,
    });
  }
  async updateUserPassword(id: number, newPassword: string) {
    return await this.prismaService.user.update({
      where: { id },
      data: {
        password: await this.cryptoService.hashPassword(newPassword),
      },
    });
  }

  async register(signUpDto: SignUpDto) {
    const { surname, email, login, password, personnelNumber, officeId } =
      signUpDto;
    const employee = await this.employeeService.findEmployee({
      surname,
      personnelNumber,
      officeId,
    });
    if (!employee) {
      throw new ForbiddenException(
        'Невозможно создать аккаунт. Указанный сотрудник не существует',
      );
    }
    if (!employee.active) {
      throw new ForbiddenException(
        'Невозможно создать аккаунт. Сотрудник с указанными данными уволен',
      );
    }
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ employeeId: employee.id }, { login }, { email }],
      },
    });
    if (user) {
      throw new ForbiddenException(
        'Невозможно создать аккаунт. Сотрудник с указанным login или email уже зарегистрирован',
      );
    }
    const result = await this.prismaService.$transaction(
      [
        this.prismaService.user.create({
          data: {
            email,
            login,
            password,
            isPasswordTemporary: true,
            role: 'client',
            employeeId: employee.id,
          },
        }),
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
    return result[0] as user;
  }
}
