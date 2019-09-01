import { Control } from '../pin/control';
import map from '../pin/map';
import filter from '../pin/filter';

import group from '../pin/group';

import { Agent } from './agent';
import { NodeLike } from './node-like';


/**
 * 
 * Represents [gate](https://connective.dev/docs/gate) agents.
 * 
 */
export class Gate extends Agent implements NodeLike {
  private _control: Control;

  constructor() {
    super({inputs: ['value'], outputs: ['value']});
    this._control = new Control();
  }

  /**
   * 
   * Shortcut for `.in('value')`, the input pin receiving values.
   * [Read this](https://connective.dev/docs/gate#signature) for more details.
   * 
   */
  public get input() { return this.in('value'); }

  /**
   * 
   * Shortcut for `.out('value')`, the output emitting allowed values.
   * [Read this](https://connective.dev/docs/gate#signature) for more details.
   * 
   */
  public get output() { return this.out('value'); }

  /**
   * 
   * Each pin connected to this pin should emit a boolean value for each
   * value sent to `.input`, and if all are true, the value is emitted via `.output`.
   * [Read this](https://connective.dev/docs/gate) for more details.
   * 
   */
  public get control() { return this._control; }

  protected createOutput(label: string) {
    this.checkOutput(label);
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


/**
 * 
 * Creates a [gate](https://connective.dev/docs/gate) agent.
 * Gate agents await a control signal for each incoming value and either pass it along
 * or drop it based on the boolean value of the control signal.
 * [Checkout the docs](https://connective.dev/docs/gate) for examples and further information.
 * 
 */
export function gate() { return new Gate(); }


export default gate;
