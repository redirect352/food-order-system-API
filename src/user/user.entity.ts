import { Employee } from 'src/employee/employee.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
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

  @OneToOne(() => Employee, (employee) => employee.user, {
    nullable: false,
    eager: true,
  })
  @JoinColumn()
  employeeBasicData: Employee;

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

  @CreateDateColumn()
  registered: Date;

  @UpdateDateColumn()
  changed: Date;
}
