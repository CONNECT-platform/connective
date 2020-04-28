import { Observable } from 'rxjs';
import { map as _map, mergeMap, share } from 'rxjs/operators';

import { ResolveCallback, ErrorCallback, ContextType } from '../shared/types';
import { Emission } from '../shared/emission';
import { EmissionError } from '../shared/errors/emission-error';

import { Pipe } from './pipe';
import { PinLike } from '.';


export type MapFuncSync<I, O> = (value: I) => O;
export type MapFuncAsync<I, O> = (value: I,
                            callback: ResolveCallback<O>,
                            error: ErrorCallback,
                            context: ContextType) => void;
export type MapFunc<I, O> = MapFuncSync<I, O> | MapFuncAsync<I, O>;


/**
 *
 * Represents [map](https://connective.dev/docs/map) pins.
 *
 */
export class Map<O=unknown, I=unknown> extends Pipe<O, I> {
  /**
   *
   * The transformation of this map pin.
   *
   */
  readonly map: MapFunc<I, O>;

  constructor(_func: MapFunc<I, O>) {
    super(
      (_func.length <= 1)?
      ([_map(emission => {
        try {
          return emission.fork((_func as MapFuncSync<I, O>)(emission.value));
        } catch(error) {
          throw new EmissionError(error, emission);
        }
      })]):
      ([
        mergeMap(emission =>
          new Observable<Emission<O>>(subscriber => {
            _func(emission.value, (res: any) => {
              subscriber.next(emission.fork(res));
              subscriber.complete();
            },
            (error: Error | string) => {
              subscriber.error(new EmissionError(error, emission));
            },
            emission.context);
          })
        ),
        share<Emission<O>>() as any
      ])
    );

    this.map = _func;
  }
}


export function map<I, O>(map: MapFuncAsync<I, O>): PinLike<O, I>;
export function map<I, O>(map: MapFuncSync<I, O>): PinLike<O, I>;
/**
 *
 * Creates a [map](https://connective.dev/docs/map) pin using given transformation.
 * A map pin will transform incoming values based on given transformation.
 * [Checkout the docs](https://connective.dev/docs/map) for examples and further information.
 *
 * @param map
 *
 */
export function map<I, O>(map: MapFunc<I, O>) { return new Map(map); }


export default map;
