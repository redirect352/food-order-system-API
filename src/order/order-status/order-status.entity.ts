import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Order } from '../order.entity';

@Entity()
export class OrderStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  canCancel: boolean;

  @OneToMany(() => Order, (order) => order.status, {
    eager: false,
  })
  orders: Order;
}
