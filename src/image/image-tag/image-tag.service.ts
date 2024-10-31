import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ImageTagService {
  constructor(private readonly prismaService: PrismaService) {}
  async getImageTags() {
    return this.prismaService.image_tag.findMany({});
  }
}
