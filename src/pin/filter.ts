import { Observable } from 'rxjs';
import { filter, map, mergeMap, share } from 'rxjs/operators';

import { ResolveCallback, ErrorCallback, ContextType } from '../shared/types';
import { EmissionError } from '../shared/errors/emission-error';

import { Pipe } from './pipe';


export type FilterFuncSync = (value: any) => boolean;
export type FilterFuncAsync = (value: any,
                            callback: ResolveCallback<boolean>,
                            error: ErrorCallback,
                            context: ContextType) => void;
export type FilterFunc = FilterFuncSync | FilterFuncAsync;


export class Filter extends Pipe {
  readonly filter: FilterFunc;

  constructor(_filter: FilterFunc) {
    super(
      (_filter.length <= 1)?
      ([filter(emission => {
        try {
          return (_filter as FilterFuncSync)(emission.value);
        } catch(error) {
          throw new EmissionError(error, emission);
        }
      })]):
      ([
        mergeMap(emission =>
          new Observable(subscriber => {
            _filter(emission.value, (res: boolean) => {
              subscriber.next(res);
              subscriber.complete();
            },
            (error: Error | string) => {
              subscriber.error(new EmissionError(error, emission));
            },
            emission.context);
          })
          .pipe(filter(_ => !!_), map(_ => emission))
        ),
        share()
      ])
    );

    this.filter = _filter;
  }
}


export default function(filter: FilterFunc) { return new Filter(filter); }
export function block() { return new Filter(() => false); }
