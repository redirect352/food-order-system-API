import {
  menuDeclaration,
  menuPositionDeclaration,
  MenuFileParser,
} from '../menu-parser.interface';
import { BadRequestException, NotAcceptableException } from '@nestjs/common';
import * as WordExtractor from 'word-extractor';
import * as dayjs from 'dayjs';
import * as CustomParseFormat from 'dayjs/plugin/customParseFormat';
import * as timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/ru';
import * as utc from 'dayjs/plugin/utc';

export class DocxMenuParser extends MenuFileParser {
  constructor() {
    super();
    dayjs.extend(CustomParseFormat);
    dayjs.extend(utc);
    dayjs.extend(timezone);
  }

  parseFile(filePath: string);
  parseFile(buffer: Buffer);
  async parseFile(buffer: unknown): Promise<menuDeclaration> {
    const extractor = new WordExtractor();
    if (buffer instanceof Buffer || typeof buffer === 'string') {
      const extracted = await extractor.extract(buffer);
      if (!extracted) throw new BadRequestException();
      try {
        return this.parseDocument(extracted);
      } catch (err) {
        throw new NotAcceptableException(
          err.message ?? 'Некорректный формат файла меню',
        );
      }
    }
    throw new NotAcceptableException('Некорректный формат файла меню');
  }
  parseDocument(document: WordExtractor.Document) {
    const documentLines = document
      .getBody()
      .split(/\n|\t/)
      .filter((item) => !!item);
    const dateStr = documentLines[2].slice(
      documentLines[2].indexOf('на') + 2,
      documentLines[2].lastIndexOf('г.'),
    );
    const menuDate = dayjs(dateStr, 'D MMMM YYYY', 'ru').tz('Europe/Minsk');

    const startIndex = documentLines.findIndex((item) => item.includes('Цена'));
    if (startIndex === -1)
      throw new BadRequestException('Некорректный формат файла. ');
    const result: menuPositionDeclaration[] = [];
    let currentCategory: string = undefined;

    for (let i = startIndex + 1; i < documentLines.length; i++) {
      if (documentLines[i + 1].charCodeAt(0) === 160) {
        currentCategory = documentLines[i];
        if (documentLines[i].charCodeAt(0) === 160) break;
        i++;
      } else {
        const name = documentLines[i];
        const description = documentLines[i + 3].replaceAll('/', '');
        const quantity = documentLines[i + 1];
        const price = +[...documentLines[i + 2].matchAll(/\d+/g)].reduce(
          (prev, item) => prev + item[0],
          '',
        );
        if (isNaN(price))
          throw new BadRequestException(`Ошибка обработки цены блюда ${name}`);
        result.push({
          price,
          discount: 0,
          dishDescription: {
            name,
            description,
            quantity,
            calorieContent: null,
            bestBeforeDate: null,
            carbohydrates: null,
            externalProducer: null,
            proteins: null,
            fats: null,
            categoryName: currentCategory,
          },
        });
        i += 3;
      }
    }
    return {
      name: null,
      relevantFrom: menuDate.set('h', 8).toDate(),
      expire: menuDate.set('h', 10).toDate(),
      providingCanteenName: '',
      menuPositions: result,
    };
  }
  getParsedExtensions(): string {
    return '.docx';
  }
}
