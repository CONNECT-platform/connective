import { zip, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import emission, { Emission } from '../shared/emission';

import { Pin } from './pin';
import { PinLike } from './pin-like';
import { PinMap } from './pin-map';


const _UNSET = {};

export class Control extends Pin {
  constructor(readonly val: any = _UNSET) { super(); }

  protected resolve(inbound: PinLike[]): Observable<Emission> {
    if (this.val instanceof PinMap) {
      let _entries = this.val.entries;
      if (_entries.length == 0) return of(emission());
      return zip(..._entries.map(entry => entry[1].observable))
              .pipe(map(
                  emissions => Emission.from(emissions, _entries.reduce(
                    (_map, entry, index) => {
                      _map[entry[0]] = emissions[index].value;
                      return _map;
                    }
                    , <{[label: string]: any}>{}))
              ));
    }
    else if (inbound.length == 0) return of(emission(this.val));
    else {
      let _zipped = zip(...inbound.map(pin => pin.observable));
      if (this.val !== _UNSET)
        return _zipped.pipe(map(emissions => Emission.from(emissions, this.val)));
      else return _zipped.pipe(map(emissions => Emission.from(emissions)));
    };
  }
}


export function control(val?: any) { return new Control(val); }


export default control;
