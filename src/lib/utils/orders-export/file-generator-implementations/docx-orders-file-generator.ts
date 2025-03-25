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
  IParagraphOptions,
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
    const clientFullName = `${surname} ${name.charAt(0).toUpperCase()}.${patronymic.charAt(0).toUpperCase()}. (${personnelNumber})`;
    // const issuedString = dayjs(issued).format('DD.MM.YY');
    // const numberLabel = `${number}-${issuedString}`;
    const numberLabel = `${number}`;
    return orderPositions.map(
      ({ menuPosition, count, comment }, index) =>
        new TableRow({
          children: [
            index === 0
              ? this.createCenteredCell(
                  numberLabel,
                  {
                    verticalMerge: 'restart',
                  },
                  '20pt',
                )
              : new TableCell({
                  children: [],
                  verticalMerge: 'continue',
                }),
            index === 0
              ? new TableCell({
                  children: [
                    this.createTextParagraph(clientFullName, {}, '14pt'),
                  ],
                  verticalMerge: 'restart',
                })
              : new TableCell({
                  children: [],
                  verticalMerge: 'continue',
                }),
            new TableCell({
              children: [
                this.createTextParagraph(
                  menuPosition.dishDescription.name,
                  {},
                  '12pt',
                ),
              ],
            }),
            this.createCenteredCell(count.toString()),
            new TableCell({
              children: [this.createTextParagraph(comment ?? '', {}, '12pt')],
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
    size?: TextSize,
  ) {
    return new TableCell({
      ...options,
      verticalAlign: 'center',
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              size: size ?? '16pt',
            }),
          ],
          alignment: 'center',
        }),
      ],
    });
  }
  private createTextParagraph(
    text: string,
    options: Omit<IParagraphOptions, 'children'> = {},
    size?: TextSize,
  ) {
    return new Paragraph({
      ...options,
      children: [
        new TextRun({
          text,
          size: size ?? '16pt',
        }),
      ],
    });
  }
}
type TextSize =
  | number
  | `${number}mm`
  | `${number}cm`
  | `${number}in`
  | `${number}pt`
  | `${number}pc`
  | `${number}pi`;
