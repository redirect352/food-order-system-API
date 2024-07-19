import { BranchOffice } from 'src/branch-office/branch-office.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

export type UserRoleType =
  | 'client'
  | 'deliveryman'
  | 'orderIssuing'
  | 'menuModerator'
  | '1CExport'
  | 'admin';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  patronymic: string;

  @Column()
  PersonnelNumber: string;

  @Column({ unique: true })
  login: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ default: true })
  isPasswordTemporary: boolean;

  @Column({
    type: 'enum',
    enum: [
      'client',
      'deliveryman',
      'orderIssuing',
      'menuModerator',
      '1CExport',
      'admin',
    ],
    default: 'client',
  })
  role: UserRoleType;

  @ManyToOne(() => BranchOffice, (branchOffice) => branchOffice, {
    nullable: false,
  })
  office: BranchOffice;

  @CreateDateColumn()
  registered: Date;

  @UpdateDateColumn()
  changed: Date;
}
