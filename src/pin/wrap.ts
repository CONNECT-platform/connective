import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import emission, { Emission } from '../shared/emission';

import { PinLockedError } from './errors/locked.error';
import { PinLike } from './pin-like';
import { BasePin } from './base';


/**
 *
 * Represents [wrap](https://connective.dev/docs/wrap) pins.
 *
 */
class Wrapper extends BasePin {
  readonly observable: Observable<Emission>;
  constructor(observable: Observable<any>) {
    super();
    this.observable = observable.pipe(map(v => emission(v)));
  }

  connect(_: PinLike): this {
    throw new PinLockedError();
  }
}


/**
 *
 * Creates a [wrap](https://connective.dev/docs/wrap) pin. A wrap pin
 * wraps a given observable so that it can be connected to other pins. Because
 * its observable is already realized, you cannot connect other pins to a wrap pin.
 * [Checkout the docs](https://connective.dev/docs/wrap) for examples and further information.
 *
 * @param observable
 *
 */
export function wrap(observable: Observable<any>) { return new Wrapper(observable); }


export default wrap;
