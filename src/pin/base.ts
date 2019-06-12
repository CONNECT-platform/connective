import { Observable } from 'rxjs';

import { PinLike } from './pin-like';


export abstract class BasePin implements PinLike {
  abstract from(_: PinLike): this;
  abstract clear(): this;
  abstract observable: Observable<any>;

  to(pin: PinLike) {
    pin.from(this);
    return this;
  }
}
