import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { UserService } from 'src/user/user.service';
import { PrismaService } from '../database/prisma.service';
import { getDishImages } from '@prisma/client/sql';
import { ConfigService } from '@nestjs/config';
import { dish } from '@prisma/client';
import { UploadImageDto } from './dto/upload-image.dto';

@Injectable()
export class ImageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async saveImageToStatic(
    file: Express.Multer.File,
    uploadImageDto: UploadImageDto,
  ) {
    const { name, tags } = uploadImageDto;
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
    const image = await this.prismaService.image.create({
      data: {
        name: name ?? file.originalname.slice(0, originalName.lastIndexOf('.')),
        path: fileName,
        authorId: (await this.userService.findByLogin('admin'))?.id,
        tags: {
          connectOrCreate: tags.map((tagName) => ({
            where: { tagName },
            create: { tagName },
          })),
        },
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

  async attachImagesToDishes<T>(
    dishIds: number[],
    items: T[],
    getDish: (item: T) => Partial<dish>,
    attachPath: string = 'images',
  ) {
    const images = await this.getDishesImages(dishIds);
    for (const item of items) {
      const dish = getDish(item);
      if (!dish?.id && dishIds.includes(dish.id)) continue;
      dish[attachPath] = images.filter((img) => img.dishId === dish.id);
    }
    return items;
  }

  async getDishesImages(
    dishIds: number[],
    maxImagesToOneDish: number = this.configService.get<number>(
      'MAX_DISH_IMAGES_COUNT',
    ) ?? 2,
  ) {
    const imgs = await this.prismaService.$queryRawTyped(
      getDishImages(dishIds, +maxImagesToOneDish),
    );
    return imgs;
  }
}
