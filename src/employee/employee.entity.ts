import { BranchOffice } from 'src/branch-office/branch-office.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

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
}
