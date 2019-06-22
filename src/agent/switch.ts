import { PinLike } from '../pin/pin-like';
import filter from '../pin/filter';

import { Agent } from './agent';


export class Switch extends Agent {
  readonly cases : any[];

  constructor(...cases: any[]) {
    super({
      inputs: ['target'],
      outputs: cases.map((_, index) => index.toString()),
    });

    this.cases = cases;
  }

  public get target() { return this.in('target'); }
  public case(index: number) { return this.out(index); }

  protected createOutput(label: string): PinLike {
    let _case = this.cases[label as any];
    return (
            (typeof _case === 'function')?
            filter(_case):
            filter((value: any) => _case === value)
          )
          .from(this.target);
  }
}


export default function(...cases: any[]) { return new Switch(...cases); }
