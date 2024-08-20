import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Order } from '../order.entity';

@Entity()
export class OrderStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Order, (order) => order.status, {
    eager: false,
  })
  orders: Order;
}
