import { Observable } from 'rxjs';
import { map, mergeMap, share } from 'rxjs/operators';

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


export class Map extends Pipe {
  readonly map: MapFunc;

  constructor(_map: MapFunc) {
    super(
      (_map.length <= 1)?
      ([map(emission => {
        try {
          return emission.fork((_map as MapFuncSync)(emission.value));
        } catch(error) {
          throw new EmissionError(error, emission);
        }
      })]):
      ([
        mergeMap(emission =>
          new Observable<Emission>(subscriber => {
            _map(emission.value, (res: any) => {
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

    this.map = _map;
  }
}


export default function(map: MapFunc) { return new Map(map); }
