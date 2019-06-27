import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { ResolveCallback, ErrorCallback } from '../shared/types';

import { Pipe } from './pipe';


export type MapFuncSync = (value: any) => any;
export type MapFuncAsync = (value: any,
                            callback: ResolveCallback<any>,
                            error: ErrorCallback) => void;
export type MapFunc = MapFuncSync | MapFuncAsync;


export class Map extends Pipe {
  readonly map: MapFunc;

  constructor(_map: MapFunc) {
    super(
      (_map.length <= 1)?
      (map(_map as MapFuncSync)):
      (
        mergeMap(value =>
          new Observable(subscriber => {
            _map(value, (res: boolean) => {
              subscriber.next(res);
              subscriber.complete();
            },
            (error: Error | string) => {
              subscriber.error(error);
            });
          })
        )
      )
    );

    this.map = _map;
  }
}


export default function(map: MapFunc) { return new Map(map); }
