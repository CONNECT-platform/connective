import { Observable } from 'rxjs';

import { PinLockedError } from './errors/locked.error';
import { PinLike } from './pin-like';


class Wrapper implements PinLike {
  constructor(readonly observable: Observable<any>) {}

  from(_: PinLike): this {
    throw new PinLockedError();
  }

  to(pin: PinLike) {
    pin.from(this);
    return this;
  }

  clear() {
    return this;
  }
}


export default function(observable: Observable<any>) { return new Wrapper(observable); }
