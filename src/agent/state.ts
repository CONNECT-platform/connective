import isequal from 'lodash.isequal';
import { shareReplay, distinctUntilKeyChanged, startWith } from 'rxjs/operators';

import { Bindable } from '../shared/bindable';
import { emission } from '../shared/emission';

import { PinLike } from '../pin/pin-like';
import pipe from '../pin/pipe';

import { Agent } from './agent';


export type EqualityFunc = (a: any, b: any) => boolean;

const _Unset = {};

export class State extends Agent implements Bindable {
  readonly initial: any = _Unset;
  readonly compare: EqualityFunc;

  constructor(initialOrCompare?: any | EqualityFunc);
  constructor(initial: any, compare: EqualityFunc);
  constructor(initialOrCompare: EqualityFunc | any = isequal, compare?: EqualityFunc) {
    super({
      inputs: ['value'],
      outputs: ['value']
    });

    if (compare) {
      this.initial = initialOrCompare;
      this.compare = compare;
    }
    else {
      if (typeof initialOrCompare === 'function')
        this.compare = initialOrCompare;
      else {
        this.initial = initialOrCompare;
        this.compare = isequal;
      }
    }
  }

  get input() { return this.in('value'); }
  get output() { return this.out('value'); }

  public bind(): this {
    this.track(this.output.observable.subscribe());
    return this;
  }

  protected createOutput(_: string): PinLike {
    if (this.initial !== _Unset) {
      return this.input
        .to(pipe(
          startWith(emission(this.initial)),
          distinctUntilKeyChanged('value', this.compare),
          shareReplay(1)
        ))
    }
    else
      return this.input
        .to(pipe(
          distinctUntilKeyChanged('value', this.compare),
          shareReplay(1)
        ));
  }

  protected createEntries() { return [this.input] }
  protected createExits() { return [this.output] }
}


export function state(compare: any | EqualityFunc = isequal) { return new State(compare); }


export default state;
