import { combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Pin } from './pin';
import { PinLike } from './pin-like';
import { PinMap } from './pin-map';


export class Pack extends Pin {
  constructor(readonly pinmap?: PinMap) {
    super();

    if (pinmap)
      this.track(pinmap.subscribe((_: string, pin: PinLike) => pin.to(this)));
  }

  protected resolve(inbound: PinLike[]) {
    if (this.pinmap) {
      let _entries = this.pinmap.entries;
      if (_entries.length == 0) return of(undefined);
      return combineLatest(..._entries.map(entry => entry[1].observable))
              .pipe(map(
                  data => _entries.reduce(
                    (_map, entry, index) => {
                      _map[entry[0]] = data[index];
                      return _map;
                    }
                    , <{[label: string]: any}>{})
              ))
    }
    else
      return combineLatest(
        ...inbound
        .map(pin => pin.observable));
  }
}


export default function pack(pinmap?: PinMap) { return new Pack(pinmap); }
