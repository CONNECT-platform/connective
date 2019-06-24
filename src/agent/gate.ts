import { Control } from '../pin/control';
import map from '../pin/map';
import filter from '../pin/filter';

import { Agent } from './agent';


export class Gate extends Agent {
  private _control: Control;

  constructor() {
    super({inputs: ['value'], outputs: ['value']});
    this._control = new Control();
  }

  public get input() { return this.in('value'); }
  public get output() { return this.out('value'); }
  public get control() { return this._control; }

  protected createOutput() {
    return map((_: [any, any]) => _[1])
      .from(
        filter((_: [any[], any]) => _[0].every(_ => !!_))
        .from(new Control().from(this.control, this.input))
      )
      ;
  }

  clear() {
    this.control.clear();
    return super.clear();
  }
}


export default function() { return new Gate(); }
