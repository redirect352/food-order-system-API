import { BranchOffice } from 'src/branch-office/branch-office.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

export type UserRole =
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
  personnelNumber: string;

  @Column({ unique: true })
  login: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: true })
  isPasswordTemporary: boolean;

  @Column({ default: null })
  verificationEmailSendTime?: Date;

  @Column({ default: null })
  lastPasswordResetTime?: Date;

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
  role: UserRole;

  @ManyToOne(() => BranchOffice, (branchOffice) => branchOffice, {
    nullable: false,
    eager: true,
  })
  office: BranchOffice;

  @CreateDateColumn()
  registered: Date;

  @UpdateDateColumn()
  changed: Date;
}
