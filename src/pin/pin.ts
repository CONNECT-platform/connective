import { Observable, merge } from 'rxjs';

import { Emission } from '../shared/emission';

import { PinLike } from './pin-like';
import { Connectible } from './connectible';


export class Pin extends Connectible {
  protected isLocked(observable: Observable<Emission> | undefined) {
    return observable !== undefined;
  }

  protected shouldResolve(_: PinLike[], observable: Observable<Emission> | undefined) {
    return observable === undefined;
  }

  protected resolve(inbound: PinLike[]): Observable<Emission> {
    return (inbound.length == 1)?
      inbound[0].observable:
      merge(...inbound.map(pin => pin.observable));
  }
}


export default function() { return new Pin(); }
