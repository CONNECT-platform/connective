import { Observable } from 'rxjs';

import { PinLike } from './pin-like';


export abstract class BasePin implements PinLike {
  abstract connect(_: PinLike): this;
  abstract clear(): this;
  abstract observable: Observable<any>;

  to(...pins: PinLike[]) {
    pins.forEach(pin => pin.from(this));
    return this;
  }

  from(...pins: PinLike[]) {
    pins.forEach(pin => this.connect(pin));
    return this;
  }
}
