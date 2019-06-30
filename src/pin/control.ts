import { zip, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import emission, { Emission } from '../shared/emission';

import { Pin } from './pin';
import { PinLike } from './pin-like';


const _UNSET = {};

export class Control extends Pin {
  constructor(readonly val: any = _UNSET) { super(); }

  protected resolve(inbound: PinLike[]): Observable<Emission> {
    if (inbound.length == 0) return of(emission(this.val));
    else {
      let _zipped = zip(...inbound.map(pin => pin.observable));
      if (this.val !== _UNSET)
        return _zipped.pipe(map(emissions => Emission.from(emissions, this.val)));
      else return _zipped.pipe(map(emissions => Emission.from(emissions)));
    };
  }
}


export default function(val?: any) { return new Control(val); }
