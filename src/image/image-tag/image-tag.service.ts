import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SearchImageTagDto } from './dto/search-image-tags.dto';
import { CreateImageTagDto } from './dto/create-image-tag.dto';
import { ImageTagDto } from './dto/image-tag.dto';
import { image_tag } from '@prisma/client';

@Injectable()
export class ImageTagService {
  constructor(private readonly prismaService: PrismaService) {}

  async searchImageTags(searchImageTags: SearchImageTagDto) {
    const { page, pageSize, searchString } = searchImageTags;
    const tags = await this.prismaService.image_tag.findMany({
      include: { branch_office: true },
      where: {
        tagName: { contains: searchString, mode: 'insensitive' },
        officeId: searchImageTags.canteenId,
      },
      distinct: 'tagName',
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return tags.map(
      (tag) => new ImageTagDto(tag as image_tag, tag.branch_office),
    );
  }

  async createTags(tags: CreateImageTagDto[]) {
    return await this.prismaService.image_tag.createMany({
      data: tags.map(({ tagName, officeId }) => ({ tagName, officeId })),
      skipDuplicates: true,
    });
  }
}
