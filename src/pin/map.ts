import { Observable } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';

import { Pipe } from './pipe';


export type MapFuncSync = (value: any) => any;
export type MapFuncAsync = (value: any,
                            callback: (result: any) => void,
                            error: (error: Error | string) => void) => void;
export type MapFunc = MapFuncSync | MapFuncAsync;


export class Map extends Pipe {
  readonly map: MapFunc;

  constructor(_map: MapFunc) {
    super(
      (_map.length <= 1)?
      (map(_map as MapFuncSync)):
      (
        concatMap(value =>
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


export default function(filter: MapFunc) { return new Map(filter); }