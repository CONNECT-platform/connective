import isequal from 'lodash.isequal';
import { BehaviorSubject } from 'rxjs';

import { Bindable } from '../shared/bindable';
import { emission, Emission } from '../shared/emission';

import { PinLike } from '../pin/pin-like';
import group from '../pin/group';
import source, { Source } from '../pin/source';
import filter from '../pin/filter';

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

  private _subject: BehaviorSubject<Emission>;
  private _injector: Source;

  constructor(initialOrCompare?: any | EqualityFunc);
  constructor(initial: any, compare: EqualityFunc | undefined);
  /**
   *
   * @param initialOrCompare either initial value or equality function
   * @param compare the equality function, if provided the first parameter must be the initial value.
   */
  constructor(initialOrCompare: EqualityFunc | any = isequal, compare?: EqualityFunc | undefined) {
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

    this._subject = new BehaviorSubject<Emission>(emission(this.initial));
    this._injector = source();
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
   * Allows reading or updating `State`'s value directly. It will be equal
   * to the latest value emitted by the `State`, and setting it, if the value
   * has changed truly, will cause the `State` to emit the new value.
   * 
   */
  public get value() { return this._subject.value.value }
  public set value(v: any) { this._injector.send(v); }

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

  /**
   * 
   * @note `State`'s `.clear()` also causes a complete 
   * notification to be sent to observers.
   * 
   */
  public clear(): this {
    this._subject.complete();
    return super.clear();
  }

  protected createOutput(_: string): PinLike {
    this.checkOutput(_);

    return group(this.input, this._injector)
            .to(filter((v: any) => !this.compare(v, this.value)))
            .to(source(this._subject))
            .to(filter((v: any) => v !== _Unset));
  }

  protected createEntries() { return [this.input] }
  protected createExits() { return [this.output] }
}


// TODO: correct the signature of this function
// TODO: add overloads for this function
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
