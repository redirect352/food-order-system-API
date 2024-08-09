import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

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
}
