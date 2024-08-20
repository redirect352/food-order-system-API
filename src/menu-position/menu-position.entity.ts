import { Dish } from 'src/dish/dish.entity';
import { Menu } from 'src/menu/menu.entity';
import { OrderToMenuPosition } from 'src/order/order-to-menu-position/order-to-menu-position.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
} from 'typeorm';

@Entity()
export class MenuPosition {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  price: number;
  @Column({ default: 0 })
  discount: number;
  @ManyToOne(() => Dish, (dish) => dish.menuPositions, {
    nullable: false,
    cascade: ['insert', 'remove'],
    onDelete: 'CASCADE',
    eager: true,
  })
  dish: Dish;

  @ManyToMany(() => Menu, (menu) => menu.menuPositions)
  menus: Menu[];

  @OneToMany(
    () => OrderToMenuPosition,
    (orderToMenuPosition) => orderToMenuPosition.menuPosition,
  )
  menuPositionToOrder: OrderToMenuPosition[];
}
