import isequal from 'lodash.isequal';
import { shareReplay, tap, filter } from 'rxjs/operators';

import { PinLike } from '../pin/pin-like';
import lazy from '../pin/lazy';

import { Agent } from './agent';


export class State extends Agent {
  _last: any;

  constructor() {
    super({
      inputs: ['value'],
      outputs: ['value']
    });
  }

  get input() { return this.in('value'); }
  get output() { return this.out('value'); }

  protected createOutput(_: string): PinLike {
    return lazy(() => this.input.observable.pipe(
      filter(value => !isequal(value, this._last)),
      tap(value => this._last = value),
      shareReplay(1)
    ));
  }
}
