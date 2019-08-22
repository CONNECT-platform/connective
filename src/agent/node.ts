import { ContextType, ErrorCallback } from '../shared/types';

import { PinLike } from '../pin/pin-like';
import control, { Control } from '../pin/control';
import pack from '../pin/pack';
import filter from '../pin/filter';
import map from '../pin/map';

import { OutputNotInSignature } from './errors/signature-mismatch.error';
import { InsufficientInputs } from './errors/insufficient-input.error';

import { Signature } from './signature';
import { Agent } from './agent';
import { NodeLike } from './node-like';


export type NodeInputs = ContextType;
export type NodeOutput = (out: string, data?: any) => void;


export interface NodeSignature extends Signature {
  required?: string[];
}


export abstract class Node extends Agent implements NodeLike {
  private _control: Control;
  private _res: PinLike;

  private _control_required = true;

  constructor(signature: NodeSignature) {
    super(signature);

    this._control = control();

    this._res =
    pack(this.inputs, this.control.to(map(() => this._control_required = false)))
    .to(filter(() => !this._control_required))
    .to(map((all, callback, error, context) => {
      if (this._control.connected)
        this._control_required = true;
      if (signature.required && signature.required.some(label => !(all && all[0] && label in all[0])))
        error(new InsufficientInputs(signature.required.filter(label => !(all && all[0] && label in all[0]))));
      else {
        this.run(all[0], (out: string, data?: any) => {
          if (!this.signature.outputs.includes(out)) {
            error(new OutputNotInSignature(out, this.signature));
          }
          else {
            callback({out, data});
          }
        }, error, context);
      }
    }));
  }

  public get control(): Control { return this._control; }

  protected abstract run(
    inputs: NodeInputs,
    output: NodeOutput,
    error: ErrorCallback,
    context: ContextType,
  ): void;

  protected createOutput(label: string): PinLike {
    return this._res
      .to(filter((res: any) => res.out == label))
      .to(map((res: any) => res.data))
    ;
  }

  protected createEntries() {  return (this.signature.inputs || []).map(i => this.in(i)); }
  protected createExits() { return this.signature.outputs.map(o => this.out(o)); }

  clear() {
    this.control.clear();
    return super.clear();
  }
}


export type NodeRunFunc = (inputs: NodeInputs, output: NodeOutput, error: ErrorCallback, context: ContextType) => void;


class _CodeNode extends Node {
  constructor(signature: Signature, private _run: NodeRunFunc) { super(signature); }

  protected run(inputs: NodeInputs, output: NodeOutput,
    error: ErrorCallback, context: ContextType)
    { this._run.apply(this, [inputs, output, error, context])};
}

export function node(signature: Signature, run: NodeRunFunc) { return () => new _CodeNode(signature, run); }


export default node;
