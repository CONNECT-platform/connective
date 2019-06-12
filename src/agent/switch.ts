import { Observable } from 'rxjs';
import { filter, mergeMap, map } from 'rxjs/operators';

import { PinLike } from '../pin/pin-like';
import lazy from '../pin/lazy';

import { Agent } from './agent';


export class Switch extends Agent {
  constructor(readonly cases: any[]) {
    super({
      inputs: ['target'],
      outputs: cases.map((_, index) => index.toString()),
    });
  }

  public get target() { return this.in('target'); }
  public case(index: number) { return this.out(`${index}`); }


  protected createOutput(label: string): PinLike {
    let _case = this.cases[label as any];

    if (typeof _case === 'function') {
      if (_case.length <= 1)
        return lazy(() => this.target.observable.pipe(filter(_case)));
      else
        return lazy(() => this.target.observable.pipe(
          mergeMap(value =>
            new Observable(subscriber => _case(value, (res: boolean) => subscriber.next(res)))
              .pipe(filter(_ => !!_), map(_ => value))
          )
        ));
    }
    else
      return lazy(() => this.target.observable.
        pipe(filter(data => data == _case)));
  }
}
