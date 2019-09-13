import { PinLike } from '../pin/pin-like';
import { filter, FilterFunc, FilterFuncSync, FilterFuncAsync } from '../pin/filter';
import { map } from '../pin/map';

import { Agent } from './agent';


/**
 *
 * Represents [check](https://connective.dev/docs/check) agents.
 *
 */
export class Check extends Agent {
  private core: PinLike;

  /**
   *
   * @param predicate the predicate function to pass or fail incoming values against.
   *
   */
  constructor(readonly predicate: FilterFunc) {
    super({
      inputs: ['value'],
      outputs: ['pass', 'fail']
    });

    if (predicate.length <= 1)
      this.core = this.input.to(map((v: any) => [v, (predicate as FilterFuncSync)(v)]));
    else
      this.core = this.input.to(map((v : any, done, error, context) =>
        predicate(v, res => done([v, res]), error, context)));
  }

  /**
   *
   * Shortcut for `.in('value')`, the main value input for this check.
   * [Read this](https://connective.dev/docs/check#signature) for more details.
   *
   */
  public get input(): PinLike { return this.in('value'); }

  /**
   *
   * Shortcut for `.out('pass')`, the output for values passing the criteria outline by given predicate.
   * [Read this](https://connective.dev/docs/check#signature) for more details.
   *
   */
  public get pass(): PinLike { return this.out('pass'); }

  /**
   *
   * Shortcut for `.out('fail')`, the output for values failing the criteria outline by given predicate.
   * [Read this](https://connective.dev/docs/check#signature) for more details.
   *
   */
  public get fail(): PinLike { return this.out('fail'); }

  protected createOutput(label: string): PinLike {
    this.checkOutput(label);
    if (label == 'pass') {
      return this.core
        .to(filter(([_, v]: [any, boolean]) => v))
        .to(map(([v, _]: [any, boolean]) => v))
    }
    else {
      return this.core
      .to(filter(([_, v]: [any, boolean]) => !v))
      .to(map(([v, _]: [any, boolean]) => v))
    }
  }

  protected createEntries() { return [this.input]; }
  protected createExits() { return [this.pass, this.fail]; }
}


/**
 *
 * Creates a [check](https://connective.dev/docs/check) agent. A check agent
 * will pass or fail incoming values based on given predicate, passing them through
 * the corresponding outputs.
 * [Checkout the docs](https://connective.dev/docs/check) for examples and further information.
 *
 * @param func the predicate to test incoming values against
 *
 */
export function check(func: FilterFunc) { return new Check(func); }


export default check;