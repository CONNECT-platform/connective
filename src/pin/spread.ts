import { from, of, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { Emission } from '../shared/emission';

import { Pipe } from './pipe';


/**
 *
 * Represents [spread](https://connective.dev/docs/spread) pins.
 *
 */
export class Spread extends Pipe {
  constructor() {
    super([
      mergeMap(emission =>
        (emission.value.map)?
        <Observable<Emission>>from(emission.value.map((v: any) => emission.fork(v))):
        of(emission)
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
export function spread() { return new Spread(); }


export default spread;
