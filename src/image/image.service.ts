import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Image } from './image.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>,
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
    const image = new Image();
    image.name =
      name ?? file.originalname.slice(0, originalName.lastIndexOf('.'));
    image.path = fileName;
    image.uploadedBy = await this.userService.findByLogin('admin');
    await this.imagesRepository.save(image);
    return { fileName };
  }

  async getList(page: number, pageSize: number) {
    return await this.imagesRepository.find({
      order: { uploaded: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }
  async getImageById(id: number) {
    return await this.imagesRepository.findOne({ where: { id } });
  }
}
