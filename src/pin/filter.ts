import { Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

import { Pipe } from './pipe';


export type FilterFuncSync = (value: any) => boolean;
export type FilterFuncAsync = (value: any,
                            callback: (result: boolean) => void,
                            error: (error: Error | string) => void) => void;
export type FilterFunc = FilterFuncSync | FilterFuncAsync;


export class Filter extends Pipe {
  readonly filter: FilterFunc;

  constructor(_filter: FilterFunc) {
    super(
      (_filter.length <= 1)?
      (filter(_filter as FilterFuncSync)):
      (
        mergeMap(value =>
          new Observable(subscriber => {
            _filter(value, (res: boolean) => {
              subscriber.next(res);
              subscriber.complete();
            },
            (error: Error | string) => {
              subscriber.error(error);
            });
          })
          .pipe(filter(_ => !!_), map(_ => value))
        )
      )
    );

    this.filter = _filter;
  }
}


export default function(filter: FilterFunc) { return new Filter(filter); }
