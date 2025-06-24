import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SearchImageTagDto } from './dto/search-image-tags.dto';
import { CreateImageTagDto } from './dto/create-image-tag.dto';

@Injectable()
export class ImageTagService {
  constructor(private readonly prismaService: PrismaService) {}

  async searchImageTags(searchImageTags: SearchImageTagDto) {
    const { page, pageSize, searchString } = searchImageTags;
    return this.prismaService.image_tag.findMany({
      omit: { created: true },
      where: {
        tagName: { contains: searchString, mode: 'insensitive' },
        officeId: searchImageTags.canteenId,
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
  }

  async createTags(tags: CreateImageTagDto[]) {
    return await this.prismaService.image_tag.createMany({
      data: tags.map(({ tagName, officeId }) => ({ tagName, officeId })),
      skipDuplicates: true,
    });
  }
}
