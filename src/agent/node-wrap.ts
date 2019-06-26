import { of } from 'rxjs';
import { share } from 'rxjs/operators';

import { PinLike } from '../pin/pin-like';
import control, { Control } from '../pin/control';
import pack from '../pin/pack';
import map from '../pin/map';
import pipe from '../pin/pipe';
import wrap from '../pin/wrap';

import { Agent } from './agent';
import { AgentLike } from './agent-like';
import { NodeLike } from './node-like';
import { Node } from './node';


export class NodeWrap extends Agent implements NodeLike {
  private _control: Control;
  private _valve: Control;
  private _pack: PinLike;
  private _gate: PinLike;

  constructor(readonly core: AgentLike) {
    super(core.signature);

    this._control = control();
    this._gate = map((_: any, cb: any) => setImmediate(cb)).from(wrap(of(true)));
    this._pack = pack(this.inputs, this._control);
    this._valve = control().from(this._pack, this._gate);

    this.track(core.inputs.subscribe((label, pin) => {
      this._valve.to(map((all: any) => all[0][0][label]).to(pin));
    }));

    this.track(core.outputs.subscribe((label, pin) => {
      pin.to(
        pipe(share()).to(
          this.out(label),
          this._gate,
        )
      );
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
    this._gate.clear();
    this._valve.clear();
    this.core.clear();
    return super.clear();
  }
}


export default function(agent: AgentLike): NodeLike {
  if (agent instanceof Node) return agent;
  return new NodeWrap(agent);
}
