import * as dayjs from 'dayjs';
import {
  IOrdersExportInFileOptions,
  orderDeclaration,
  OrdersExportFileGenerator,
} from '../orders-export-file-generator.interface';
import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  Packer,
  ITableCellOptions,
} from 'docx';
export class DocxOrderGenerator extends OrdersExportFileGenerator {
  async parseFile(
    ordersDeclaration: orderDeclaration[],
    options: IOrdersExportInFileOptions = {},
  ): Promise<Buffer> {
    const { documentHeading } = options;
    const tableContentRows = ordersDeclaration
      .map((declaration) => this.getOrderRow(declaration))
      .flat(2);
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text:
                documentHeading ??
                `Заявка на обеды ${dayjs(new Date()).format('DD.MM.YYYY')}`,
              heading: 'Title',
            }),
            new Table({
              width: { size: 100, type: 'pct' },
              rows: [this.getTableHeader(), ...tableContentRows],
            }),
          ],
        },
      ],
    });
    return await Packer.toBuffer(doc);
  }

  getResultFileExtension(): string {
    return '.docx';
  }

  getOrderRow(orderDeclaration: orderDeclaration) {
    const { number, issued, orderPositions, client } = orderDeclaration;
    const { surname, name, patronymic, personnelNumber, officeName } = client;
    const clientFullName = `${surname} ${name.charAt(0).toUpperCase()}.${patronymic.charAt(0).toUpperCase()}. (${personnelNumber}, ${officeName})`;
    const issuedString = dayjs(issued).format('DD.MM.YY');
    const numberLabel = `${number}-${issuedString}`;
    return orderPositions.map(
      ({ menuPosition, count }, index) =>
        new TableRow({
          children: [
            index === 0
              ? new TableCell({
                  children: [new Paragraph(numberLabel)],
                  verticalMerge: 'restart',
                })
              : new TableCell({
                  children: [],
                  verticalMerge: 'continue',
                }),
            index === 0
              ? new TableCell({
                  children: [new Paragraph(clientFullName)],
                  verticalMerge: 'restart',
                })
              : new TableCell({
                  children: [],
                  verticalMerge: 'continue',
                }),
            new TableCell({
              children: [new Paragraph(menuPosition.dishDescription.name)],
            }),
            this.createCenteredCell(count.toString()),
            new TableCell({
              children: [new Paragraph('')],
            }),
          ],
        }),
    );
  }
  private getTableHeader() {
    return new TableRow({
      children: [
        this.createCenteredCell('', {
          width: { size: 10, type: 'pct' },
        }),
        this.createCenteredCell('ФИО', {
          width: { size: 20, type: 'pct' },
        }),
        this.createCenteredCell('Блюдо', {
          width: { size: 45, type: 'pct' },
        }),
        this.createCenteredCell('Кол-во', {
          width: { size: 10, type: 'pct' },
        }),
        this.createCenteredCell('Примечание', {
          width: { size: 15, type: 'pct' },
        }),
      ],
      tableHeader: true,
      height: { value: 500, rule: 'atLeast' },
    });
  }

  private createCenteredCell(
    text: string,
    options: Omit<ITableCellOptions, 'children'> = {},
  ) {
    return new TableCell({
      ...options,
      verticalAlign: 'center',
      children: [
        new Paragraph({
          children: [new TextRun(text)],
          alignment: 'center',
        }),
      ],
    });
  }
}
