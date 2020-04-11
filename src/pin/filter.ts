import { Observable } from 'rxjs';
import { filter as _filter, map, mergeMap, share } from 'rxjs/operators';

import { ResolveCallback, ErrorCallback, ContextType } from '../shared/types';
import { EmissionError } from '../shared/errors/emission-error';

import { Pipe } from './pipe';
import { PinLike } from './pin-like';
import { Pin, Connectible } from '.';
import { BasePin } from './base';


export type FilterFuncSync<T> = (value: T) => boolean;
export type FilterFuncAsync<T> = (value: T,
                            callback: ResolveCallback<boolean>,
                            error: ErrorCallback,
                            context: ContextType) => void;
export type FilterFunc<T> = FilterFuncSync<T> | FilterFuncAsync<T>;


/**
 *
 * Represents [filter](https://connective.dev/docs/filter) pins.
 *
 */
export class Filter<T> extends Pipe<T, T> {
  /**
   *
   * The predicate of this filter pin.
   *
   */
  readonly filter: FilterFunc<T>;

  constructor(_func: FilterFunc<T>) {
    super(
      (_func.length <= 1)?
      ([_filter(emission => {
        try {
          return (_func as FilterFuncSync<T>)(emission.value);
        } catch(error) {
          throw new EmissionError(error, emission);
        }
      })]):
      ([
        mergeMap(emission =>
          new Observable(subscriber => {
            _func(emission.value, (res: boolean) => {
              subscriber.next(res);
              subscriber.complete();
            },
            (error: Error | string) => {
              subscriber.error(new EmissionError(error, emission));
            },
            emission.context);
          })
          .pipe(_filter(_ => !!_), map(_ => emission))
        ),
        share() as any
      ])
    );

    this.filter = _func;
  }
}


//
// TODO: when the return type is `Pin-Like`, then type-inference works fine (@see test/filter.test.ts)
//       however, when the return type is bumped to `BasePin` for example, then the type-inference system
//       goes hay-wire. inspect this further and fix it.
//
export function filter<T>(filter: FilterFuncAsync<T>): PinLike<T, T>;
export function filter<T>(filter: FilterFuncSync<T>): PinLike<T, T>;
/**
 *
 * Creates a [filter](https://connective.dev/docs/filter) pin using given predicate.
 * A filter pin will pass some values through and not others based on given predicate.
 * [Checkout the docs](https://connective.dev/docs/filter) for examples and further information.
 *
 * @param filter
 *
 */
export function filter<T>(filter: FilterFunc<T>) { return new Filter(filter); }

/**
 *
 * Creates a [filter](https://connective.dev/docs/filter) that never allows any value through.
 *
 */
export function block() { return new Filter(() => false); }


export default filter;
