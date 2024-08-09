import { Dish } from 'src/dish/dish.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class DishCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Dish, (dish) => dish.category, {
    eager: false,
  })
  dish?: Dish[];
}
