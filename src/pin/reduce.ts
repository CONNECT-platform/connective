import { Observable } from 'rxjs';
import { map, mergeMap, share } from 'rxjs/operators';

import { ResolveCallback, ErrorCallback, ContextType } from '../shared/types';
import { Emission } from '../shared/emission';
import { EmissionError } from '../shared/errors/emission-error';

import { Pipe } from './pipe';


export type ReduceFuncSync = (acc: any, cur: any) => any;
export type ReduceFuncAsync = (acc: any, cur: any,
                            callback: ResolveCallback<any>,
                            error: ErrorCallback,
                            emissionContext: ContextType,
                            accContext: ContextType) => void;
export type ReduceFunc = ReduceFuncSync | ReduceFuncAsync;


const _Unset = {};

export class Reduce extends Pipe {
  private _acc: Emission | undefined = undefined;

  constructor(readonly reduce: ReduceFunc, readonly start: any = _Unset) {
    super(
      (reduce.length <= 2)?
      ([map((emission: Emission) => {
        if (!this._acc) {
          this._acc = this._init(emission, start);
          if (start === _Unset) return this._acc;
        }

        this._acc = Emission.from([this._acc, emission],
            (reduce as ReduceFuncSync)(this._acc.value, emission.value));
        return this._acc;
      })]):
      ([
        mergeMap(emission =>
          new Observable<Emission>(subscriber => {
            if (!this._acc) {
              this._acc = this._init(emission, start);

              if (start === _Unset) {
                subscriber.next(this._acc);
                subscriber.complete();
                return;
              }
            }

            reduce(this._acc.value, emission.value,
              (res: any) => {
                this._acc = Emission.from([<Emission>this._acc, emission], res);
                subscriber.next(this._acc);
                subscriber.complete();
              },
              (error: Error | string) => {
                subscriber.error(new EmissionError(error, emission));
              },
              emission.context, this._acc.context);
          })
        ),
        share()])
    );
  }

  private _init(emission: Emission, start: any): Emission {
    if (start !== _Unset) return emission.fork(start);
    else return emission;
  }
}


export function reduce(reduce: ReduceFunc, start: any = _Unset) { return new Reduce(reduce, start); }


export default reduce;
