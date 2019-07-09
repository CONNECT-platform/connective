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

  private _counter = 0;
  private _head = 0;

  constructor(signature: NodeSignature) {
    super(signature);

    this._control = control();

    this._res = map((all, callback, error, context) => {
      if (this._control.connected)
        this._head++;
      if (signature.required && signature.required.some(label => !(label in all[0])))
        error(new InsufficientInputs(signature.required.filter(label => !(label in all[0]))));
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
    })
    .from(filter(() => this._counter > this._head)
      .from(pack(this.inputs, map(() => ++this._counter).from(this.control)))
    );
  }

  public get control(): Control { return this._control; }

  protected abstract run(
    inputs: NodeInputs,
    output: NodeOutput,
    error: ErrorCallback,
    context: ContextType,
  ): void;

  protected createOutput(label: string): PinLike {
    return map((res: any) => res.data)
      .from(
        filter((res: any) => res.out == label)
        .from(this._res)
      )
  }

  clear() {
    this.control.clear();
    return super.clear();
  }
}
