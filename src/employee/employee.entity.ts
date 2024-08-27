import { BranchOffice } from 'src/branch-office/branch-office.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  surname: string;
  @Column()
  name: string;
  @Column()
  patronymic: string;
  @Column()
  personnelNumber: string;
  @ManyToOne(() => BranchOffice, (branchOffice) => branchOffice.employees, {
    nullable: false,
  })
  office: BranchOffice;
  @Column()
  active: boolean;

  @OneToOne(() => User, (user) => user.employeeBasicData)
  user?: User;
}
