import { dish, menu_position } from '@prisma/client';

export type dishDeclaration = {
  categoryName?: string;
} & Omit<dish, 'id' | 'categoryId' | 'providingCanteenId' | 'imageId'>;

export type menuPositionDeclaration = {
  dishDescription: dishDeclaration;
} & Omit<menu_position, 'id' | 'dishId'>;

export type menuDeclaration = {
  name?: string;
  relevantFrom: Date;
  expire: Date;
  providingCanteenName?: string;
  served_offices?: string[];
  menuPositions: menuPositionDeclaration[];
};

export abstract class MenuFileParser {
  abstract getParsedExtensions(): string;
  abstract parseFile(filePath: string): Promise<menuDeclaration>;
  abstract parseFile(buffer: Buffer): Promise<menuDeclaration>;
}
