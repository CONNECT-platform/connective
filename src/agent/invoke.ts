import { Subscription } from 'rxjs';

import { PinLike } from '../pin/pin-like';
import control, { Control } from '../pin/control';
import map from '../pin/map';
import filter from '../pin/filter';
import pack from '../pin/pack';

import { Signature } from './signature';
import { Agent } from './agent';
import { NodeLike } from './node-like';
import { exec, AgentFactory, ExecResult } from './call';


export class Invoke extends Agent implements NodeLike {
  private _relay: PinLike;
  private _control: Control;
  private _all_subs: Subscription = new Subscription();

  private _control_required = true;

  constructor(readonly ref: AgentFactory, signature?: Signature) {
    super(signature || ref().signature);

    this._control = new Control();

    this._relay = pack(control(this.inputs), this._control.to(map(() => this._control_required = false)))
      .to(filter(() => !this._control_required))
      .to(map((_: any) => {
        if (this._control.connected)
          this._control_required = true;
        return _[0];
      }))
      .to(exec(this.ref, s => this._all_subs.add(s), s => this._all_subs.remove(s),
        () => this.outputs.entries.map(([label, _]) => label)));
  }

  protected createOutput(label: string) {
    return this._relay
      .to(filter((data: ExecResult) => data.label == label))
      .to(map((data: ExecResult) => data.value));
  }

  protected createEntries() { return (this.signature.inputs || []).map(i => this.in(i)); }
  protected createExits() { return this.signature.outputs.map(o => this.out(o)); }

  public get control() { return this._control; }

  public clear() {
    this._relay.clear();
    this._control.clear();
    this._all_subs.unsubscribe();
    return super.clear();
  }
}


export function invoke(ref: AgentFactory, signature?: Signature) { return new Invoke(ref, signature); }


export default invoke;
