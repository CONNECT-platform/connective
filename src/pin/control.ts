import { zip, of } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import { Pin } from './pin';
import { PinLike } from './pin-like';


class _UNSET {};

export class Control extends Pin {
  constructor(readonly val: any = _UNSET) { super(); }

  protected resolve(inbound: PinLike[]) {
    if (inbound.length == 0) return of(this.val);
    else {
      let _zipped = zip(...inbound.map(pin => pin.observable));
      if (this.val !== _UNSET)
        return _zipped.pipe(mapTo(this.val));
      else return _zipped;
    };
  }
}


export default function(val?: any) { return new Control(val); }
