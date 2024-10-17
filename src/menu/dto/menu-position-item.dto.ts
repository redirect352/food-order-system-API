export class MenuPositionItem {
  constructor(position: any) {
    position.dish.category = position.dish.dish_category;
    position.dish.dish_category = undefined;
    Object.assign(this, position);
  }
}
