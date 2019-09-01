import { PinLike } from '../pin/pin-like';
import control, { Control } from '../pin/control';
import pack from '../pin/pack';
import map from '../pin/map';
import filter from '../pin/filter';

import { Agent } from './agent';
import { AgentLike } from './agent-like';
import { NodeLike } from './node-like';
import { Node } from './node';


/**
 * 
 * A class to wrap an agent so that it behaves like a [node](https://connective.dev/docs/node).
 * 
 */
export class NodeWrap extends Agent implements NodeLike {
  private _control: Control;
  private _pack: PinLike;

  private _control_required = true;

  /**
   * 
   * @param core the original agent to be wrapped.
   * 
   */
  constructor(readonly core: AgentLike) {
    super(core.signature);

    this._control = control();
    this._pack = pack(
      this.inputs,
      this._control.to(map(() => this._control_required = false))
    )
    .to(filter(() => !this._control_required))
    .to(map((all: any) => {
      if (this._control.connected)
        this._control_required = true;
      return all[0];
    }));

    this.track(core.inputs.subscribe((label, pin) => {
      this._pack.to(map((all: any) => all[label])).to(pin);
    }));

    this.track(core.outputs.subscribe((label, pin) => {
      pin.to(this.out(label));
    }));
  }

  public get control(): Control { return this._control; }

  protected createInput(label: string) {
    this.core.in(label);
    return super.createInput(label);
  }

  protected createOutput(label: string) {
    this.core.out(label);
    return super.createOutput(label);
  }

  clear() {
    this._control.clear();
    this._pack.clear();
    this.core.clear();
    return super.clear();
  }
}


/**
 * 
 * Wraps given agent in a `NodeWrap`, making it behave like a 
 * [node](https://connective.dev/docs/node):
 * 
 * - It will wait for all of its inputs to emit at least once before first execution
 * - Re-executes any time a new value is emitted from any of the inputs
 * - Waits for its `.control` if its connected before each execution
 * - Responds with the first output of the wrapped agent for each execution
 * 
 * @param agent 
 * 
 */
export function nodeWrap(agent: AgentLike): NodeLike {
  if (agent instanceof Node) return agent;
  return new NodeWrap(agent);
}


export default nodeWrap;
