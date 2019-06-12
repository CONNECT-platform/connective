import { Observable } from 'rxjs';

import { PinLockedError } from './errors/pinlocked.error';
import { AbstractPin } from './pin.interface';


class Wrapper implements AbstractPin {
  constructor(readonly observable: Observable<any>) {}

  from(pin: AbstractPin): this {
    throw new PinLockedError();
  }

  to(pin: AbstractPin) {
    pin.from(this);
    return this;
  }

  clear() {
    return this;
  }
}

export default function(observable: Observable<any>) { return new Wrapper(observable); }
