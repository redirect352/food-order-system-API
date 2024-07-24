import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeCheckerService {
  private readonly timeUnits = {
    ms: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
  };
  isTimeInIntervalFromNow(
    time: Date | null = null,
    interval: number,
    units: 'ms' | 's' | 'm' | 'h' = 'ms',
  ) {
    if (!time) {
      return false;
    }
    const now = new Date();
    return now.getTime() - time.getTime() <= interval * this.timeUnits[units];
  }
}
