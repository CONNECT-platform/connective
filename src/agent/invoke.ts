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


/**
 * 
 * Represents [invoke](https://connective.dev/docs/invoke) agents.
 * 
 */
export class Invoke extends Agent implements NodeLike {
  private _relay: PinLike;
  private _control: Control;
  private _all_subs: Subscription = new Subscription();

  private _control_required = true;

  /**
   * 
   * @param ref the agent factory to be used in response to each set of incoming data
   * @param signature an optional signature denoting the signature of the agents that
   * are to be created. If not provided and not directly deducable from the factory function itself,
   * the factory function will be invoked once to deduce the signature.
   * 
   */
  constructor(readonly ref: AgentFactory, signature?: Signature) {
    super(signature || (ref as any).signature || ref().clear().signature);

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
    this.checkOutput(label);
    return this._relay
      .to(filter((data: ExecResult) => data.label == label))
      .to(map((data: ExecResult) => data.value));
  }

  protected createEntries() { return (this.signature.inputs || []).map(i => this.in(i)); }
  protected createExits() { return this.signature.outputs.map(o => this.out(o)); }

  /**
   * 
   * You can control when the agent creates the inner-agent and runs it on latest set of
   * incoming values by emitting to `.control`.
   * 
   */
  public get control() { return this._control; }

  public clear() {
    this._relay.clear();
    this._control.clear();
    this._all_subs.unsubscribe();
    return super.clear();
  }
}


/**
 * 
 * Creates an [invoke](https://connective.dev/docs/invoke) agent. Invoke
 * agents create an inner-agent using the given factory in response to each set of incoming inputs
 * and emit the first output of the inner-agent in response.
 * [Checkout the docs](https://connective.dev/docs/invoke) for examples and further information.
 * 
 * @param ref the agent factory to be used to create inner-agents
 * @param signature the signature of the inner-agents. If not provided and not deducable from
 * the factory function, the factory function will be invoked once to deduce this.
 * 
 */
export function invoke(ref: AgentFactory, signature?: Signature) { return new Invoke(ref, signature); }


export default invoke;
