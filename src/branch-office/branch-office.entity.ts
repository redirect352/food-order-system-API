import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class BranchOffice {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  adress: string;
  @Column({ default: false })
  isCanteen: boolean;
  @ManyToOne(() => BranchOffice, (branchOffice) => branchOffice)
  servingCanteen: BranchOffice;
}
