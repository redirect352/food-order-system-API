import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { UserService } from 'src/user/user.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ImageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async saveImageToStatic(file: Express.Multer.File, name?: string) {
    const originalName = file.originalname;
    const fileName =
      originalName.slice(0, originalName.lastIndexOf('.')) +
      `{${new Date().getTime()}}` +
      '.' +
      originalName.slice(
        originalName.lastIndexOf('.') + 1,
        originalName.length,
      );
    await fs.writeFile(
      join(__dirname, '..', '..', '..', 'static', 'images', fileName),
      file.buffer,
    );
    await this.prismaService.image.create({
      data: {
        name: name ?? file.originalname.slice(0, originalName.lastIndexOf('.')),
        path: fileName,
        authorId: (await this.userService.findByLogin('admin'))?.id,
      },
    });
    return { fileName };
  }

  async getList(page: number, pageSize: number) {
    return await this.prismaService.image.findMany({
      orderBy: { uploaded: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }
  async getImageById(id: number) {
    return await this.prismaService.image.findUnique({ where: { id } });
  }
}
