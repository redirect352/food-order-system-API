import { Dish } from 'src/dish/dish.entity';
import { Menu } from 'src/menu/menu.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
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
}
