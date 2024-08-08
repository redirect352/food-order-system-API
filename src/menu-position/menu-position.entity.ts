import { Dish } from 'src/dish/dish.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

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
  })
  dish: Dish;
}
