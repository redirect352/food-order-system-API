import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CryptoService } from 'src/lib/helpers/crypto/crypto.service';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { PrismaService } from '../database/prisma.service';
import { Prisma, PrismaClient, user, user_role } from '@prisma/client';
import { EmployeeService } from '../employee/employee.service';
import { BranchOfficeService } from '../branch-office/branch-office.service';
import { SearchUsersDto } from './dto/search-users.dto';
import { ResponseWithPagination } from 'types/response';
import { UserMainInfoDto } from './dto/user-main-info.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserTagDto } from './dto/search-user-tag.dto';
import { UserTagDto } from './dto/user-tag.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly prismaService: PrismaService,
    private readonly employeeService: EmployeeService,
    @Inject(forwardRef(() => BranchOfficeService))
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
        { branch_office: { select: { isAvailable: true } } },
      );
      return {
        user,
        active: employee.active,
        officeActive: employee.branch_office.isAvailable,
      };
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
        refreshTokenHash: null,
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

  async searchUsersIds(
    searchUsersDto: SearchUsersDto,
  ): Promise<ResponseWithPagination<number[]>> {
    const { page, pageSize, destinationOfficeId, s, orderBy, sortOrder } =
      searchUsersDto;
    const where: Prisma.userWhereInput = {
      AND: [
        { employee: { branch_office: { id: destinationOfficeId } } },
        {
          OR: [
            { email: { startsWith: s } },
            { login: { startsWith: s } },
            { employee: { surname: { startsWith: s, mode: 'insensitive' } } },
            { employee: { name: { startsWith: s, mode: 'insensitive' } } },
            {
              employee: { patronymic: { startsWith: s, mode: 'insensitive' } },
            },
            {
              employee: {
                personnelNumber: { startsWith: s, mode: 'insensitive' },
              },
            },
          ],
        },
      ],
    };
    const count = await this.prismaService.user.count({ where });
    const data = await this.prismaService.user.findMany({
      select: { id: true },
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: !!orderBy
        ? {
            [orderBy]: sortOrder ?? 'asc',
          }
        : undefined,
    });

    return {
      page,
      totalPages: Math.ceil(count / pageSize),
      data: data.map(({ id }) => id),
    };
  }
  async getUserMainInfo(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: { employee: true },
    });
    const office = await this.getUserOffice(id);
    return new UserMainInfoDto(user, office, user.employee);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { login, email, emailConfirmed, active, officeId, role } =
      updateUserDto;
    const employeeId = (
      await this.prismaService.user.findUnique({ where: { id } })
    ).employeeId;
    if (typeof active !== 'undefined' || officeId)
      await this.employeeService.updateEmployee(employeeId, {
        active,
        officeId,
      });
    return await this.prismaService.user.update({
      data: {
        email,
        login,
        isPasswordTemporary:
          emailConfirmed === undefined ? undefined : !emailConfirmed,
        role: role as user_role,
      },
      where: { id },
    });
  }

  async invalidateUsersAuthStatus(where: Prisma.userWhereInput) {
    return await this.prismaService.user.updateMany({
      data: { refreshTokenHash: null },
      where,
    });
  }
  async searchUsersTags(searchUserTagDto: SearchUserTagDto) {
    return [];
    // const { page, pageSize, s } = searchUserTagDto;
    // const items = await this.prismaService.user.findMany({
    //   select: { id: true, employee: true },
    //   where: {
    //     employee: {
    //       surname: {
    //         search: s,
    //       },
    //     },
    //   },
    //   take: pageSize,
    //   skip: (page - 1) * pageSize,
    // });
    // return items.map((item) => new UserTagDto(item.id, item.employee));
  }
}
