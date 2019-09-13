import isequal from 'lodash.isequal';
import { shareReplay, distinctUntilKeyChanged, startWith } from 'rxjs/operators';

import { Bindable } from '../shared/bindable';
import { emission } from '../shared/emission';

import { PinLike } from '../pin/pin-like';
import pipe from '../pin/pipe';

import { Agent } from './agent';


export type EqualityFunc = (a: any, b: any) => boolean;

const _Unset = {};

/**
 *
 * Represents [state](https://connective.dev/docs/state) agents.
 *
 */
export class State extends Agent implements Bindable {
  /**
   *
   * The initial value of the agent
   *
   */
  readonly initial: any = _Unset;

  /**
   *
   * The equality check function
   *
   */
  readonly compare: EqualityFunc;

  constructor(initialOrCompare?: any | EqualityFunc);
  constructor(initial: any, compare: EqualityFunc);
  /**
   *
   * @param initialOrCompare either initial value or equality function
   * @param compare the equality function, if provided the first parameter must be the initial value.
   */
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

  /**
   *
   * Shortcut for `.in('value')`, on which the state receives new values.
   * [Read this](https://connective.dev/docs/state#signature) for more details.
   *
   */
  get input() { return this.in('value'); }

  /**
   *
   * Shortcut for `.out('value')`, on which the state emits new values.
   * [Read this](https://connective.dev/docs/state#signature) for more details.
   *
   */
  get output() { return this.out('value'); }

  /**
   *
   * Causes the agent to start receiving values even
   * without any subscribers.
   *
   */
  public bind(): this {
    this.track(this.output.observable.subscribe());
    return this;
  }

  protected createOutput(_: string): PinLike {
    this.checkOutput(_);
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


/**
 *
 * Creates a [state](https://connective.dev/docs/state) agent.
 * State agents can hold state in a reactive flow.
 * [Checkout the docs](https://connective.dev/docs/state) for examples and further information.
 *
 * @param compare the equality function to be used to determine state change
 *
 */
export function state(compare: any | EqualityFunc = isequal) { return new State(compare); }


export default state;
