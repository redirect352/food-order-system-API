import { Employee } from '../employee/employee.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class BranchOffice {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  address: string;
  @Column({ default: false, select: false })
  isCanteen: boolean;
  @ManyToOne(() => BranchOffice, (branchOffice) => branchOffice)
  servingCanteen: BranchOffice;
  @OneToMany(() => Employee, (employee) => employee.office)
  employees: Employee;
}
