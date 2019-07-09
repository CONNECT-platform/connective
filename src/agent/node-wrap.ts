import { PinLike } from '../pin/pin-like';
import control, { Control } from '../pin/control';
import pack from '../pin/pack';
import map from '../pin/map';

import { Agent } from './agent';
import { AgentLike } from './agent-like';
import { NodeLike } from './node-like';
import { Node } from './node';


export class NodeWrap extends Agent implements NodeLike {
  private _control: Control;
  private _pack: PinLike;

  constructor(readonly core: AgentLike) {
    super(core.signature);

    this._control = control();
    this._pack = pack(this.inputs, this._control);

    this.track(core.inputs.subscribe((label, pin) => {
      this._pack.to(map((all: any) => all[0][label])).to(pin);
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


export default function(agent: AgentLike): NodeLike {
  if (agent instanceof Node) return agent;
  return new NodeWrap(agent);
}
