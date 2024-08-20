import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from '../order.entity';
import { MenuPosition } from 'src/menu-position/menu-position.entity';

@Entity()
export class OrderToMenuPosition {
  @PrimaryGeneratedColumn()
  public orderToMenuPositionId: number;

  @Column()
  public orderId: number;

  @Column()
  public menuPositionId: number;

  @Column()
  public count: number;

  @ManyToOne(() => Order, (question) => question.orderToMenuPosition, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  public order: Order;

  @ManyToOne(() => MenuPosition, (category) => category.menuPositionToOrder)
  public menuPosition: MenuPosition;
}
