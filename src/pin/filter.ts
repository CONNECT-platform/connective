import { Observable, merge } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

import { Pin } from './pin';


export type FilterFuncSync = (value: any) => boolean;
export type FilterFuncAsync = (value: any,
                            callback: (result: boolean) => void,
                            error: (error: Error | string) => void) => void;
export type FilterFunc = FilterFuncSync | FilterFuncAsync;

export class Filter extends Pin {
  constructor(readonly filter: FilterFunc) {super();}

  protected resolve(inbound: Pin[]) {
    let merged = merge(...inbound.map(pin => pin.observable));
    if (this.filter.length <= 1)
      return merged.pipe(filter(this.filter as FilterFuncSync));
    else
      return merged.pipe(
        mergeMap(value =>
          new Observable(subscriber => {
            this.filter(value, (res: boolean) => {
              subscriber.next(res);
              subscriber.complete();
            },
            (error: Error | string) => {
              subscriber.error(error);
            });
          })
          .pipe(filter(_ => !!_), map(_ => value))
        ));
  }
}

export default function(filter: FilterFunc) { return new Filter(filter); }
