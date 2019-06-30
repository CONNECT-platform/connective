import { Tracker } from '../shared/tracker';

import { PinMap } from '../pin/pin-map';
import { PinLike } from '../pin/pin-like';
import { Pin } from '../pin/pin';

import { InputNotInSignature,
        OutputNotInSignature } from './errors/signature-mismatch.error';
import { Signature } from './signature';
import { AgentLike } from './agent-like';


export class Agent extends Tracker implements AgentLike {
  private _inputs: PinMap;
  private _outputs: PinMap;

  constructor(readonly signature: Signature) {
    super();
    this._inputs = new PinMap(label => this.createInput(label));
    this._outputs = new PinMap(label => this.createOutput(label));
  }

  public in(label: string | number) { return this._inputs.get(label.toString()); }
  public out(label: string | number) { return this._outputs.get(label.toString()); }

  public get inputs(): PinMap { return this._inputs; }
  public get outputs(): PinMap { return this._outputs; }

  public clear(): this {
    this._inputs.clear();
    this._outputs.clear();

    return super.clear();
  }

  protected checkInput(label: string) {
    if (!this.signature.inputs || !this.signature.inputs.includes(label))
      throw new InputNotInSignature(label, this.signature);
  }

  protected checkOutput(label: string) {
    if (!this.signature.outputs.includes(label))
      throw new OutputNotInSignature(label, this.signature);
  }

  protected createInput(label: string): PinLike {
    this.checkInput(label);
    return new Pin();
  }

  protected createOutput(label: string): PinLike {
    this.checkOutput(label);
    return new Pin();
  }
}
