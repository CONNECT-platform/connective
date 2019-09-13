import { zip, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import emission, { Emission } from '../shared/emission';

import { Pin } from './pin';
import { PinLike } from './pin-like';
import { PinMap } from './pin-map';


const _UNSET = {};

/**
 *
 * Represents [control](https://connective.dev/docs/control) pins.
 *
 */
export class Control extends Pin {
  constructor(readonly val: any = _UNSET) { super(); }

  /**
   *
   * Resolves underlying observable, by
   * [zipping](https://rxjs-dev.firebaseapp.com/api/index/function/zip)
   * corresponding observables of inbound pins.
   *
   * If a `PinMap` is passed to the constructor, it will instead
   * resolve to zip of all of the instantiated pins of that `PinMap`.
   *
   * If a value is passed to the constructor, and there are no inbound
   * pins, it will resolve to `of(<passed value>)`.
   *
   * @param inbound
   *
   */
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

/**
 *
 * Creates a [control](https://connective.dev/docs/control) pin.
 *
 * @param val if provided, the control pin will emit the given value when
 * all pins connected to it emit, otherwise it will emit the array concatenation
 * of received values. If no pins are connected to it, then it will emit the value
 * to any subscriber (or to any pin that this pin is connected to, when a subscription
 * is called somwhere down the chain).
 *
 * If a `PinMap` is given as the value, then after resolution, the control will be
 * connected to all "realised" pins of the given pinmap.
 *
 */
export function control(val?: any) { return new Control(val); }


export default control;
