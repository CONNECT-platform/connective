import { Control } from '../pin/control';
import map from '../pin/map';
import filter from '../pin/filter';

import group from '../pin/group';

import { Agent } from './agent';
import { NodeLike } from './node-like';


export class Gate extends Agent implements NodeLike {
  private _control: Control;

  constructor() {
    super({inputs: ['value'], outputs: ['value']});
    this._control = new Control();
  }

  public get input() { return this.in('value'); }
  public get output() { return this.out('value'); }
  public get control() { return this._control; }

  protected createOutput() {
    return group(this.control, this.input)
      .to(new Control())
      .to(filter(([ctrl, _]: [any[], any]) => ctrl.every(signal => !!signal)))
      .to(map(([_, input]: [any, any]) => input));
  }

  protected createEntries() { return [this.input]; }
  protected createExits() { return [this.output]; }

  clear() {
    this.control.clear();
    return super.clear();
  }
}


export function gate() { return new Gate(); }


export default gate;
