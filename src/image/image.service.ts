import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getDishImages } from '@prisma/client/sql';
import { ConfigService } from '@nestjs/config';
import { dish } from '@prisma/client';
import { UploadImageDto } from './dto/upload-image.dto';
import { extname } from 'path';

@Injectable()
export class ImageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async saveImages(
    files: Array<Express.Multer.File>,
    uploadImageDto: UploadImageDto,
    authorId?: number,
  ) {
    const { name, tags } = uploadImageDto;
    const images = await Promise.all(
      files.map(({ filename }) =>
        this.prismaService.image.create({
          data: {
            name: name ?? filename.slice(0, filename.lastIndexOf('.')),
            path: filename,
            tags: tags
              ? {
                  connectOrCreate: tags.map((tagName) => ({
                    where: { tagName },
                    create: { tagName },
                  })),
                }
              : undefined,
            authorId,
          },
          omit: { authorId: true },
        }),
      ),
    );
    return images;
  }

  getImageSaveName(req, file: Express.Multer.File, callback) {
    const { originalname } = file;
    const ext = extname(originalname);
    const name = originalname.replace(ext, '');
    callback(null, `${name}-${new Date().getTime()}${ext}`);
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
