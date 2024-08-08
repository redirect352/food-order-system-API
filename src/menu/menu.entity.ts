import { BranchOffice } from 'src/branch-office/branch-office.entity';
import { MenuPosition } from 'src/menu-position/menu-position.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  relevantFrom: Date;

  @Column()
  expire: Date;

  @ManyToMany(() => MenuPosition)
  @JoinTable()
  menuPositions: MenuPosition[];

  @ManyToOne(() => BranchOffice, (office) => office, { nullable: false })
  providingCanteen: BranchOffice;
}
