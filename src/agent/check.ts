import { PinLike } from '../pin/pin-like';
import { filter, FilterFunc, FilterFuncSync, FilterFuncAsync } from '../pin/filter';
import { map } from '../pin/map';

import { Agent } from './agent';


export class Check extends Agent {
  private core: PinLike;

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

  public get input(): PinLike { return this.in('value'); }
  public get pass(): PinLike { return this.out('pass'); }
  public get fail(): PinLike { return this.out('fail'); }

  protected createOutput(label: string): PinLike {
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
}


export function check(func: FilterFunc) { return new Check(func); }


export default check;