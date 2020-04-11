import { from, of, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { Emission } from '../shared/emission';

import { Pipe } from './pipe';


/**
 *
 * Represents [spread](https://connective.dev/docs/spread) pins.
 *
 */
export class Spread<T> extends Pipe<T, T[] | T> {
  constructor() {
    super([
      mergeMap<Emission<T[] | T>, Observable<Emission<T>>>(emission =>
        (Array.isArray(emission.value))?
        <Observable<Emission<T>>>from(emission.value.map(v => emission.fork(v))):
        of(emission as Emission<T>)
      )
    ])
  }
}


/**
 *
 * Creates a [spread](https://connective.dev/docs/spread) pin. A spread pin can be used
 * to spread contents of an array over multiple emissions.
 * [Checkout the docs](https://connective.dev/docs/spread) for examples and further information.
 *
 */
export function spread<T>() { return new Spread<T>(); }


export default spread;
