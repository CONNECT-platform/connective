import isequal from 'lodash.isequal';
import { shareReplay, distinctUntilKeyChanged } from 'rxjs/operators';

import { Bindable } from '../shared/bindable';

import { PinLike } from '../pin/pin-like';
import pipe from '../pin/pipe';

import { Agent } from './agent';


export class State extends Agent implements Bindable {
  constructor() {
    super({
      inputs: ['value'],
      outputs: ['value']
    });
  }

  get input() { return this.in('value'); }
  get output() { return this.out('value'); }

  public bind(): this {
    this.track(this.output.observable.subscribe());
    return this;
  }

  protected createOutput(_: string): PinLike {
    return this.input
      .to(pipe(
        distinctUntilKeyChanged('value', isequal),
        shareReplay(1)
      ))
  }
}


export default function() { return new State(); }
