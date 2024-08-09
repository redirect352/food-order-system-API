import { BranchOffice } from 'src/branch-office/branch-office.entity';
import { DishCategory } from 'src/dish-category/dish-category.entity';
import { Image } from 'src/image/image.entity';
import { MenuPosition } from 'src/menu-position/menu-position.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Dish {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  quantity: string;
  @Column()
  calorieContent: string;
  @Column({ nullable: true })
  proteins?: number;
  @Column({ nullable: true })
  fats?: number;
  @Column({ nullable: true })
  carbohydrates?: number;
  @Column({ nullable: true })
  bestBeforeDate?: string;
  @Column({ nullable: true })
  externalProducer?: string;

  @ManyToOne(() => BranchOffice, (office) => office, {
    nullable: false,
    eager: true,
  })
  providingCanteen: BranchOffice;

  @ManyToOne(() => Image, (image) => image, { eager: true })
  image?: Image;

  @ManyToOne(() => DishCategory, (dishCategory) => dishCategory.dish, {
    eager: true,
    nullable: false,
  })
  category: DishCategory;

  @OneToMany(() => MenuPosition, (menuPosition) => menuPosition.dish, {
    eager: false,
  })
  menuPositions?: MenuPosition[];
}
