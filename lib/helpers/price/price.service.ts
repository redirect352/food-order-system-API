import { Injectable } from '@nestjs/common';

@Injectable()
export class PriceService {
  getFullPrice(items: { price: number; discount: number; count: number }[]) {
    return items.reduce((sum, { price, discount, count }) => {
      return sum + this.getPriceWithDiscount(price, discount, count);
    }, 0);
  }
  getPriceWithDiscount(price: number, discount: number, count: number = 1) {
    const discountValue = this.getDiscountValue(price, discount);
    const priceWithDiscount = +(price - discountValue) * count;
    return Math.round(priceWithDiscount);
  }
  getDiscountValue(price: number, discount: number, count: number = 1) {
    const oneItemDiscount = Math.round((price * discount) / 100);
    return oneItemDiscount * count;
  }
}
