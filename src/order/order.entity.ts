import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { OrderStatus } from './order-status/order-status.entity';
import { OrderToMenuPosition } from './order-to-menu-position/order-to-menu-position.entity';

@Entity()
@Index(['number', 'issued'], { unique: true })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user, {
    nullable: false,
  })
  client: User;

  @OneToMany(
    () => OrderToMenuPosition,
    (orderToMenuPosition) => orderToMenuPosition.order,
  )
  public orderToMenuPosition: OrderToMenuPosition[];

  @ManyToOne(() => OrderStatus, (status) => status.orders, {
    nullable: false,
    eager: true,
    cascade: ['insert'],
  })
  status: OrderStatus;

  @Column()
  number: number;

  @Column({ type: 'date' })
  issued: string;

  @Column()
  fullPrice: number;

  @UpdateDateColumn()
  updated: Date;

  @CreateDateColumn()
  created: Date;
}
