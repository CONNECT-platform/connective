import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import emission, { Emission } from '../shared/emission';

import { PinLockedError } from './errors/locked.error';
import { PinLike } from './pin-like';
import { BasePin } from './base';


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


export function wrap(observable: Observable<any>) { return new Wrapper(observable); }


export default wrap;
