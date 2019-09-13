import { Observable } from 'rxjs';
import { map as _map, mergeMap, share } from 'rxjs/operators';

import { ResolveCallback, ErrorCallback, ContextType } from '../shared/types';
import { Emission } from '../shared/emission';
import { EmissionError } from '../shared/errors/emission-error';

import { Pipe } from './pipe';


export type MapFuncSync = (value: any) => any;
export type MapFuncAsync = (value: any,
                            callback: ResolveCallback<any>,
                            error: ErrorCallback,
                            context: ContextType) => void;
export type MapFunc = MapFuncSync | MapFuncAsync;


/**
 *
 * Represents [map](https://connective.dev/docs/map) pins.
 *
 */
export class Map extends Pipe {
  /**
   *
   * The transformation of this map pin.
   *
   */
  readonly map: MapFunc;

  constructor(_func: MapFunc) {
    super(
      (_func.length <= 1)?
      ([_map(emission => {
        try {
          return emission.fork((_func as MapFuncSync)(emission.value));
        } catch(error) {
          throw new EmissionError(error, emission);
        }
      })]):
      ([
        mergeMap(emission =>
          new Observable<Emission>(subscriber => {
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
        share()
      ])
    );

    this.map = _func;
  }
}


/**
 *
 * Creates a [map](https://connective.dev/docs/map) pin using given transformation.
 * A map pin will transform incoming values based on given transformation.
 * [Checkout the docs](https://connective.dev/docs/map) for examples and further information.
 *
 * @param map
 *
 */
export function map(map: MapFunc) { return new Map(map); }


export default map;
