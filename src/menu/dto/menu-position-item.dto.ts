import { autoImplement } from 'lib/utils/auto-implement';
import * as _ from 'lodash';
import { MenuPosition } from 'src/menu-position/menu-position.entity';

type OptionalMenuPosition = Partial<MenuPosition>;

export class MenuPositionItem extends autoImplement<OptionalMenuPosition>() {
  constructor(position: MenuPosition) {
    super();
    Object.assign(
      this,
      _.omit(position, [
        'dish.providingCanteen.id',
        'dish.providingCanteen.address',
        'dish.image.id',
      ]),
    );
  }
}
