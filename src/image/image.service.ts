import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getDishImages } from '@prisma/client/sql';
import { ConfigService } from '@nestjs/config';
import { dish, Prisma } from '@prisma/client';
import { UploadImageDto } from './dto/upload-image.dto';
import { ImageTagService } from './image-tag/image-tag.service';
import { ImageFullInfoDto } from './dto/image-full-info.dto';
import { ResponseWithPagination } from '../../types/response';
import { GetImageListDto } from './dto/get-image-list.dto';
import { EditImageTagsDto } from './dto/edit-image-tags.dto';
import { DeleteImagesDto } from './dto/delete-images.dto';
import { extname, resolve } from 'path';
import { rm } from 'node:fs/promises';

@Injectable()
export class ImageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly imageTagService: ImageTagService,
  ) {}

  async saveImages(
    files: Array<Express.Multer.File>,
    uploadImageDto: UploadImageDto,
    authorId?: number,
  ) {
    const { name, tags } = uploadImageDto;
    await this.imageTagService.createTags(tags);
    const images = await Promise.all(
      files.map(({ filename }) =>
        this.prismaService.image.create({
          data: {
            name: name ?? filename.slice(0, filename.lastIndexOf('.')),
            path: filename,
            tags: tags
              ? {
                  connectOrCreate: tags.map(({ tagName, officeId }) => ({
                    where: { tagName_officeId: { tagName, officeId } },
                    create: { tagName, officeId },
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

  async getList(
    getListDto: GetImageListDto,
  ): Promise<ResponseWithPagination<ImageFullInfoDto[]>> {
    const {
      page,
      pageSize,
      s,
      canteenId,
      sortOrder = 'desc',
      orderBy = 'id',
    } = getListDto;
    const where: Prisma.imageWhereInput = {
      tags:
        s || canteenId
          ? {
              some: {
                AND: { tagName: { startsWith: s ?? '' }, officeId: canteenId },
              },
            }
          : undefined,
    };
    const images = await this.prismaService.image.findMany({
      orderBy: { [orderBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        tags: { include: { branch_office: true } },
        user: { include: { employee: { include: { branch_office: true } } } },
      },
      where,
    });
    const count = await this.prismaService.image.count({ where });
    return {
      page,
      totalPages: Math.ceil(count / pageSize),
      data: images.map(
        (img) =>
          new ImageFullInfoDto(
            img,
            img.user,
            img.user.employee.branch_office,
            img.user.employee,
            img.tags,
          ),
      ),
    };
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
  async editImageTags(id: string, editImageTagsDto: EditImageTagsDto) {
    const createTags = editImageTagsDto.tags.filter(
      (tag) => tag.action !== 'delete',
    );
    const old = editImageTagsDto.tags.filter((tag) => tag.type === 'old');
    return await this.prismaService.$transaction(async (tx) => {
      await tx.image.update({
        where: {
          id: +id,
        },
        data: {
          tags: {
            disconnect: old.map((tag) => ({ id: +tag.id })),
          },
        },
      });
      if (createTags.length > 0) {
        await tx.image.update({
          where: { id: +id },
          data: {
            tags: {
              connectOrCreate: createTags.map(
                ({ tagName, canteenId: officeId }) => ({
                  where: {
                    tagName_officeId: { tagName, officeId },
                  },
                  create: { tagName, officeId },
                }),
              ),
            },
          },
        });
      }
    });
  }

  async deleteImages(deleteDto: DeleteImagesDto) {
    const images = await this.prismaService.image.findMany({
      where: { id: { in: deleteDto.ids } },
    });
    const res = await this.prismaService.image.deleteMany({
      where: { id: { in: deleteDto.ids } },
    });
    const rmPromises = [];
    images.forEach((image) => {
      const path = resolve(
        this.configService.get('DISH_IMAGES_SAVE_PATH'),
        image.path,
      );
      rmPromises.push(rm(path));
    });
    await Promise.all(rmPromises);
    return res;
  }

  async deleteImagesTags(deleteDto: DeleteImagesDto) {
    const promises = deleteDto.ids.map((id) =>
      this.prismaService.image.update({
        where: { id },
        data: {
          tags: {
            set: [],
          },
        },
      }),
    );
    const result = await Promise.all(promises);
    return result;
  }
}
