import { zip, of } from 'rxjs';

import { Pin } from './pin';
import { PinLike } from './pin-like';


export class Control extends Pin {
  protected resolve(inbound: PinLike[]) {
    if (inbound.length == 0) return of(true);
    else return zip(...inbound.map(pin => pin.observable));
  }
}


export default function() { return new Control(); }
