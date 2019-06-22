import isequal from 'lodash.isequal';
import { shareReplay, tap } from 'rxjs/operators';

import { Bindable } from '../shared/bindable';
import { PinLike } from '../pin/pin-like';
import pipe from '../pin/pipe';
import filter from '../pin/filter';

import { Agent } from './agent';


export class State extends Agent implements Bindable {
  _last: any;

  constructor() {
    super({
      inputs: ['value'],
      outputs: ['value']
    });
  }

  get input() { return this.in('value'); }
  get output() { return this.out('value'); }
  get last() { return this._last; }

  public bind(): this {
    return this.track(this.output.observable.subscribe(() => {}));
  }

  protected createOutput(_: string): PinLike {
    return pipe(
      tap(value => this._last = value),
      shareReplay(1)
    )
    .from(
      filter((value: any) => !isequal(value, this._last))
      .from(this.input)
    );
  }
}
