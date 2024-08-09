import { BranchOffice } from 'src/branch-office/branch-office.entity';
import { MenuPosition } from 'src/menu-position/menu-position.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  relevantFrom: Date;

  @Column()
  expire: Date;

  @ManyToMany(() => MenuPosition, (menuPosition) => menuPosition.menus)
  @JoinTable()
  menuPositions: MenuPosition[];

  @ManyToOne(() => BranchOffice, (office) => office, { nullable: false })
  providingCanteen: BranchOffice;

  @ManyToOne(() => User, (user) => user)
  author: User;

  @UpdateDateColumn()
  changed: Date;

  @CreateDateColumn()
  created: Date;
}
